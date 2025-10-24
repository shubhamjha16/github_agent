'use server';

/**
 * @fileOverview This file defines a Genkit flow to analyze and explain a web page from a URL.
 *
 * - explainWebPage - A function that fetches content from a URL and explains it.
 * - ExplainWebPageInput - The input type for the explainWebPage function.
 * - ExplainWebPageOutput - The return type for the explainWebPage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainWebPageInputSchema = z.object({
  url: z.string().url().describe('The URL of the web page to analyze.'),
});
export type ExplainWebPageInput = z.infer<typeof ExplainWebPageInputSchema>;

const ExplainWebPageOutputSchema = z.object({
  url: z.string().describe('The URL of the page that was analyzed.'),
  content: z.string().describe('The source code of the page.'),
  summary: z.string().describe('A high-level summary of what the web page is and does.'),
  explanation: z.string().describe('A detailed explanation of the source code.'),
});
export type ExplainWebPageOutput = z.infer<typeof ExplainWebPageOutputSchema>;


const getPageContent = ai.defineTool(
    {
      name: 'getPageContent',
      description: 'Fetches the source code of a given web page URL.',
      inputSchema: ExplainWebPageInputSchema,
      outputSchema: z.object({
        url: z.string(),
        content: z.string(),
      }),
    },
    async ({ url }) => {
      console.log(`Simulating fetching content for ${url}`);
      // In a real application, you would use a library like 'axios' or 'node-fetch'
      // to make an HTTP request and get the page's HTML.
      const simulatedContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Simulated Page</title>
  </head>
  <body>
    <h1>Welcome!</h1>
    <p>This is a simulated page for URL: ${url}</p>
    <script>
      // Simple script to log a message
      console.log("Hello from simulated page!");
    </script>
  </body>
  </html>
  `;
      return {
        url,
        content: simulatedContent.trim(),
      };
    }
  );
  

const explainWebPagePrompt = ai.definePrompt({
  name: 'explainWebPagePrompt',
  input: { schema: z.object({ url: z.string(), content: z.string() }) },
  output: { schema: ExplainWebPageOutputSchema },
  prompt: `You are an expert web developer and code analyst. You can explain complex web pages and their code in a clear and concise way.
The user has provided a URL.
First, provide a high-level summary of what the page is and its purpose.
Second, provide a detailed, markdown-formatted explanation of its source code, covering its structure and key logic.

URL: {{{url}}}
Content:
\`\`\`html
{{{content}}}
\`\`\`
`,
});

const explainWebPageFlow = ai.defineFlow(
  {
    name: 'explainWebPageFlow',
    inputSchema: ExplainWebPageInputSchema,
    outputSchema: ExplainWebPageOutputSchema,
  },
  async (input) => {
    // Step 1: Use the tool to get the page content
    const pageContent = await getPageContent(input);

    // Step 2: Call the prompt to get the summary and explanation
    const { output } = await explainWebPagePrompt(pageContent);
    return output!;
  }
);

export async function explainWebPage(
    input: ExplainWebPageInput
  ): Promise<ExplainWebPageOutput> {
    return explainWebPageFlow(input);
}
