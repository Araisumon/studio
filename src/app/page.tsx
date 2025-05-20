
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
          description: "Polyglot Buzz link copied to your clipboard.",
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
    <div className="min-h-screen flex flex-col items-center">
      <header className="w-full sticky top-0 z-40 bg-background">
        <div className="container mx-auto flex items-center justify-between py-3 px-4 md:px-6 bg-card shadow-md">
          <div className="text-2xl font-bold text-accent">
            Buzz
          </div>

          <div className="flex-grow flex flex-col items-center">
            <div className="flex items-center justify-center space-x-2">
              <Languages className="h-8 w-8 text-primary md:h-9 md:w-9" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                Polyglot Buzz
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Share Polyglot Buzz" onClick={handleShare}>
                    <Share2 className="h-5 w-5 md:h-6 md:w-6" />
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
                      <Home className="h-5 w-5 md:h-6 md:w-6" />
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
      </header>
      
      <div className="w-full p-4 md:p-8 flex flex-col items-center">
        <p className="text-center my-6 text-md md:text-lg text-muted-foreground max-w-2xl">
          Refine your writing or translate text in moments. Enter your text, pick your languages, and let Polyglot Buzz assist you!
        </p>
        
        <main className="w-full max-w-3xl">
          <CorrectionInterface />
        </main>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Polyglot Buzz. Enhance your writing and break language barriers effortlessly.</p>
        </footer>
      </div>
      <BackToTopButton />
    </div>
  );
}
