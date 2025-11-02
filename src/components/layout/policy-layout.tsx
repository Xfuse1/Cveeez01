import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

interface PolicySection {
  title: string;
  content: string;
}

interface PolicyLayoutProps {
  title: string;
  sections: PolicySection[];
}

export function PolicyLayout({ title, sections }: PolicyLayoutProps) {
  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-center md:text-5xl font-headline mb-4 text-primary">
            {title}
          </h1>
          <p className="text-center text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="prose dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold font-headline">{section.title}</h2>
                <p className="text-muted-foreground">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
