'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate Git commands from a user prompt.
 *
 * - generateGitCommandsFromPrompt - A function that generates Git commands based on a user prompt.
 * - GenerateGitCommandsFromPromptInput - The input type for the generateGitCommandsFromPrompt function.
 * - GenerateGitCommandsFromPromptOutput - The return type for the generateGitCommandsFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGitCommandsFromPromptInputSchema = z.object({
  prompt: z.string().describe("A prompt describing a Git task (e.g., 'commit my changes with message X')."),
  execute: z.boolean().describe('Whether to execute the generated commands.'),
});
export type GenerateGitCommandsFromPromptInput = z.infer<typeof GenerateGitCommandsFromPromptInputSchema>;

const GenerateGitCommandsFromPromptOutputSchema = z.object({
  commands: z.array(z.string()).describe('An array of Git commands corresponding to the prompt.'),
  explanation: z.string().describe('An explanation of the generated Git commands.'),
  executionResult: z.string().optional().describe('The result of executing the commands, if requested.'),
});
export type GenerateGitCommandsFromPromptOutput = z.infer<typeof GenerateGitCommandsFromPromptOutputSchema>;

export async function generateGitCommandsFromPrompt(input: GenerateGitCommandsFromPromptInput): Promise<GenerateGitCommandsFromPromptOutput> {
  return generateGitCommandsFromPromptFlow(input);
}

const executeGitCommand = ai.defineTool(
  {
    name: 'executeGitCommand',
    description: 'Executes a Git command using the GitHub API. Use this for each command that needs to be executed.',
    inputSchema: z.object({ command: z.string() }),
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async ({ command }) => {
    // In a real application, you would use an OAuth token to make a call
    // to the GitHub API here to perform the requested git operation.
    // For this demo, we'll simulate the execution.
    console.log(`Simulating execution of: ${command}`);
    if (command.startsWith('git push')) {
      return { success: true, message: `Simulated: Successfully pushed changes to remote repository.` };
    }
    if (command.startsWith('git commit')) {
      return { success: true, message: `Simulated: Successfully committed changes with message.` };
    }
    if (command.startsWith('git add')) {
        return { success: true, message: `Simulated: Successfully staged changes.` };
    }
    // Simulate a failure for an unknown command
    if (!command.startsWith('git')) {
        return { success: false, message: `Simulated: Error! '${command}' is not a recognized git command.`}
    }
    return { success: true, message: `Simulated: Successfully executed: ${command}` };
  }
);


const generateGitCommandsPrompt = ai.definePrompt({
  name: 'generateGitCommandsPrompt',
  input: {schema: GenerateGitCommandsFromPromptInputSchema},
  output: {schema: GenerateGitCommandsFromPromptOutputSchema},
  tools: [executeGitCommand],
  prompt: `You are a Git command expert. Generate the necessary Git commands to fulfill the user's request. Also provide a brief explanation of what the commands do.

If the user asks to execute the command, or if 'execute' is true, use the executeGitCommand tool for each generated command. Combine the results of the tool calls into a single 'executionResult' string.

Request: {{{prompt}}}
Execute: {{{execute}}}
`,
});

const generateGitCommandsFromPromptFlow = ai.defineFlow(
  {
    name: 'generateGitCommandsFromPromptFlow',
    inputSchema: GenerateGitCommandsFromPromptInputSchema,
    outputSchema: GenerateGitCommandsFromPromptOutputSchema,
  },
  async input => {
    const {output} = await generateGitCommandsPrompt(input);
    return output!;
  }
);
