
import { CorrectionInterface } from "@/components/polyglot-pal/CorrectionInterface";
import { Languages, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PolyglotPalPage() {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      <header className="w-full mb-8">
        <div className="flex items-center justify-between py-4 border-b"> {/* Added border-b for a subtle separation */}
          {/* Left: Brand Name */}
          <div className="text-2xl font-bold text-accent"> {/* Changed text color to accent */}
            Buzz
          </div>

          {/* Middle: Title and Icon */}
          <div className="flex-grow flex flex-col items-center">
            <div className="flex items-center justify-center space-x-2">
              <Languages className="h-9 w-9 text-primary md:h-10 md:w-10" /> {/* Adjusted size */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"> {/* Adjusted size */}
                Polyglot Pal
              </h1>
            </div>
          </div>

          {/* Right: Home Button */}
          <div className="w-auto"> {/* Ensured right div doesn't over-shrink middle */}
            <Link href="/" passHref>
              <Button variant="ghost" size="icon" aria-label="Home">
                <Home className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
        {/* Subtitle below the main header row */}
        <p className="text-center mt-4 text-lg text-muted-foreground"> {/* Adjusted margin-top */}
          Your AI-powered multilingual writing assistant and translator.
        </p>
      </header>
      
      <main className="w-full max-w-3xl">
        <CorrectionInterface />
      </main>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Polyglot Pal. Enhance your writing and break language barriers effortlessly.</p>
      </footer>
    </div>
  );
}
