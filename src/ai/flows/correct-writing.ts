// src/ai/flows/correct-writing.ts
'use server';

/**
 * @fileOverview AI-powered writing correction flow.
 *
 * This file defines a Genkit flow that analyzes and corrects writing for grammar, spelling, punctuation, and style.
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
});
export type CorrectWritingInput = z.infer<typeof CorrectWritingInputSchema>;

const CorrectWritingOutputSchema = z.object({
  correctedText: z.string().describe('The corrected text.'),
  explanation: z.string().optional().describe('Explanation of the changes made, if any.'),
});
export type CorrectWritingOutput = z.infer<typeof CorrectWritingOutputSchema>;

export async function correctWriting(input: CorrectWritingInput): Promise<CorrectWritingOutput> {
  return correctWritingFlow(input);
}

const correctWritingPrompt = ai.definePrompt({
  name: 'correctWritingPrompt',
  input: {schema: CorrectWritingInputSchema},
  output: {schema: CorrectWritingOutputSchema},
  prompt: `You are a writing assistant that corrects grammar, spelling, punctuation and style in the given text. You should respond with the corrected text, and a short explanation of the changes you made. The user language is {{{language}}}. 

Text: {{{text}}}`,
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
