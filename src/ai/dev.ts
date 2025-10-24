import { config } from 'dotenv';
config();

import '@/ai/flows/explain-generated-commands.ts';
import '@/ai/flows/generate-git-commands-from-prompt.ts';
import '@/ai/flows/explain-code.ts';
