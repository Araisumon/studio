
"use client"; 

import { CorrectionInterface } from "@/components/polyglot-pal/CorrectionInterface";
import { Languages, Home, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { BackToTopButton } from "@/components/common/BackToTopButton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

export default function PolyglotPalPage() {
  const { toast } = useToast();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast({
          title: "Link Copied!",
          description: "Polyglot Pal link copied to your clipboard.",
        });
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          variant: "destructive",
          title: "Failed to Copy",
          description: "Could not copy the link to clipboard.",
        });
      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 relative">
      <header className="w-full mb-8">
        <div className="flex items-center justify-between py-4 border-b">
          <div className="text-2xl font-bold text-accent">
            Buzz
          </div>

          <div className="flex-grow flex flex-col items-center">
            <div className="flex items-center justify-center space-x-2">
              <Languages className="h-9 w-9 text-primary md:h-10 md:w-10" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Polyglot Pal
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Share Polyglot Pal" onClick={handleShare}>
                    <Share2 className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy link to share</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ThemeToggle />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/" passHref>
                    <Button variant="ghost" size="icon" aria-label="Home">
                      <Home className="h-6 w-6" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Go to Home</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <p className="text-center mt-4 text-lg text-muted-foreground">
          Your AI-powered multilingual writing assistant and translator.
        </p>
      </header>
      
      <main className="w-full max-w-3xl">
        <CorrectionInterface />
      </main>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Polyglot Pal. Enhance your writing and break language barriers effortlessly.</p>
      </footer>
      <BackToTopButton />
    </div>
  );
}
