
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

export interface PolyglotSettings {
  correctionLevel: "gentle" | "standard" | "strict";
  flagGrammar: boolean;
  flagSpelling: boolean;
  flagPunctuation: boolean;
  flagStyle: boolean;
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
  
  // Helper to create a unique ID for checkbox items
  const getItemId = (baseId: string) => `${baseId}-${React.useId()}`;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open settings">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Customize Settings</SheetTitle>
          <SheetDescription>
            Adjust Polyglot Pal to your writing preferences. (Note: These settings are for UI demonstration and do not currently alter AI behavior.)
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-3">
            <Label htmlFor="correction-level">Correction Level</Label>
            <RadioGroup
              id="correction-level"
              value={currentSettings.correctionLevel}
              onValueChange={(value: PolyglotSettings["correctionLevel"]) =>
                setCurrentSettings(prev => ({ ...prev, correctionLevel: value }))
              }
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gentle" id="level-gentle" />
                <Label htmlFor="level-gentle">Gentle</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="level-standard" />
                <Label htmlFor="level-standard">Standard</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="strict" id="level-strict" />
                <Label htmlFor="level-strict">Strict</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid gap-3">
            <Label>Error Types to Flag</Label>
            <div className="space-y-2">
              {[
                { id: "flagGrammar", label: "Grammar", checked: currentSettings.flagGrammar, key: "flagGrammar" as keyof PolyglotSettings },
                { id: "flagSpelling", label: "Spelling", checked: currentSettings.flagSpelling, key: "flagSpelling" as keyof PolyglotSettings },
                { id: "flagPunctuation", label: "Punctuation", checked: currentSettings.flagPunctuation, key: "flagPunctuation" as keyof PolyglotSettings },
                { id: "flagStyle", label: "Style", checked: currentSettings.flagStyle, key: "flagStyle" as keyof PolyglotSettings },
              ].map(item => {
                const uniqueId = getItemId(item.id);
                return (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={uniqueId}
                      checked={item.checked as boolean}
                      onCheckedChange={(checked) =>
                        setCurrentSettings(prev => ({ ...prev, [item.key]: !!checked }))
                      }
                    />
                    <Label htmlFor={uniqueId} className="font-normal">
                      {item.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" onClick={handleSave}>Save Changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
