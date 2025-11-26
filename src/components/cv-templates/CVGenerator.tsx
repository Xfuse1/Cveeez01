"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';

export default function CVGenerator({ onGenerated }: { onGenerated?: (data: AICVBuilderFromPromptOutput) => void }) {
  const [prompt, setPrompt] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AICVBuilderFromPromptOutput | null>(null);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [metricAnswers, setMetricAnswers] = useState<Record<string,string>>({});
  const [suggestedMetrics, setSuggestedMetrics] = useState<string[]>([]);

  async function callGenerate(extraPrompt?: string) {
    setLoading(true);
    try {
      const body = { prompt: (prompt + '\n' + (extraPrompt || '')).trim(), language, targetJobTitle, targetIndustry, preferQuantified: true };
      const res = await fetch('/api/cv/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Generation failed');
      setResult(json.data);

      // Check additionalSections for Suggested Metrics
      const metricsSection = json.data.additionalSections?.find((s: any) => s.title === 'Suggested Metrics');
      if (metricsSection && metricsSection.items && metricsSection.items.length > 0) {
        setSuggestedMetrics(metricsSection.items);
        setShowMetricsModal(true);
      } else {
        if (onGenerated) onGenerated(json.data);
      }
    } catch (err: any) {
      console.error('Generation error', err);
      alert(err?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  async function submitMetrics() {
    // Convert metric answers into a short text block appended to prompt and re-run generation
    const extra = Object.entries(metricAnswers).map(([q, a]) => `${q} Answer: ${a}`).join('\n');
    setShowMetricsModal(false);
    await callGenerate('\n' + extra);
    if (onGenerated && result) onGenerated(result);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Target Job Title</label>
        <Input value={targetJobTitle} onChange={(e: any) => setTargetJobTitle(e.target.value)} placeholder="Senior React Developer" />
      </div>

      <div>
        <label className="block text-sm font-medium">Target Industry</label>
        <Input value={targetIndustry} onChange={(e: any) => setTargetIndustry(e.target.value)} placeholder="Fintech" />
      </div>

      <div>
        <label className="block text-sm font-medium">Your current resume / notes</label>
        <Textarea value={prompt} onChange={(e: any) => setPrompt(e.target.value)} rows={8} />
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={() => callGenerate()} disabled={loading || !prompt || !targetJobTitle || !targetIndustry}>{loading ? 'Generating…' : 'Generate CV'}</Button>
      </div>

      {result && (
        <div className="mt-4">
          <h3 className="font-bold">Preview</h3>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {showMetricsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded max-w-xl w-full">
            <h3 className="text-lg font-bold mb-2">Suggested Metrics</h3>
            <p className="text-sm mb-4">Please supply numeric answers for the following questions to improve the CV's quantifiable achievements.</p>
            <div className="space-y-3 max-h-64 overflow-auto">
              {suggestedMetrics.map((q, i) => (
                <div key={i}>
                  <label className="text-sm">{q}</label>
                  <Input value={metricAnswers[q] || ''} onChange={(e:any) => setMetricAnswers(prev => ({ ...prev, [q]: e.target.value }))} placeholder="e.g. 20%" />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setShowMetricsModal(false)}>Skip</Button>
              <Button onClick={submitMetrics}>Submit Metrics</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
