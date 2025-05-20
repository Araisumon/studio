
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
  value: string; // BCP 47 language code
  label: string;
}

// Expanded list with BCP 47 codes
const languages: Language[] = [
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español (Spanish - Spain)" },
  { value: "fr-FR", label: "Français (French - France)" },
  { value: "de-DE", label: "Deutsch (German - Germany)" },
  { value: "ja-JP", label: "日本語 (Japanese)" },
  { value: "zh-CN", label: "中文 (Chinese - Simplified)" },
  { value: "ko-KR", label: "한국어 (Korean)" },
  { value: "it-IT", label: "Italiano (Italian)" },
  { value: "pt-BR", label: "Português (Portuguese - Brazil)" },
  { value: "ru-RU", label: "Русский (Russian)" },
  { value: "ar-SA", label: "العربية (Arabic - Saudi Arabia)" },
  { value: "hi-IN", label: "हिन्दी (Hindi)" },
  { value: "bn-BD", label: "বাংলা (Bengali - Bangladesh)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es-MX", label: "Español (Spanish - Mexico)" },
  { value: "pt-PT", label: "Português (Portugal)" },
  { value: "zh-TW", label: "中文 (Chinese - Traditional)" },
];

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  tooltipText?: string;
  placeholder?: string;
}

export function LanguageSelector({ value, onChange, disabled, tooltipText, placeholder = "Select language" }: LanguageSelectorProps) {
  const selectComponent = (
    <Select onValueChange={onChange} value={value} disabled={disabled}>
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue placeholder={placeholder} />
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

