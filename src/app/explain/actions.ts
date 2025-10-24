'use server';

import { explainWebPage, ExplainWebPageOutput } from '@/ai/flows/explain-code';
import { z } from 'zod';

const explainSchema = z.object({
    url: z.string().url({ message: 'Please enter a valid URL.' }),
});

export type ExplainFormState = {
  data: ExplainWebPageOutput | null;
  error: string | null;
  success: boolean;
};

export async function handleExplainSubmission(
  prevState: ExplainFormState,
  formData: FormData
): Promise<ExplainFormState> {
  
  const validatedFields = explainSchema.safeParse({
    url: formData.get('url'),
  });

  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.errors.map((e) => e.message).join(', '),
      success: false,
    };
  }

  try {
    const result = await explainWebPage(validatedFields.data);
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
