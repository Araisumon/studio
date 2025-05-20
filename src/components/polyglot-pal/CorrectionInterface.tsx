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
import { Loader2, Info, Wand2, BookOpenText, Smile, Quote, Shuffle, FileText, ArrowRightLeft, RotateCcw, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
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
  
  const [spokenLanguageForTranslation, setSpokenLanguageForTranslation] = React.useState<string>("en-US");
  const [targetLanguage, setTargetLanguage] = React.useState<string>("es-ES");
  const { toast } = useToast();

  const [isRecording, setIsRecording] = React.useState(false);
  const speechRecognitionRef = React.useRef<SpeechRecognition | null>(null);

  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);
  const [availableVoices, setAvailableVoices] = React.useState<SpeechSynthesisVoice[]>([]);


  const form = useForm<CorrectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      inputLanguage: "en-US", // Default to English (US)
    },
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      loadVoices(); // Initial load
      // Voices might load asynchronously, so listen for changes
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null; // Clean up listener
        if (utteranceRef.current) {
          window.speechSynthesis.cancel(); // Stop any speech on unmount
        }
      };
    }
  }, []);

  React.useEffect(() => {
    // Initialize SpeechRecognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        speechRecognitionRef.current = new SpeechRecognitionAPI();
        speechRecognitionRef.current.continuous = false; // Capture single utterance
        speechRecognitionRef.current.interimResults = false;

        speechRecognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[event.results.length - 1][0].transcript.trim();
          form.setValue("text", transcript);
          setIsRecording(false); // Turn off recording indicator
          toast({ title: "Voice input captured!", description: "Text has been entered for translation." });
        };

        speechRecognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error", event.error);
          toast({ variant: "destructive", title: "Voice Error", description: `Speech recognition error: ${event.error}` });
          setIsRecording(false);
        };
        
        speechRecognitionRef.current.onend = () => {
           // setIsRecording(false); // Let toggle handle this
        };
      }
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }

    // Cleanup function to stop recognition if component unmounts
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  const handleToggleRecording = () => {
    if (!speechRecognitionRef.current) {
      toast({ variant: "destructive", title: "Not Supported", description: "Voice input is not supported in your browser." });
      return;
    }

    if (isRecording) {
      speechRecognitionRef.current.stop();
      setIsRecording(false);
    } else {
      // Before starting, set the language for recognition
      try {
        speechRecognitionRef.current.lang = spokenLanguageForTranslation; // Use selected spoken language
        speechRecognitionRef.current.start();
        setIsRecording(true);
        toast({ title: "Listening...", description: "Speak now." });
      } catch (err) {
        // Handle cases where start() might fail (e.g., no microphone, permissions denied previously)
        console.error("Error starting speech recognition:", err);
        toast({ variant: "destructive", title: "Could not start listening", description: "Please ensure microphone permissions are granted and try again."});
        setIsRecording(false); // Reset if start fails
      }
    }
  };


  const onSubmit = async (data: CorrectionFormValues) => {
    setIsLoading(true);
    setCorrectionResult(null);
    setTranslationResult(null);
    if (isSpeaking && utteranceRef.current) { // Stop any ongoing speech
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

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
    setCorrectionResult(null); // Clear previous results
    setTranslationResult(null);
    form.clearErrors(); // Clear any form errors
    if (isSpeaking && utteranceRef.current) { // Stop any ongoing speech
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
  
  const handleReset = () => {
    form.reset({ text: "", inputLanguage: form.getValues("inputLanguage") });
    setCorrectionResult(null);
    setTranslationResult(null);
    if (isRecording) {
      speechRecognitionRef.current?.stop();
      setIsRecording(false);
    }
    if (isSpeaking && utteranceRef.current) { // Stop any ongoing speech
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    toast({
      title: "Reset",
      description: "Input and results have been cleared.",
    });
  };

  const speakText = (textToSpeak: string, languageCode: string) => {
    if (!textToSpeak || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast({ variant: "destructive", title: "Not Supported", description: "Text-to-speech is not supported or no text to speak." });
      return;
    }

    // If already speaking, cancel current speech and toggle state.
    // If not speaking, or speaking different content, start new speech.
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      // If the request was to stop the current speech, return here.
      // Otherwise, it will proceed to speak new text.
      // For simplicity, if user clicks while speaking, it just stops. To re-speak, they click again.
      return; 
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    const voice = availableVoices.find(v => v.lang === languageCode) || 
                  availableVoices.find(v => v.lang.startsWith(languageCode.split('-')[0])) ||
                  null;
    
    if (voice) {
      utterance.voice = voice;
    } else {
       toast({ title: "Voice Note", description: `No specific voice found for ${languageCode}. Using default.`});
    }
    utterance.lang = languageCode; 

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      toast({ variant: "destructive", title: "Speech Error", description: `Could not speak text: ${event.error}` });
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeakTranslatedText = () => {
    if (translationResult) {
      speakText(translationResult, targetLanguage);
    }
  };

  const handleSpeakCorrectedText = () => {
    if (correctionResult?.correctedText) {
      speakText(correctionResult.correctedText, form.getValues("inputLanguage"));
    }
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
                    placeholder={mode === 'correct' ? "Type or paste text to correct..." : (isRecording ? "Listening..." : "Type, paste, or use microphone to input text to translate...")}
                    rows={8}
                    className="resize-y text-base pr-10" 
                    aria-label="Text to process"
                    disabled={isLoading || (mode === 'translate' && isRecording)}
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

            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="w-full md:flex-grow space-y-2">
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
                          placeholder="Input Language (for correction)"
                        />
                      )}
                    />
                    {form.formState.errors.inputLanguage && (
                      <p className="text-sm text-destructive">{form.formState.errors.inputLanguage.message}</p>
                    )}
                  </>
                 )}
                 {mode === "translate" && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <LanguageSelector
                      value={spokenLanguageForTranslation}
                      onChange={setSpokenLanguageForTranslation}
                      disabled={isLoading || isRecording}
                      tooltipText="Select the language you will speak in"
                      placeholder="Spoken Language"
                    />
                    <LanguageSelector
                      value={targetLanguage}
                      onChange={setTargetLanguage}
                      disabled={isLoading || isRecording}
                      tooltipText="Select the language to translate your text into"
                      placeholder="Target Language"
                    />
                   </div>
                 )}
              </div>
              <div className="flex gap-2 w-full md:w-auto items-center">
                  {mode === "translate" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleToggleRecording}
                            disabled={isLoading}
                            aria-label={isRecording ? "Stop recording" : "Start recording"}
                          >
                            {isRecording ? <MicOff className="h-5 w-5 text-destructive" /> : <Mic className="h-5 w-5" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isRecording ? "Stop voice input" : "Start voice input"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
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
                        <Button type="submit" disabled={isLoading || (mode === 'translate' && isRecording)} className="flex-grow md:flex-grow-0 px-6 py-3 text-base h-auto">
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
          <div className="flex flex-col items-center justify-center p-8 md:p-12 rounded-md border border-dashed mt-6 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground text-center">Polyglot Buzz is working its magic...</p>
            <p className="text-sm text-muted-foreground text-center">Please wait a moment.</p>
          </div>
        )}

        {mode === "correct" && correctionResult && (
          <div className="space-y-6 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Corrected Text</CardTitle>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSpeakCorrectedText}
                        disabled={!correctionResult?.correctedText || isLoading || (typeof window !== 'undefined' && !('speechSynthesis' in window))}
                        aria-label={isSpeaking ? "Stop speaking corrected text" : "Listen to corrected text"}
                      >
                        {isSpeaking ? <VolumeX className="h-5 w-5 text-destructive" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isSpeaking ? "Stop speaking" : "Listen to corrected text"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                    <ArrowRightLeft className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Translated Text</CardTitle>
                </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleSpeakTranslatedText}
                          disabled={!translationResult || isLoading || (typeof window !== 'undefined' && !('speechSynthesis' in window))}
                          aria-label={isSpeaking ? "Stop speaking translated text" : "Listen to translated text"}
                        >
                          {isSpeaking ? <VolumeX className="h-5 w-5 text-destructive" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isSpeaking ? "Stop speaking" : "Listen to translated text"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={translationResult}
                  readOnly
                  rows={8}
                  className="resize-y bg-secondary/30 text-base border-input focus-visible:ring-accent"
                  aria-label="Translated text"
                />
                 <CardDescription className="mt-2 text-xs">
                    Your text translated to {availableVoices.find(v => v.lang === targetLanguage)?.name || targetLanguage}.
                  </CardDescription>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
    

    