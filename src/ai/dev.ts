import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-content.ts';
import '@/ai/flows/translate-content.ts';
import '@/ai/flows/correct-writing.ts';