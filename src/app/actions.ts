
'use server';

import { generateGitCommandsFromPrompt, GenerateGitCommandsFromPromptOutput } from '@/ai/flows/generate-git-commands-from-prompt';
import { z } from 'zod';

const promptSchema = z.string().min(5, { message: 'Prompt must be at least 5 characters long.' }).max(200, { message: 'Prompt must be 200 characters or less.' });

export type FormState = {
  data: GenerateGitCommandsFromPromptOutput | null;
  error: string | null;
  success: boolean;
};

export async function handlePromptSubmission(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const prompt = formData.get('prompt');

  const validatedPrompt = promptSchema.safeParse(prompt);

  if (!validatedPrompt.success) {
    return {
      data: null,
      error: validatedPrompt.error.errors[0].message,
      success: false,
    };
  }

  try {
    const result = await generateGitCommandsFromPrompt({ prompt: validatedPrompt.data });
    if (!result.commands || result.commands.length === 0) {
      return {
        data: null,
        error: "Couldn't generate commands for this prompt. Please try a different one.",
        success: false,
      };
    }
    return { data: result, error: null, success: true };
  } catch (e) {
    console.error(e);
    return {
      data: null,
      error: 'An unexpected error occurred. Please try again.',
      success: false,
    };
  }
}
