import { TaskExtraction } from '@/types';

export const transcribeAudio = async (audioFile: FormData): Promise<string> => {
  const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
    method: 'POST',
    body: audioFile
  });

  if (!response.ok) {
    throw new Error('Transcription failed');
  }

  const result = await response.json();
  return result.text;
};

export const extractTaskFromTranscript = async (transcript: string): Promise<TaskExtraction> => {
  const messages = [
    {
      role: 'system' as const,
      content: `Extract task information from the user's speech. Return a JSON object with these exact fields:
      - title: string (short task name)
      - description: string (detailed description)
      - category: string (work, personal, health, etc.)
      - priority: "low" | "medium" | "high"
      - due_date: string (ISO date format, if mentioned, otherwise set to 24 hours from now)
      
      If information is missing, make reasonable assumptions based on context.`
    },
    {
      role: 'user' as const,
      content: `Extract task details from: "${transcript}"`
    }
  ];

  const response = await fetch('https://toolkit.rork.com/text/llm/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages })
  });

  if (!response.ok) {
    throw new Error('Task extraction failed');
  }

  const result = await response.json();
  return JSON.parse(result.completion);
};

export const generateTaskGuidance = async (title: string, description: string): Promise<{ guide: string; sources: string[] }> => {
  const messages = [
    {
      role: 'system' as const,
      content: `Based on the task provided, generate a helpful getting-started guide and suggest 2 relevant sources. Return a JSON object with:
      - guide: string (concise 2-3 sentence guide on how to begin)
      - sources: string[] (2 helpful search terms, tutorial names, or resource suggestions)
      
      Keep it practical and actionable.`
    },
    {
      role: 'user' as const,
      content: `Task: ${title}\nDescription: ${description}`
    }
  ];

  const response = await fetch('https://toolkit.rork.com/text/llm/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages })
  });

  if (!response.ok) {
    throw new Error('Guidance generation failed');
  }

  const result = await response.json();
  return JSON.parse(result.completion);
};

export const generateRoastMessage = async (taskTitle: string, overdueMinutes: number): Promise<string> => {
  const messages = [
    {
      role: 'system' as const,
      content: `You are a sarcastic, aggressive productivity coach. The user has an overdue task. Generate a short, witty roast message that's motivating but brutally honest. Keep it under 50 words and make it sting a little.`
    },
    {
      role: 'user' as const,
      content: `Task "${taskTitle}" is ${overdueMinutes} minutes overdue. Roast me.`
    }
  ];

  const response = await fetch('https://toolkit.rork.com/text/llm/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages })
  });

  if (!response.ok) {
    throw new Error('Roast generation failed');
  }

  const result = await response.json();
  return result.completion;
};