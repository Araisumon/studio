
// src/ai/flows/correct-writing.ts
'use server';

/**
 * @fileOverview AI-powered writing correction flow.
 *
 * This file defines a Genkit flow that analyzes and corrects writing based on user-defined settings
 * for grammar, spelling, punctuation, style, and correction level. It also provides explanations
 * with examples for the corrections made, and identifies key vocabulary.
 *
 * @exports correctWriting - The main function to initiate the writing correction flow.
 * @exports CorrectWritingInput - The input type for the correctWriting function.
 * @exports CorrectWritingOutput - The output type for the correctWriting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectWritingInputSchema = z.object({
  text: z.string().describe('The text to be corrected.'),
  language: z.string().describe('The language of the text.'),
  correctionLevel: z.enum(['gentle', 'standard', 'strict']).default('standard').optional()
    .describe("The desired level of correction intensity: 'gentle', 'standard', or 'strict'."),
  flagGrammar: z.boolean().default(true).optional()
    .describe('Whether to correct grammar errors.'),
  flagSpelling: z.boolean().default(true).optional()
    .describe('Whether to correct spelling errors.'),
  flagPunctuation: z.boolean().default(true).optional()
    .describe('Whether to correct punctuation errors.'),
  flagStyle: z.boolean().default(false).optional()
    .describe('Whether to suggest style improvements.'),
});
export type CorrectWritingInput = z.infer<typeof CorrectWritingInputSchema>;

const VocabularyItemSchema = z.object({
  term: z.string().describe('The key vocabulary word or phrase.'),
  explanation: z.string().describe('A brief definition or example of usage for the term.'),
});

const CorrectWritingOutputSchema = z.object({
  correctedText: z.string().describe('The corrected text.'),
  explanation: z.string().optional().describe('Explanation of the changes made, including illustrative examples where appropriate.'),
  keyVocabulary: z.array(VocabularyItemSchema).optional().describe('A list of 3-5 key vocabulary words or phrases identified from the corrected text, along with their definitions or usage examples. Focus on terms that were corrected or are good examples of proper usage in the target language.'),
});
export type CorrectWritingOutput = z.infer<typeof CorrectWritingOutputSchema>;

export async function correctWriting(input: CorrectWritingInput): Promise<CorrectWritingOutput> {
  return correctWritingFlow(input);
}

const correctWritingPrompt = ai.definePrompt({
  name: 'correctWritingPrompt',
  input: {schema: CorrectWritingInputSchema},
  output: {schema: CorrectWritingOutputSchema},
  prompt: `You are a highly configurable writing assistant and language learning helper. Your task is to correct the provided text based on the user's specified settings.
Always respond with the corrected text, a short explanation of the changes made, and a list of key vocabulary.

Explanation Guidance:
When explaining the corrections, for each significant change (grammar, spelling, punctuation, style), provide a brief example sentence that demonstrates the correct usage or contrasts the incorrect usage with the correct one. Make these examples concise and directly relevant to the user's original text and the corrections applied.

Key Vocabulary Guidance:
Identify 3-5 key vocabulary words or phrases from the corrected text. Focus on terms that were corrected, are good examples of proper usage in the target language, or might be particularly useful for a language learner. For each term, provide a brief definition or an illustrative example sentence showing its correct usage.

The user's text is in {{{language}}}.

Correction Settings:
- Correction Level: {{{correctionLevel}}}
  - 'gentle': Provide only essential corrections. Focus on major errors that impede understanding. Be lenient with minor stylistic issues.
  - 'standard': Provide a balanced set of corrections for grammar, spelling, punctuation, and clarity. Improve readability and flow.
  - 'strict': Provide comprehensive corrections, addressing all errors in grammar, spelling, punctuation, style, and flow. Aim for formal and precise language.

Focus Areas (true means correct this aspect, false means ignore unless critical for understanding):
- Correct Grammar: {{{flagGrammar}}}
- Correct Spelling: {{{flagSpelling}}}
- Correct Punctuation: {{{flagPunctuation}}}
- Improve Style: {{{flagStyle}}} (If true, suggest improvements to style, tone, and word choice. If false, focus primarily on correctness.)

Original Text:
{{{text}}}
`,
});

const correctWritingFlow = ai.defineFlow(
  {
    name: 'correctWritingFlow',
    inputSchema: CorrectWritingInputSchema,
    outputSchema: CorrectWritingOutputSchema,
  },
  async input => {
    const {output} = await correctWritingPrompt(input);
    return output!;
  }
);
