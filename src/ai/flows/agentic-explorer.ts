'use server';
/**
 * @fileOverview An agentic flow for exploring a GitHub repository to answer a high-level question.
 *
 * - exploreAndExplainRepo - An agentic flow that uses tools to explore a repository and answer a question.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { listRepoFiles, getFileContent } from './explore-repo'; // Reuse existing tools

// Schema for the agentic flow input
const AgenticExplorerInputSchema = z.object({
  repoUrl: z.string().url().describe('The URL of the GitHub repository.'),
  question: z
    .string()
    .describe(
      'A high-level question about the repository (e.g., "What is the purpose of this app?", "Explain the authentication flow.").'
    ),
});
export type AgenticExplorerInput = z.infer<typeof AgenticExplorerInputSchema>;

// Schema for the agentic flow output
const AgenticExplorerOutputSchema = z.object({
  answer: z
    .string()
    .describe(
      'A comprehensive, markdown-formatted answer to the user\'s question, synthesized from one or more repository files.'
    ),
  filesInspected: z
    .array(z.string())
    .describe('An array of the file paths that the AI chose to inspect to formulate the answer.'),
});
export type AgenticExplorerOutput = z.infer<typeof AgenticExplorerOutputSchema>;


// The main agentic flow
export const exploreAndExplainRepo = ai.defineFlow(
  {
    name: 'exploreAndExplainRepo',
    inputSchema: AgenticExplorerInputSchema,
    outputSchema: AgenticExplorerOutputSchema,
  },
  async ({ repoUrl, question }) => {
    
    const llmResponse = await ai.generate({
      prompt: `You are an expert software architect. Your goal is to answer a question about a GitHub repository.
      
      To do this, you can use the provided tools to list the files in the repository and read the content of specific, relevant files.
      
      Do not guess. Use the tools to gather the information you need before formulating your answer.
      
      Based on the file contents, provide a comprehensive, markdown-formatted answer to the user's question. Also, list the files you inspected.
      
      IMPORTANT: Your final output must be a JSON object that strictly follows the provided output schema.

      Repository URL: ${repoUrl}
      Question: ${question}`,
      
      tools: [listRepoFiles, getFileContent],
      
      // Use a more capable model for agentic reasoning
      model: 'googleai/gemini-2.5-flash',
    });

    return llmResponse.output;
  }
);
