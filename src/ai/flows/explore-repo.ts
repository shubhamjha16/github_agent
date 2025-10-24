'use server';
/**
 * @fileOverview A multi-step flow for exploring and explaining a GitHub repository.
 *
 * - listRepoFiles - A tool to list files in a GitHub repo.
 * - getFileContent - A tool to get the content of a specific file.
 * - explainRepoFile - A flow to orchestrate getting content and explaining it.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schemas for Tools
const RepoUrlInputSchema = z.object({
  repoUrl: z.string().url().describe('The URL of the GitHub repository.'),
});

const FileContentInputSchema = z.object({
  repoUrl: z.string().url().describe('The URL of the GitHub repository.'),
  filePath: z.string().describe('The path to the file within the repository.'),
});

// Tool 1: List files in a repository
export const listRepoFiles = ai.defineTool(
  {
    name: 'listRepoFiles',
    description: 'Lists the file paths in a given GitHub repository.',
    inputSchema: RepoUrlInputSchema,
    outputSchema: z.object({
      files: z.array(z.string()),
    }),
  },
  async ({ repoUrl }) => {
    console.log(`Simulating listing files for repo: ${repoUrl}`);
    // In a real app, this would use the GitHub API to list files.
    // We'll return a sample structure for this agent app.
    return {
      files: [
        'src/app/page.tsx',
        'src/app/layout.tsx',
        'src/components/github-agent/CommandGenerator.tsx',
        'src/components/github-agent/AuthWidget.tsx',
        'src/ai/flows/generate-git-commands-from-prompt.ts',
        'package.json',
        'tailwind.config.ts',
      ],
    };
  }
);

// Tool 2: Get content of a specific file
export const getFileContent = ai.defineTool(
  {
    name: 'getFileContent',
    description: "Gets the source code of a specific file from a GitHub repository.",
    inputSchema: FileContentInputSchema,
    outputSchema: z.object({
      content: z.string(),
    }),
  },
  async ({ repoUrl, filePath }) => {
    console.log(`Simulating fetching file content for ${filePath} in ${repoUrl}`);
    // This is a simulation. A real app would fetch from the GitHub API.
    return {
      content: `// Simulated content for ${filePath}\n// In a real application, this would be the actual file content.\n\nexport default function SimulatedComponent() {\n  return <div>Hello from ${filePath}!</div>\n}`,
    };
  }
);


// Schema for the final explanation flow
const ExplainRepoFileOutputSchema = z.object({
  explanation: z.string().describe('A detailed, markdown-formatted explanation of the source code.'),
  filePath: z.string(),
  fileContent: z.string(),
});
export type ExplainRepoFileOutput = z.infer<typeof ExplainRepoFileOutputSchema>;


// Prompt to explain the file content
const explainFilePrompt = ai.definePrompt({
    name: 'explainFilePrompt',
    input: { schema: z.object({ filePath: z.string(), fileContent: z.string() }) },
    output: { schema: ExplainRepoFileOutputSchema },
    prompt: `You are an expert code reviewer. Explain the following file in detail.
    Analyze its purpose, structure, and key logic. Format your response in Markdown.
    
    File Path: {{{filePath}}}
    
    \`\`\`
    {{{fileContent}}}
    \`\`\``,
});


// Flow to orchestrate getting content and explaining it
export const explainRepoFile = ai.defineFlow(
    {
      name: 'explainRepoFile',
      inputSchema: FileContentInputSchema,
      outputSchema: ExplainRepoFileOutputSchema,
    },
    async ({ repoUrl, filePath }) => {
      // Step 1: Use the tool to get the file content
      const { content } = await getFileContent({ repoUrl, filePath });
  
      // Step 2: Call the prompt to get the explanation
      const { output } = await explainFilePrompt({ fileContent: content, filePath });
      return output!;
    }
  );
