
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LanguageSelector } from "./LanguageSelector";
import { SettingsPanel, type PolyglotSettings } from "./SettingsPanel";
import { correctWriting, type CorrectWritingInput, type CorrectWritingOutput } from "@/ai/flows/correct-writing";
import { translateContent, type TranslateContentInput, type TranslateContentOutput } from "@/ai/flows/translate-content";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Info, Wand2, BookOpenText, Smile, Quote, Shuffle, FileText, ArrowRightLeft, RotateCcw } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const formSchema = z.object({
  text: z.string().min(1, "Please enter some text."),
  inputLanguage: z.string().min(1, "Please select the input language for correction."),
});

type CorrectionFormValues = z.infer<typeof formSchema>;

const defaultSettings: PolyglotSettings = {
  correctionLevel: "standard",
  flagGrammar: true,
  flagSpelling: true,
  flagPunctuation: true,
  flagStyle: false,
  analyzeTone: true,
  explainIdioms: true,
  suggestStructureVariations: true,
};

export function CorrectionInterface() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [correctionResult, setCorrectionResult] = React.useState<CorrectWritingOutput | null>(null);
  const [translationResult, setTranslationResult] = React.useState<string | null>(null);
  const [settings, setSettings] = React.useState<PolyglotSettings>(defaultSettings);
  const [mode, setMode] = React.useState<"correct" | "translate">("correct");
  const [targetLanguage, setTargetLanguage] = React.useState<string>("Spanish");
  const { toast } = useToast();

  const form = useForm<CorrectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      inputLanguage: "English",
    },
  });

  const onSubmit = async (data: CorrectionFormValues) => {
    setIsLoading(true);
    setCorrectionResult(null);
    setTranslationResult(null);

    if (mode === "correct") {
      try {
        const input: CorrectWritingInput = {
          text: data.text,
          language: data.inputLanguage,
          correctionLevel: settings.correctionLevel,
          flagGrammar: settings.flagGrammar,
          flagSpelling: settings.flagSpelling,
          flagPunctuation: settings.flagPunctuation,
          flagStyle: settings.flagStyle,
          analyzeTone: settings.analyzeTone,
          explainIdioms: settings.explainIdioms,
          suggestStructureVariations: settings.suggestStructureVariations,
        };
        const result = await correctWriting(input);
        setCorrectionResult(result);
      } catch (error) {
        console.error("Correction error:", error);
        toast({
          variant: "destructive",
          title: "Error Correcting Text",
          description: `Failed to process text: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        });
      }
    } else if (mode === "translate") {
      if (!targetLanguage) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please select a target language for translation.",
        });
        setIsLoading(false);
        return;
      }
      try {
        const input: TranslateContentInput = {
          text: data.text,
          targetLanguage: targetLanguage,
        };
        const result = await translateContent(input);
        setTranslationResult(result.translatedText);
      } catch (error) {
        console.error("Translation error:", error);
        toast({
          variant: "destructive",
          title: "Error Translating Text",
          description: `Failed to translate text: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        });
      }
    }
    setIsLoading(false);
  };

  const handleSettingsChange = (newSettings: PolyglotSettings) => {
    setSettings(newSettings);
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved and will be applied to the next correction.",
    });
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode as "correct" | "translate");
    setCorrectionResult(null);
    setTranslationResult(null);
    // Do not reset form text on mode change, only errors.
    form.clearErrors(); 
  };
  
  const handleReset = () => {
    form.reset({ text: "", inputLanguage: form.getValues("inputLanguage") }); // Keep selected language
    setCorrectionResult(null);
    setTranslationResult(null);
    toast({
      title: "Reset",
      description: "Input and results have been cleared.",
    });
  };

  const submitButtonText = mode === "correct" ? "Correct & Analyze" : "Translate";
  const SubmitButtonIcon = mode === "correct" ? Wand2 : ArrowRightLeft;

  return (
    <Card className="w-full shadow-xl">
      <CardContent className="p-6 space-y-6">
        <Tabs value={mode} onValueChange={handleModeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="correct">Correct & Analyze</TabsTrigger>
            <TabsTrigger value="translate">Translate</TabsTrigger>
          </TabsList>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <div className="relative">
              <Controller
                name="text"
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder={mode === 'correct' ? "Type or paste text to correct..." : "Type or paste text to translate..."}
                    rows={8}
                    className="resize-y text-base pr-10" // Added pr-10 for reset button
                    aria-label="Text to process"
                    disabled={isLoading}
                  />
                )}
              />
               <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleReset} 
                      className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                      aria-label="Reset input and results"
                      disabled={isLoading}
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset input and results</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {form.formState.errors.text && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.text.message}</p>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="w-full md:flex-grow space-y-1">
                 {mode === "correct" && (
                  <>
                    <Controller
                      name="inputLanguage"
                      control={form.control}
                      render={({ field }) => (
                        <LanguageSelector
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                          tooltipText="Select the language of your original text"
                        />
                      )}
                    />
                    {form.formState.errors.inputLanguage && (
                      <p className="text-sm text-destructive">{form.formState.errors.inputLanguage.message}</p>
                    )}
                  </>
                 )}
                 {mode === "translate" && (
                    <LanguageSelector
                      value={targetLanguage}
                      onChange={setTargetLanguage}
                      disabled={isLoading}
                      tooltipText="Select the language to translate your text into"
                    />
                 )}
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                  {mode === "correct" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <div> {/* Wrap SettingsPanel trigger for Tooltip */}
                            <SettingsPanel settings={settings} onSettingsChange={handleSettingsChange} />
                           </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Customize correction settings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                   )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button type="submit" disabled={isLoading} className="flex-grow md:flex-grow-0 px-6 py-3 text-base">
                          {isLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <SubmitButtonIcon className="mr-2 h-5 w-5" />
                          )}
                          {submitButtonText}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{mode === 'correct' ? 'Get corrections and detailed analysis' : 'Translate your text to the selected language'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
              </div>
            </div>
          </form>
        </Tabs>

        {isLoading && (
          <div className="flex items-center justify-center p-8 rounded-md border border-dashed mt-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Polyglot Pal is thinking...</p>
          </div>
        )}

        {mode === "correct" && correctionResult && (
          <div className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Corrected Text</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={correctionResult.correctedText}
                  readOnly
                  rows={8}
                  className="resize-y bg-secondary/30 text-base border-input focus-visible:ring-accent"
                  aria-label="Corrected text"
                />
              </CardContent>
            </Card>

            {correctionResult.explanation && (
              <Alert>
                <Info className="h-5 w-5 mt-1" />
                <AlertTitle className="font-semibold">Explanation of Corrections</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap text-sm">
                  {correctionResult.explanation}
                </AlertDescription>
              </Alert>
            )}
            
            {correctionResult.keyVocabulary && correctionResult.keyVocabulary.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <BookOpenText className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Key Vocabulary & Phrases</CardTitle>
                  </div>
                  <CardDescription>
                    Important terms from your text with explanations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {correctionResult.keyVocabulary.map((item, index) => (
                      <AccordionItem value={`vocab-${index}`} key={`vocab-${index}`}>
                        <AccordionTrigger className="text-base hover:no-underline">
                          <span className="font-semibold text-primary">{item.term}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {item.explanation}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {correctionResult.toneAnalysis && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Smile className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Tone & Formality Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><span className="font-semibold">Detected Tone:</span> {correctionResult.toneAnalysis.detectedTone}</p>
                  {correctionResult.toneAnalysis.suggestions && (
                    <Alert variant="default">
                       <Info className="h-4 w-4" />
                      <AlertTitle className="text-sm font-semibold">Suggestions</AlertTitle>
                      <AlertDescription className="whitespace-pre-wrap text-xs">
                        {correctionResult.toneAnalysis.suggestions}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {correctionResult.idiomExplanations && correctionResult.idiomExplanations.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Quote className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Idioms & Common Phrases</CardTitle>
                  </div>
                  <CardDescription>
                    Explanations for expressions found in your text.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {correctionResult.idiomExplanations.map((item, index) => (
                      <AccordionItem value={`idiom-${index}`} key={`idiom-${index}`}>
                        <AccordionTrigger className="text-base hover:no-underline">
                           <span className="font-semibold text-primary">{item.idiom}</span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-1 text-sm text-muted-foreground whitespace-pre-wrap">
                          <p><span className="font-medium text-foreground/80">Meaning:</span> {item.meaning}</p>
                          {item.example && <p><span className="font-medium text-foreground/80">Example:</span> {item.example}</p>}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {correctionResult.structureSuggestions && (
               <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shuffle className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Sentence Structure Suggestions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {correctionResult.structureSuggestions}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {mode === "translate" && translationResult && (
           <div className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                    <ArrowRightLeft className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Translated Text</CardTitle>
                </div>
                 <CardDescription>
                    Your text translated to {targetLanguage}.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={translationResult}
                  readOnly
                  rows={8}
                  className="resize-y bg-secondary/30 text-base border-input focus-visible:ring-accent"
                  aria-label="Translated text"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
