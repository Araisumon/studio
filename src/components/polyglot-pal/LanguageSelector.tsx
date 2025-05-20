
"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface Language {
  value: string;
  label: string;
}

const languages: Language[] = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Español (Spanish)" },
  { value: "French", label: "Français (French)" },
  { value: "German", label: "Deutsch (German)" },
  { value: "Japanese", label: "日本語 (Japanese)" },
  { value: "Chinese", label: "中文 (Chinese)" },
  { value: "Korean", label: "한국어 (Korean)" },
  { value: "Italian", label: "Italiano (Italian)" },
  { value: "Portuguese", label: "Português (Portuguese)" },
  { value: "Russian", label: "Русский (Russian)" },
  { value: "Arabic", label: "العربية (Arabic)" },
  { value: "Hindi", label: "हिन्दी (Hindi)" },
  { value: "Bengali", label: "বাংলা (Bengali)" },
];

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  tooltipText?: string;
}

export function LanguageSelector({ value, onChange, disabled, tooltipText }: LanguageSelectorProps) {
  const selectComponent = (
    <Select onValueChange={onChange} value={value} disabled={disabled}>
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (tooltipText) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{selectComponent}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return selectComponent;
}
