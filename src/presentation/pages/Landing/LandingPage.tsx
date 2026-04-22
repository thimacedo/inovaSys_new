import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProblemSolution } from './components/ProblemSolution';
import { ProcessSteps } from './components/ProcessSteps';
import { Features } from './components/Features';
import { Experience } from './components/Experience';
import { AIAssistant } from './components/AIAssistant';
import { Stats } from './components/Stats';
import { Future } from './components/Future';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';

export function LandingPage({ onLogin, onDocsView }: { onLogin: () => void, onDocsView: () => void }) {
  return (
    <div className="min-h-screen bg-md-surface selection:bg-md-primary/20 selection:text-md-primary">
      <Navbar onLogin={onLogin} onDocsView={onDocsView} />
      
      <main>
        <Hero onAction={onLogin} />
        
        <Stats />
        
        <div className="space-y-0">
          <ProblemSolution />
          <ProcessSteps />
          <Experience />
          <AIAssistant />
          <Features />
          <Future />
          <FAQ />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
