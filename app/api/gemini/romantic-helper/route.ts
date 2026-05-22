import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { messageType, tone, partnerName, userName, memories, length } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { text: "Meu amor, as palavras me faltam agora (AI key is missing), mas meu sentimento por você é infinito! 💕" }
      );
    }

    const typeWord = messageType || 'carta de amor';
    const toneWord = tone || 'apaixonado e romântico';
    const partner = partnerName || 'meu amor';
    const user = userName || 'seu par';
    const memoryContext = memories ? `Inclua com carinho estas memórias ou detalhes especiais: "${memories}"` : '';
    const lengthLimit = length || 'curto (um ou dois parágrafos)';

    const prompt = `Escreva uma mensagem de amor comovente em português. 
Tipo de mensagem: ${typeWord}
Tom e estilo: ${toneWord}
Destinatário (parceiro/a): ${partner}
Remetente (usuário): ${user}
Tamanho: ${lengthLimit}

${memoryContext}

Instruções adicionais: Evite clichês artificiais de IA. Escreva de forma fluida, genuína, calorosa e comovente, como um ser humano verdadeiramente apaixonado escreveria. Não inclua placeholders como "[Seu Nome]" na resposta final; use os dados passados ou finalize de forma poética.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 1.0,
      }
    });

    return NextResponse.json({ text: response.text });
  } catch (err: any) {
    console.error('Error in romantic helper endpoint:', err);
    return NextResponse.json(
      { error: 'Não foi possível gerar a mensagem de amor.' },
      { status: 500 }
    );
  }
}
