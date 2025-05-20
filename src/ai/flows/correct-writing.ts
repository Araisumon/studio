
// src/ai/flows/correct-writing.ts
'use server';

/**
 * @fileOverview AI-powered writing correction and language learning flow.
 *
 * This file defines a Genkit flow that analyzes and corrects writing based on user-defined settings.
 * It also provides explanations with examples for the corrections made, identifies key vocabulary,
 * analyzes tone and formality, explains idioms, and suggests sentence structure variations.
 *
 * @exports correctWriting - The main function to initiate the writing correction and analysis flow.
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
  analyzeTone: z.boolean().default(false).optional()
    .describe('Whether to analyze the tone and formality of the text.'),
  explainIdioms: z.boolean().default(false).optional()
    .describe('Whether to explain idioms and common phrases found in the text.'),
  suggestStructureVariations: z.boolean().default(false).optional()
    .describe('Whether to suggest sentence structure variations for improved flow and style.'),
});
export type CorrectWritingInput = z.infer<typeof CorrectWritingInputSchema>;

const VocabularyItemSchema = z.object({
  term: z.string().describe('The key vocabulary word or phrase.'),
  explanation: z.string().describe('A brief definition or example of usage for the term.'),
});

const ToneAnalysisSchema = z.object({
  detectedTone: z.string().describe("A description of the detected tone and formality of the original text (e.g., 'informal and conversational', 'formal and academic', 'neutral')."),
  suggestions: z.string().optional().describe("Suggestions to improve or alter the tone and formality, especially if style improvements are requested or the tone is inappropriate for general communication."),
});

const IdiomExplanationSchema = z.object({
  idiom: z.string().describe("The identified idiom or common phrase."),
  meaning: z.string().describe("The meaning of the idiom or phrase."),
  example: z.string().optional().describe("An example sentence using the idiom correctly, preferably different from the user's text if it was corrected."),
});

const CorrectWritingOutputSchema = z.object({
  correctedText: z.string().describe('The corrected text.'),
  explanation: z.string().optional().describe('Explanation of the changes made, including illustrative examples where appropriate for significant corrections.'),
  keyVocabulary: z.array(VocabularyItemSchema).optional().describe('A list of 3-5 key vocabulary words or phrases identified from the corrected text, along with their definitions or usage examples. Focus on terms that were corrected or are good examples of proper usage in the target language.'),
  toneAnalysis: ToneAnalysisSchema.optional().describe("Analysis of the text's tone and formality, with suggestions if enabled and applicable."),
  idiomExplanations: z.array(IdiomExplanationSchema).optional().describe("Explanations for idioms or common phrases found in the text, if enabled and any are identified."),
  structureSuggestions: z.string().optional().describe("General suggestions for improving sentence structure, variety, and flow, if enabled and applicable."),
});
export type CorrectWritingOutput = z.infer<typeof CorrectWritingOutputSchema>;

export async function correctWriting(input: CorrectWritingInput): Promise<CorrectWritingOutput> {
  return correctWritingFlow(input);
}

const correctWritingPrompt = ai.definePrompt({
  name: 'correctWritingPrompt',
  input: {schema: CorrectWritingInputSchema},
  output: {schema: CorrectWritingOutputSchema},
  prompt: `You are a highly configurable writing assistant and comprehensive language learning helper. Your task is to correct the provided text and offer detailed linguistic feedback based on the user's specified settings.
Always respond with the corrected text. Additionally, provide the following based on user settings:

1.  **Explanation of Corrections**:
    *   Provide concise explanations for significant changes (grammar, spelling, punctuation, style).
    *   For each, include a brief example sentence demonstrating correct usage or contrasting incorrect with correct usage, directly relevant to the user's text.

2.  **Key Vocabulary (if text is corrected)**:
    *   Identify 3-5 key vocabulary words/phrases from the *corrected* text.
    *   Focus on terms that were corrected, are good examples of proper usage, or useful for language learners.
    *   For each term, provide a brief definition or an illustrative example sentence.

3.  **Tone and Formality Analysis (if 'analyzeTone' is true)**:
    *   Describe the detectedTone of the original text (e.g., "informal and conversational", "formal and academic", "neutral").
    *   If 'flagStyle' is true or correctionLevel is 'standard' or 'strict', provide suggestions for improving or altering the tone/formality if it seems inappropriate or could be enhanced for clarity or impact.

4.  **Idiom and Common Phrase Explanations (if 'explainIdioms' is true)**:
    *   Identify any idioms or common colloquial phrases in the original text (whether used correctly or misused and then corrected).
    *   For each identified idiom, provide its meaning and an example sentence showing its correct usage (preferably a new example).

5.  **Sentence Structure Variation Suggestions (if 'suggestStructureVariations' is true)**:
    *   Provide general structureSuggestions for improving sentence variety, flow, and readability.
    *   If specific repetitive structures or awkward phrasing are noticed (even if grammatically correct), point them out and suggest general ways to vary them. This is especially relevant if 'flagStyle' is true.

The user's text is in {{{language}}}.

Correction Settings:
- Correction Level: {{{correctionLevel}}}
  - 'gentle': Essential corrections for understanding. Lenient on minor style.
  - 'standard': Balanced corrections for grammar, spelling, punctuation, clarity. Improve readability.
  - 'strict': Comprehensive corrections for all errors. Aim for formal/precise language.

Focus Areas (true means correct/analyze this aspect, false means ignore unless critical):
- Correct Grammar: {{{flagGrammar}}}
- Correct Spelling: {{{flagSpelling}}}
- Correct Punctuation: {{{flagPunctuation}}}
- Improve Style: {{{flagStyle}}} (If true, suggest improvements to style, tone, word choice. If false, focus on correctness.)
- Analyze Tone: {{{analyzeTone}}}
- Explain Idioms: {{{explainIdioms}}}
- Suggest Structure Variations: {{{suggestStructureVariations}}}

Original Text:
{{{text}}}

Provide your response strictly in the JSON format defined by the output schema. Ensure all requested optional fields are included if the corresponding settings are enabled and relevant information is found. If a feature is enabled but no relevant items are found (e.g., no idioms in text when 'explainIdioms' is true), omit that field or provide an empty array/object as appropriate according to the schema.
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
    // Ensure output is not null, even if the AI might theoretically return null
    // based on a very unusual (and incorrect) response.
    // The schema validation should catch most issues, but this is a safeguard.
    if (!output) {
        throw new Error("AI did not return a valid output.");
    }
    return output;
  }
);

