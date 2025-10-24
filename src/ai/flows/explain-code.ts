'use server';

/**
 * @fileOverview This file defines a Genkit flow to explain code from a GitHub repository.
 *
 * - explainCode - A function that fetches a file from a GitHub repo and explains it.
 * - ExplainCodeInput - The input type for the explainCode function.
 * - ExplainCodeOutput - The return type for the explainCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainCodeInputSchema = z.object({
  repoUrl: z.string().url().describe('The URL of the GitHub repository.'),
  filePath: z.string().describe('The path to the file within the repository.'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

const ExplainCodeOutputSchema = z.object({
  filePath: z.string().describe('The path of the file that was analyzed.'),
  content: z.string().describe('The content of the file.'),
  explanation: z.string().describe('A detailed explanation of the code.'),
});
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;


const getRepoFileContent = ai.defineTool(
    {
      name: 'getRepoFileContent',
      description: 'Fetches the content of a file from a given GitHub repository URL.',
      inputSchema: ExplainCodeInputSchema,
      outputSchema: z.object({
        filePath: z.string(),
        content: z.string(),
      }),
    },
    async ({ repoUrl, filePath }) => {
      console.log(`Simulating fetching content for ${filePath} from ${repoUrl}`);
      // In a real application, you would use the GitHub API to fetch the file content.
      // This requires handling authentication (OAuth) and making an HTTP request.
      // For this demo, we'll return a simulated file content.

      const isTsx = filePath.endsWith('.tsx');
      const simulatedContent = `
  // Path: ${filePath}
  // This is a simulated file content. In a real app, this would be the actual code.
  
  function ${isTsx ? 'HelloComponent' : 'helloFunction'}() {
    const message = "Hello, World!";
    console.log(message);
    ${isTsx ? 'return <div>{message}</div>;' : ''}
  }
  
  export default ${isTsx ? 'HelloComponent' : 'helloFunction'};
  `;
      return {
        filePath,
        content: simulatedContent.trim(),
      };
    }
  );
  

const explainCodePrompt = ai.definePrompt({
  name: 'explainCodePrompt',
  input: { schema: ExplainCodeOutputSchema },
  output: { schema: ExplainCodeOutputSchema },
  prompt: `You are an expert code reviewer. You can explain complex code in a clear and concise way.
The user has provided a file from a GitHub repository.
Explain the following code file. Provide a detailed, markdown-formatted explanation covering its purpose, structure, and key logic.

File Path: {{{filePath}}}
Content:
\`\`\`
{{{content}}}
\`\`\`
`,
});

const explainCodeFlow = ai.defineFlow(
  {
    name: 'explainCodeFlow',
    inputSchema: ExplainCodeInputSchema,
    outputSchema: ExplainCodeOutputSchema,
  },
  async (input) => {
    // Step 1: Use the tool to get the file content
    const fileContent = await getRepoFileContent(input);

    // Step 2: Call the prompt to get the explanation
    const { output } = await explainCodePrompt(fileContent);
    return output!;
  }
);

export async function explainCode(
    input: ExplainCodeInput
  ): Promise<ExplainCodeOutput> {
    return explainCodeFlow(input);
}
