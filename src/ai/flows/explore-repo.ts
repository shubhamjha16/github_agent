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

// Helper function to parse GitHub URL
function parseRepoUrl(repoUrl: string): { owner: string; repo: string } {
  try {
    const url = new URL(repoUrl);
    if (url.hostname !== 'github.com') {
      throw new Error('Invalid GitHub URL');
    }
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub repository path');
    }
    const [owner, repo] = pathParts;
    return { owner, repo };
  } catch (error) {
    throw new Error('Could not parse repository URL.');
  }
}

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
    description: 'Lists the file paths in a given public GitHub repository.',
    inputSchema: RepoUrlInputSchema,
    outputSchema: z.object({
      files: z.array(z.string()),
    }),
  },
  async ({ repoUrl }) => {
    try {
      const { owner, repo } = parseRepoUrl(repoUrl);
      // This API endpoint gets the tree recursively. We'll try 'main' first, then 'master'.
      let branch = 'main';
      let apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

      let response = await fetch(apiUrl);

      if (!response.ok) {
        // If 'main' fails, try 'master' as a fallback
        branch = 'master';
        apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
        response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch repository tree. Status: ${response.status}. URL: ${apiUrl}`);
        }
      }

      const data = await response.json();
      
      if (!data.tree) {
        throw new Error('Invalid API response: "tree" field is missing.');
      }

      const files = data.tree
        .filter((item: any) => item.type === 'blob') // 'blob' means file, 'tree' means directory
        .map((item: any) => item.path);

      return { files };
    } catch (e: any) {
        console.error("Error in listRepoFiles:", e);
        // Re-throw a more user-friendly error for the AI to handle
        throw new Error(`Could not list files for the repository ${repoUrl}. Reason: ${e.message}`);
    }
  }
);

// Tool 2: Get content of a specific file
export const getFileContent = ai.defineTool(
  {
    name: 'getFileContent',
    description: "Gets the source code of a specific file from a public GitHub repository.",
    inputSchema: FileContentInputSchema,
    outputSchema: z.object({
      content: z.string(),
    }),
  },
  async ({ repoUrl, filePath }) => {
     try {
      const { owner, repo } = parseRepoUrl(repoUrl);
      
      // Try 'main' branch first
      let rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`;
      let response = await fetch(rawUrl);

      if (!response.ok) {
        // Fallback to 'master' branch
        rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/${filePath}`;
        response = await fetch(rawUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch file content. Status: ${response.status}. URL: ${rawUrl}`);
        }
      }
      
      const content = await response.text();
      return { content };

    } catch (e: any) {
        console.error(`Error fetching file content for ${filePath}:`, e);
        throw new Error(`Could not read the file ${filePath}. Reason: ${e.message}`);
    }
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
