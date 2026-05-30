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
    const { messageType, tone, partnerName, userName, memories, length, relationshipAge, subtitulo } = await req.json();

    console.log("--- ROMANTIC HELPER API RECEIVED REQUEST ---");
    console.log("GEMINI_API_KEY in process.env:", process.env.GEMINI_API_KEY ? "PRESENT (Starts with: " + process.env.GEMINI_API_KEY.substring(0, 10) + "...)" : "MISSING");
    console.log("Request Body:", { messageType, tone, partnerName, userName, memories, length, relationshipAge, subtitulo });

    if (!process.env.GEMINI_API_KEY) {
      console.log("WARNING: GEMINI_API_KEY is missing in process.env! Returning fallback.");
      return NextResponse.json(
        { text: "Meu amor, as palavras me faltam agora (AI key is missing), mas meu sentimento por você é infinito! 💕" }
      );
    }

    const typeWord = messageType || 'carta de amor';
    const toneWord = tone || 'apaixonado e romântico';
    const partner = partnerName || 'meu amor';
    const user = userName || 'seu par';
    const lengthLimit = length || 'curto (um ou dois parágrafos)';

    const prompt = `Você deve escrever uma declaração de amor personalizada e comovente em português.

DADOS DO CASAL:
- Remetente (quem envia): ${user}
- Destinatário (quem recebe): ${partner}
- Tempo de Relacionamento: ${relationshipAge || 'não especificado'}
- Subtítulo da página do casal: "${subtitulo || ''}"

CONFIGURAÇÕES DA MENSAGEM:
- Tipo de Texto: ${typeWord} (ex: poema, carta de amor, recado fofo, promessa)
- Tom/Estilo: ${toneWord} (ex: apaixonado, emocionante, divertido, poético)
- Tamanho: ${lengthLimit}

MEMÓRIAS E DETALHES COMPARTILHADOS (USE E VALORIZE MUITO ESTES PONTOS):
"${memories || 'Use a criatividade para fazer uma declaração linda baseada nos nomes do casal e na sua conexão.'}"

INSTRUÇÕES CRÍTICAS DE ESTILO:
1. Escreva como um ser humano real, sensível e genuinamente apaixonado. Evite clichês chatos de robôs (ex: fórmulas prontas, frases frias).
2. Tente incorporar de forma natural e fofa os nomes, o tempo de relacionamento e principalmente as memórias ou piadas internas fornecidas.
3. Não use placeholders como "[Seu Nome]", "[Nome do Parceiro]" ou "[Data]". O texto deve vir 100% pronto e polido para leitura.
4. Se o tom for divertido, misture piadas leves/fofas com sentimentos reais. Se for poema, cuide da sonoridade e ritmo.
5. Escreva diretamente a mensagem final gerada, sem introduções ou explicações do tipo "Aqui está a mensagem".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Você é um Cupido de Inteligência Artificial com extrema sensibilidade emocional, empatia e talento literário. Seu objetivo é ajudar casais a expressarem seus sentimentos mais profundos através de mensagens personalizadas, tocantes e autênticas. Adapte o vocabulário e a profundidade conforme as memórias e estilo solicitados, escrevendo de forma orgânica e fluida.",
        temperature: 0.9,
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
