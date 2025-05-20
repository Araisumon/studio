
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { SettingsIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface PolyglotSettings {
  correctionLevel: "gentle" | "standard" | "strict";
  flagGrammar: boolean;
  flagSpelling: boolean;
  flagPunctuation: boolean;
  flagStyle: boolean;
  analyzeTone: boolean;
  explainIdioms: boolean;
  suggestStructureVariations: boolean;
}

interface SettingsPanelProps {
  settings: PolyglotSettings;
  onSettingsChange: (newSettings: PolyglotSettings) => void;
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const [currentSettings, setCurrentSettings] = React.useState<PolyglotSettings>(settings);

  React.useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(currentSettings);
  };
  
  const getItemId = (baseId: string) => `${baseId}-${React.useId()}`;

  const advancedSettings = [
    { id: "analyzeTone", label: "Analyze Tone & Formality", key: "analyzeTone" as keyof PolyglotSettings, description: "Get feedback on the text's tone and formality." },
    { id: "explainIdioms", label: "Explain Idioms & Phrases", key: "explainIdioms" as keyof PolyglotSettings, description: "Understand common expressions and idioms." },
    { id: "suggestStructureVariations", label: "Suggest Sentence Structure Variations", key: "suggestStructureVariations" as keyof PolyglotSettings, description: "Receive tips on improving sentence flow and variety." },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open settings">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Customize Advanced Settings</SheetTitle>
          <SheetDescription>
            Tailor Polyglot Pal's analysis to your learning needs. Changes apply to the next correction.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow py-1">
          <div className="grid gap-6 py-4 pr-6"> {/* Added pr-6 for scrollbar spacing */}
            <div className="grid gap-3">
              <Label htmlFor="correction-level" className="text-base font-semibold">Correction Level</Label>
              <RadioGroup
                id="correction-level"
                value={currentSettings.correctionLevel}
                onValueChange={(value: PolyglotSettings["correctionLevel"]) =>
                  setCurrentSettings(prev => ({ ...prev, correctionLevel: value }))
                }
                className="grid grid-cols-3 gap-2"
              >
                {(["gentle", "standard", "strict"] as const).map((level) => (
                  <div key={level}>
                    <RadioGroupItem value={level} id={`level-${level}`} className="peer sr-only" />
                    <Label
                      htmlFor={`level-${level}`}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary capitalize"
                    >
                      {level}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="grid gap-3">
              <Label className="text-base font-semibold">Basic Error Types to Flag</Label>
              <div className="space-y-3">
                {[
                  { id: "flagGrammar", label: "Grammar", checked: currentSettings.flagGrammar, key: "flagGrammar" as keyof PolyglotSettings },
                  { id: "flagSpelling", label: "Spelling", checked: currentSettings.flagSpelling, key: "flagSpelling" as keyof PolyglotSettings },
                  { id: "flagPunctuation", label: "Punctuation", checked: currentSettings.flagPunctuation, key: "flagPunctuation" as keyof PolyglotSettings },
                  { id: "flagStyle", label: "General Style (Clarity, Word Choice)", checked: currentSettings.flagStyle, key: "flagStyle" as keyof PolyglotSettings },
                ].map(item => {
                  const uniqueId = getItemId(item.id);
                  return (
                    <div key={item.id} className="flex items-center space-x-3 p-3 rounded-md border hover:bg-accent/50 transition-colors">
                      <Checkbox
                        id={uniqueId}
                        checked={item.checked as boolean}
                        onCheckedChange={(checked) =>
                          setCurrentSettings(prev => ({ ...prev, [item.key]: !!checked }))
                        }
                        className="h-5 w-5"
                      />
                      <Label htmlFor={uniqueId} className="font-normal text-sm cursor-pointer flex-grow">
                        {item.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3">
              <Label className="text-base font-semibold">Advanced Analysis Features</Label>
              <div className="space-y-3">
                {advancedSettings.map(item => {
                  const uniqueId = getItemId(item.id);
                  return (
                    <div key={item.id} className="flex items-start space-x-3 p-3 rounded-md border hover:bg-accent/50 transition-colors">
                      <Checkbox
                        id={uniqueId}
                        checked={currentSettings[item.key] as boolean}
                        onCheckedChange={(checked) =>
                          setCurrentSettings(prev => ({ ...prev, [item.key]: !!checked }))
                        }
                        className="h-5 w-5 mt-1"
                      />
      
                      <div className="flex-grow">
                        <Label htmlFor={uniqueId} className="font-normal text-sm cursor-pointer">
                          {item.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
        <SheetFooter className="mt-auto pt-4 border-t">
          <SheetClose asChild>
            <Button type="button" onClick={handleSave} className="w-full">Save Settings</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
