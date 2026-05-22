import { NextRequest, NextResponse } from 'next/server';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const ADMIN_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || 'amor123';

function authenticateAdmin(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return false;
  return authHeader === ADMIN_PASSCODE;
}

export async function GET(req: NextRequest) {
  // Authorize
  if (!authenticateAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const listPath = 'paginas';
    const pagesCollection = collection(db, 'paginas');
    const querySnapshot = await getDocs(pagesCollection);
    
    const paginasList: any[] = [];
    querySnapshot.forEach((docSnap) => {
      paginasList.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Sort by creation date descending
    paginasList.sort((a, b) => {
      const dateA = new Date(a.criado_em || 0).getTime();
      const dateB = new Date(b.criado_em || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(paginasList);
  } catch (err) {
    console.error('Error fetching pages list for admin:', err);
    return NextResponse.json({ error: 'Erro ao listar as páginas do banco.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  // Authorize
  if (!authenticateAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID ausente.' }, { status: 400 });
    }

    const docPath = `paginas/${id}`;
    try {
      const docRef = doc(db, 'paginas', id);
      await deleteDoc(docRef);
    } catch (dbError) {
      handleFirestoreError(dbError, OperationType.DELETE, docPath);
    }

    return NextResponse.json({ success: true, message: 'Página deletada com sucesso.' });
  } catch (err: any) {
    console.error('Error deleting page:', err);
    return NextResponse.json({ error: err?.message || 'Erro ao deletar página.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  // Authorize
  if (!authenticateAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, dados } = body;

    if (!id || !dados) {
      return NextResponse.json({ error: 'Dados ou ID ausentes.' }, { status: 400 });
    }

    const docPath = `paginas/${id}`;
    try {
      const docRef = doc(db, 'paginas', id);
      await updateDoc(docRef, { dados });
    } catch (dbError) {
      handleFirestoreError(dbError, OperationType.UPDATE, docPath);
    }

    return NextResponse.json({ success: true, message: 'Página atualizada com sucesso.' });
  } catch (err: any) {
    console.error('Error updating page from admin:', err);
    return NextResponse.json({ error: err?.message || 'Erro ao atualizar página.' }, { status: 500 });
  }
}
