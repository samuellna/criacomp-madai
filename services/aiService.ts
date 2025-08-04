import { TaskExtraction } from "@/types";
import api from "./apiConnection";

import * as FileSystem from "expo-file-system";

// Transcrição de áudio usando OpenAI Whisper
export const transcribeAudio = async (audioFile: FormData): Promise<string> => {
  try {
    const response = await api.post("/audio/transcriptions", audioFile, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.text;
  } catch (error: any) {
    console.error(
      "OpenAI Transcription Error:",
      error.response?.data || error.message
    );
    throw new Error("Transcription failed");
  }
};

// Detalhamento de tarefa a partir de transcrição de voz
export const extractDetailedTranscript = async (
  transcript: string
): Promise<string> => {
  const messages = [
    {
      role: "system",
      content: `Você é um assistente inteligente que ajuda estudantes e profissionais a detalharem tarefas faladas em planos de ação claros, voltados para estudo ou produtividade.
      Dada uma transcrição de voz (geralmente informal e em português, inglês ou misturado), retorne um detalhamento da tarefa em português, formatado em Markdown, com a seguinte estrutura:
      
      ## Resumo da tarefa  
      Reformule a tarefa mencionada em um parágrafo claro e objetivo.

      ## Passo a passo sugerido  
      Liste ações práticas que o usuário deve seguir para realizar a tarefa com eficiência.

      ## Cronograma sugerido  
      Sugira uma divisão temporal das subtarefas, com base no prazo mencionado, se houver.

      ## Fontes confiáveis de apoio  
      Liste pelo menos 3 fontes úteis, como vídeos, artigos ou apostilas, adequadas ao tipo de tarefa (estudo ou produtividade), usando fontes confiáveis como YouTube educacional, Khan Academy, Scielo, Sebrae, etc.

      Instruções:  
      - Adapte o nível de detalhamento para estudantes universitários ou jovens profissionais.  
      - Seja proativo ao inferir prazos e organizar subtarefas.  
      - Sempre responda em português, mesmo que a entrada esteja em outro idioma.  
      - Retorne somente o conteúdo em Markdown.  
      - Não inclua explicações adicionais nem comentários fora da estrutura pedida.`,
    },
    {
      role: "user",
      content: `Extract task details from: "${transcript}"`,
    },
  ];

  try {
    const response = await api.post(
      "/chat/completions",
      {
        model: "gpt-4.1",
        messages,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data.choices[0].message.content.trim();

    return result;
  } catch (error: any) {
    console.error(
      "Erro ao extrair tarefa:",
      error?.response?.data || error.message
    );
    throw new Error("Falha ao extrair a tarefa do transcript.");
  }
};

// Geração de tarefa estruturada a partir da transcrição detalhada
export const generateTask = async (
  detailedTranscription: string
): Promise<TaskExtraction> => {
  const messages = [
    {
      role: "system" as const,
      content: `Você é um assistente que transforma transcrições de voz informais em objetos de tarefa bem estruturados. Receberá uma transcrição falada e deve retornar exclusivamente um objeto JSON com as seguintes chaves:
      {
        "title": "Título breve e claro da tarefa",
        "description": "Descrição com 1-3 frases explicando a tarefa de forma prática",
        "category": "estudo", "trabalho" ou "pessoal",
        "priority": "low", "medium" ou "high",
        "due_date": "em formato ISO 8601 (ex: 2025-08-01T00:00:00Z)"
      }
      Instruções:
      - Sempre responda em português.
      - Infira o campo 'due_date' com base em expressões como 'amanhã', 'daqui a uma semana', etc.
      - Caso o ano não seja mencionado, use o ano atual.
      - Não inclua explicações, comentários ou markdown. Apenas o JSON puro.`,
    },
    {
      role: "user" as const,
      content: `Transcrição: ${detailedTranscription}`,
    },
  ];

  const response = await api.post(
    "/chat/completions",
    {
      model: "gpt-4.1",
      messages,
      temperature: 0.7,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const raw = response.data.choices[0].message.content.trim();

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed.title &&
      parsed.description &&
      parsed.category &&
      parsed.priority &&
      parsed.due_date
    ) {
      return parsed as TaskExtraction;
    }
  } catch (err) {
    console.warn(
      "Resposta fora do padrão JSON. Tentando extrair trecho válido...",
      err
    );

    const jsonMatch = raw.match(/{[\s\S]+}/);
    if (jsonMatch) {
      try {
        const fallbackParsed = JSON.parse(jsonMatch[0]);
        if (
          fallbackParsed.title &&
          fallbackParsed.description &&
          fallbackParsed.category &&
          fallbackParsed.priority &&
          fallbackParsed.due_date
        ) {
          return fallbackParsed as TaskExtraction;
        }
      } catch (fallbackErr) {
        console.error("Erro ao fazer fallback parse:", fallbackErr);
      }
    }
  }
  console.error("Resposta inválida:", raw);
  throw new Error("Falha ao extrair a tarefa estruturada da transcrição.");
};

export const generateTaskGuidance = async (
  title: string,
  description: string
): Promise<{ guide: string; sources: string[] }> => {
  const messages = [
    {
      role: "system" as const,
      content: `Você é um assistente prático e direto que ajuda estudantes e profissionais a começarem suas tarefas com eficiência. Com base na tarefa a seguir, retorne exclusivamente um objeto JSON com o seguinte formato:
      {
        "guia": "Um texto de 2 a 3 frases explicando como começar essa tarefa, de forma prática e objetiva.",
        "fontes": ["Sugestão 1 de fonte ou termo de busca", "Sugestão 2"]
      }
      Instruções:
      - Sempre responda em português.
      - Use uma linguagem clara, amigável e voltada à ação.
      - As fontes podem ser nomes de canais do YouTube, termos para pesquisar, sites confiáveis ou tutoriais.
      - NUNCA inclua texto fora do JSON. NUNCA use markdown. Apenas o JSON puro.`,
    },
    {
      role: "user" as const,
      content: `Tarefa: ${title}\nDescrição: ${description}`,
    },
  ];

  const response = await api.post(
    "/chat/completions",
    {
      model: "gpt-4.1",
      messages,
      temperature: 0.7,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const raw = response.data.choices[0].message.content.trim();

  try {
    const parsed = JSON.parse(raw);
    console.log("Parsed guidance:", parsed);
    return {
      guide: parsed.guia,
      sources: parsed.fontes,
    };
  } catch (err) {
    console.warn(
      "⚠️ Resposta fora do padrão JSON. Tentando limpar e parsear...",
      err
    );

    const jsonMatch = raw.match(/{[\s\S]+}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseErr) {
        console.error(
          "Erro ao parsear trecho JSON encontrado:",
          jsonMatch[0],
          parseErr
        );
      }
    }

    console.error("❌ Resposta inválida:", raw);
    throw new Error("Resposta da OpenAI não foi um JSON válido.");
  }
};

export const generateRoastAudio = async (
  taskId: string,
  taskTitle: string,
  taskDescription: string
): Promise<string> => {
  const filePath = `${FileSystem.documentDirectory}roast-${taskId}.mp3`;

  // Retorna o arquivo local se já existir
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  if (fileInfo.exists) {
    return filePath;
  }

  const systemPrompt = `
    Você é um coach de produtividade irritado, grosseiro e boca suja. 
    Seu trabalho é fazer o usuário se sentir envergonhado por deixar uma tarefa pendente.

    - Use palavrões, gagueiras, suspiros
    - Fale como se estivesse **com muita raiva**
    - Máximo de 25 palavras, em **português do Brasil**
    - Soe **acelerado, debochado, impaciente**
    - Isso será lido com uma voz robótica, então escreva com pausas e entonação

    Não seja educado. Nunca. Seja ofensivo, rápido e direto ao ponto.
  `;

  const userPrompt = `
    Tarefa pendente:
    Título: "${taskTitle}"
    Descrição: "${taskDescription}"

    Agora xinga o usuário, em português do Brasil. Seja escroto.
  `;

  // Gera o texto da bronca
  const chatResponse = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt.trim() },
          { role: "user", content: userPrompt.trim() },
        ],
      }),
    }
  );

  if (!chatResponse.ok) {
    throw new Error("Erro ao gerar o texto da bronca");
  }

  const chatData = await chatResponse.json();
  const roastText = chatData.choices[0].message.content;

  // Gera o áudio via TTS
  const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      voice: "nova",
      input: roastText,
    }),
  });

  if (!ttsResponse.ok) {
    throw new Error("Erro ao gerar o áudio da bronca");
  }

  // Converte Blob em base64 usando FileReader
  const blob = await ttsResponse.blob();
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(",")[1]; // remove o prefixo "data:audio/mp3;base64,"
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  // Salva o áudio como arquivo
  await FileSystem.writeAsStringAsync(filePath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return filePath;
};
