import { NextRequest, NextResponse } from 'next/server';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch directly from Firestore collection 'paginas'
    const docPath = `paginas/${id}`;
    try {
      const docRef = doc(db, 'paginas', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return NextResponse.json({ error: 'Página romântica não encontrada.' }, { status: 404 });
      }

      return NextResponse.json(docSnap.data());
    } catch (dbError) {
      handleFirestoreError(dbError, OperationType.GET, docPath);
    }
  } catch (err: any) {
    console.error('Error fetching page:', err);
    return NextResponse.json({ error: 'Erro interno ao buscar dados da página.' }, { status: 500 });
  }
}
