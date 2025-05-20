
import { CorrectionInterface } from "@/components/polyglot-pal/CorrectionInterface";
import { Languages } from "lucide-react";

export default function PolyglotPalPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center space-x-3">
          <Languages className="h-12 w-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Polyglot Pal
          </h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
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
