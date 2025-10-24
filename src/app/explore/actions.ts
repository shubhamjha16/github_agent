'use server';

import { listRepoFiles, explainRepoFile, ExplainRepoFileOutput } from '@/ai/flows/explore-repo';
import { z } from 'zod';

const listFilesSchema = z.object({
  repoUrl: z.string().url({ message: 'Please enter a valid GitHub repository URL.' }),
});

const explainFileSchema = z.object({
    repoUrl: z.string().url(),
    filePath: z.string().min(1, { message: 'Please select a file to explain.'})
});

// State for the multi-step form
export type RepoExplorerState = {
  step: 'initial' | 'files_listed' | 'explanation_generated';
  repoUrl: string | null;
  files: string[] | null;
  explanationResult: ExplainRepoFileOutput | null;
  error: string | null;
};

export async function handleRepoUrlSubmission(
  prevState: RepoExplorerState,
  formData: FormData
): Promise<RepoExplorerState> {
  
  const validatedFields = listFilesSchema.safeParse({
    repoUrl: formData.get('repoUrl'),
  });

  if (!validatedFields.success) {
    return {
      ...initialState,
      error: validatedFields.error.errors.map((e) => e.message).join(', '),
    };
  }

  try {
    const { files } = await listRepoFiles(validatedFields.data);
    return {
      ...initialState,
      step: 'files_listed',
      repoUrl: validatedFields.data.repoUrl,
      files: files,
    };
  } catch (e: any) {
    console.error(e);
    return {
      ...initialState,
      error: e.message || 'An unexpected error occurred while listing files.',
    };
  }
}

export async function handleFileSelectionSubmission(
    prevState: RepoExplorerState,
    formData: FormData
  ): Promise<RepoExplorerState> {

    const validatedFields = explainFileSchema.safeParse({
      repoUrl: formData.get('repoUrl'),
      filePath: formData.get('filePath'),
    });
  
    if (!validatedFields.success) {
      return {
        ...prevState, // Keep previous state like file list
        step: 'files_listed',
        explanationResult: null,
        error: validatedFields.error.errors.map((e) => e.message).join(', '),
      };
    }
  
    try {
      const result = await explainRepoFile(validatedFields.data);
      return {
        ...prevState,
        step: 'explanation_generated',
        explanationResult: result,
        error: null,
      };
    } catch (e: any) {
      console.error(e);
      return {
        ...prevState,
        step: 'files_listed',
        explanationResult: null,
        error: e.message || 'An unexpected error occurred while explaining the file.',
      };
    }
  }

export const initialState: RepoExplorerState = {
    step: 'initial',
    repoUrl: null,
    files: null,
    explanationResult: null,
    error: null,
};
