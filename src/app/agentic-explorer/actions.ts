'use server';

import {
  exploreAndExplainRepo,
  type AgenticExplorerOutput,
} from '@/ai/flows/agentic-explorer';
import { z } from 'zod';

const AgenticExplorerSchema = z.object({
  repoUrl: z.string().url({ message: 'Please enter a valid GitHub repository URL.' }),
  question: z
    .string()
    .min(10, { message: 'Your question must be at least 10 characters long.' })
    .max(500, { message: 'Your question must be 500 characters or less.' }),
});

export type AgenticExplorerState = {
  result: AgenticExplorerOutput | null;
  error: string | null;
};

export async function handleAgenticExplorerAction(
  prevState: AgenticExplorerState,
  formData: FormData
): Promise<AgenticExplorerState> {
  const repoUrl = formData.get('repoUrl') as string;
  const question = formData.get('question') as string;

  const validation = AgenticExplorerSchema.safeParse({ repoUrl, question });

  if (!validation.success) {
    return {
      result: null,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  try {
    const result = await exploreAndExplainRepo({
      repoUrl: validation.data.repoUrl,
      question: validation.data.question,
    });
    return { result, error: null };
  } catch (e: any) {
    console.error(e);
    return {
      result: null,
      error: e.message || 'An unexpected error occurred.',
    };
  }
}
