
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Info, Wand2 } from "lucide-react";

const formSchema = z.object({
  text: z.string().min(1, "Please enter some text to correct."),
  language: z.string().min(1, "Please select a language."),
});

type CorrectionFormValues = z.infer<typeof formSchema>;

const defaultSettings: PolyglotSettings = {
  correctionLevel: "standard",
  flagGrammar: true,
  flagSpelling: true,
  flagPunctuation: true,
  flagStyle: false,
};

export function CorrectionInterface() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [correctionResult, setCorrectionResult] = React.useState<CorrectWritingOutput | null>(null);
  const [settings, setSettings] = React.useState<PolyglotSettings>(defaultSettings);
  const { toast } = useToast();

  const form = useForm<CorrectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      language: "English",
    },
  });

  const onSubmit = async (data: CorrectionFormValues) => {
    setIsLoading(true);
    setCorrectionResult(null);
    try {
      const input: CorrectWritingInput = {
        text: data.text,
        language: data.language,
      };
      const result = await correctWriting(input);
      setCorrectionResult(result);
    } catch (error) {
      console.error("Correction error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to correct text. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsChange = (newSettings: PolyglotSettings) => {
    setSettings(newSettings);
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved (UI demo).",
    });
  };

  return (
    <Card className="w-full shadow-xl">
      <CardContent className="p-6 space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Controller
              name="text"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Type or paste your text here..."
                  rows={8}
                  className="resize-y text-base"
                  aria-label="Text to correct"
                  disabled={isLoading}
                />
              )}
            />
            {form.formState.errors.text && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.text.message}</p>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:flex-grow">
              <Controller
                name="language"
                control={form.control}
                render={({ field }) => (
                  <LanguageSelector
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                )}
              />
               {form.formState.errors.language && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.language.message}</p>
              )}
            </div>
            <div className="flex gap-2">
                <SettingsPanel settings={settings} onSettingsChange={handleSettingsChange} />
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto px-6 py-3 text-base">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-5 w-5" />
                  )}
                  Correct Text
                </Button>
            </div>
          </div>
        </form>

        {isLoading && (
          <div className="flex items-center justify-center p-8 rounded-md border border-dashed">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Correcting your text...</p>
          </div>
        )}

        {correctionResult && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Corrected Text</CardTitle>
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
                <Info className="h-5 w-5" />
                <AlertTitle>Explanation</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">
                  {correctionResult.explanation}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
