'use server';

import { explainCode, ExplainCodeOutput } from '@/ai/flows/explain-code';
import { z } from 'zod';

const explainSchema = z.object({
    repoUrl: z.string().url({ message: 'Please enter a valid repository URL.' }),
    filePath: z.string().min(1, { message: 'File path cannot be empty.' }),
});

export type ExplainFormState = {
  data: ExplainCodeOutput | null;
  error: string | null;
  success: boolean;
};

export async function handleExplainSubmission(
  prevState: ExplainFormState,
  formData: FormData
): Promise<ExplainFormState> {
  
  const validatedFields = explainSchema.safeParse({
    repoUrl: formData.get('repoUrl'),
    filePath: formData.get('filePath'),
  });

  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.errors.map((e) => e.message).join(', '),
      success: false,
    };
  }

  try {
    const result = await explainCode(validatedFields.data);
    return { data: result, error: null, success: true };
  } catch (e: any) {
    console.error(e);
    return {
      data: null,
      error: e.message || 'An unexpected error occurred. Please try again.',
      success: false,
    };
  }
}
