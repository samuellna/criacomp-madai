import { TaskExtraction } from "@/types";
import api from "./apiConnection";

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

export const extractTaskFromTranscript = async (
  transcript: string
): Promise<TaskExtraction> => {
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
        model: "gpt-4.1", // ou "gpt-3.5-turbo"
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
    console.log("Extracted task details:", result);

    return result as TaskExtraction;
  } catch (error: any) {
    console.error(
      "Erro ao extrair tarefa:",
      error?.response?.data || error.message
    );
    throw new Error("Falha ao extrair a tarefa do transcript.");
  }
};

export const generateTaskGuidance = async (
  title: string,
  description: string
): Promise<{ guide: string; sources: string[] }> => {
  const messages = [
    {
      role: "system" as const,
      content: `Based on the task provided, generate a helpful getting-started guide and suggest 2 relevant sources. Return a JSON object with:
      - guide: string (concise 2-3 sentence guide on how to begin)
      - sources: string[] (2 helpful search terms, tutorial names, or resource suggestions)
      
      Keep it practical and actionable.`,
    },
    {
      role: "user" as const,
      content: `Task: ${title}\nDescription: ${description}`,
    },
  ];

  const response = await fetch("https://toolkit.rork.com/text/llm/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error("Guidance generation failed");
  }

  const result = await response.json();
  return JSON.parse(result.completion);
};

export const generateRoastMessage = async (
  taskTitle: string,
  overdueMinutes: number
): Promise<string> => {
  const messages = [
    {
      role: "system" as const,
      content: `You are a sarcastic, aggressive productivity coach. The user has an overdue task. Generate a short, witty roast message that's motivating but brutally honest. Keep it under 50 words and make it sting a little.`,
    },
    {
      role: "user" as const,
      content: `Task "${taskTitle}" is ${overdueMinutes} minutes overdue. Roast me.`,
    },
  ];

  const response = await fetch("https://toolkit.rork.com/text/llm/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error("Roast generation failed");
  }

  const result = await response.json();
  return result.completion;
};
