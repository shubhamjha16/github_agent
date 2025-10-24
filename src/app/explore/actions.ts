'use server';

import { listRepoFiles, explainRepoFile, type ExplainRepoFileOutput } from '@/ai/flows/explore-repo';
import { z } from 'zod';

const repoUrlSchema = z.string().url({ message: 'Please enter a valid GitHub repository URL.' });
const filePathSchema = z.string().min(1, { message: 'Please select a file to explain.' });

// State for the multi-step form
export type RepoExplorerState = {
  step: 'initial' | 'files_listed' | 'explanation_generated';
  repoUrl: string | null;
  files: string[] | null;
  explanationResult: ExplainRepoFileOutput | null;
  error: string | null;
  isSubmittingFiles: boolean;
  isSubmittingFileSelection: boolean;
};

export async function handleRepoExplorerAction(
  prevState: RepoExplorerState,
  formData: FormData
): Promise<RepoExplorerState> {
    const formStep = formData.get('step');
    const repoUrl = formData.get('repoUrl') as string;

    if (formStep === 'listFiles') {
        const validatedRepoUrl = repoUrlSchema.safeParse(repoUrl);

        if (!validatedRepoUrl.success) {
            return {
                step: 'initial',
                repoUrl: null,
                files: null,
                explanationResult: null,
                error: validatedRepoUrl.error.errors.map((e) => e.message).join(', '),
                isSubmittingFiles: false,
                isSubmittingFileSelection: false,
            };
        }

        try {
            const { files } = await listRepoFiles({ repoUrl: validatedRepoUrl.data });
            return {
                step: 'files_listed',
                repoUrl: validatedRepoUrl.data,
                files: files,
                explanationResult: null,
                error: null,
                isSubmittingFiles: false,
                isSubmittingFileSelection: false,
            };
        } catch (e: any) {
            console.error(e);
            return {
                step: 'initial',
                repoUrl: null,
                files: null,
                explanationResult: null,
                error: e.message || 'An unexpected error occurred while listing files.',
                isSubmittingFiles: false,
                isSubmittingFileSelection: false,
            };
        }

    } else if (formStep === 'explainFile') {
        const filePath = formData.get('filePath') as string;

        const validatedRepoUrl = repoUrlSchema.safeParse(repoUrl);
        const validatedFilePath = filePathSchema.safeParse(filePath);

        if (!validatedRepoUrl.success || !validatedFilePath.success) {
            const urlErrors = validatedRepoUrl.success ? [] : validatedRepoUrl.error.errors;
            const fileErrors = validatedFilePath.success ? [] : validatedFilePath.error.errors;
            return {
                ...prevState, // Keep previous state like file list
                step: 'files_listed',
                explanationResult: null,
                error: [...urlErrors, ...fileErrors].map((e) => e.message).join(', '),
            };
        }

        try {
            const result = await explainRepoFile({ repoUrl, filePath });
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

    // Reset to initial state if action is unknown
    return {
        step: 'initial',
        repoUrl: null,
        files: null,
        explanationResult: null,
        error: "Unknown action.",
        isSubmittingFiles: false,
        isSubmittingFileSelection: false,
    };
}
