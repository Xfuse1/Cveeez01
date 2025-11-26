import React from 'react';

// Load CVGenerator as a client-side component wrapper
import CVGeneratorWrapper from '@/components/cv-templates/CVGeneratorWrapper';

export const metadata = {
  title: 'AI CV Generator',
  description: 'Generate ATS-friendly, quantified CVs using AI',
};

export default function Page() {
  return (
    <main className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">AI CV Generator</h1>
        <p className="text-sm text-muted-foreground mb-6">Provide your details and target job to generate an ATS-friendly CV.</p>

        {/* Client component wrapper */}
        <CVGeneratorWrapper />
      </div>
    </main>
  );
}
