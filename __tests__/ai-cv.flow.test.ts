import { aiCvBuilderFromPrompt } from '@/ai/flows/ai-cv-builder-from-prompt';

jest.mock('@/ai/groq', () => ({
  callGroqWithFallback: jest.fn(async () => {
    // Return a safe JSON that matches the schema
    return JSON.stringify({
      fullName: 'John Doe',
      jobTitle: 'Senior React Developer',
      contactInfo: {},
      headings: { summary: 'Summary', experience: 'Experience', education: 'Education', skills: 'Skills' },
      summary: 'Experienced React dev',
      experiences: [
        { jobTitle: 'React Dev', company: 'Acme', location: 'Cairo', startDate: 'Jan 2020', endDate: 'Present', responsibilities: ['Led X project'] }
      ],
      education: [],
      certifications: [],
      coreSkills: ['React'],
      technicalSkills: ['React'],
      softSkills: ['Teamwork'],
      languages: [],
      projects: [],
      additionalSections: [{ title: 'Suggested Metrics', items: ['What % did you improve performance?'] }]
    });
  })
}));

describe('ai-cv flow', () => {
  it('parses and validates generated CV JSON', async () => {
    const res = await aiCvBuilderFromPrompt({ prompt: 'sample', language: 'en', targetJobTitle: 'Senior React Developer', targetIndustry: 'Fintech' });
    expect(res.fullName).toBe('John Doe');
    expect(Array.isArray(res.experiences)).toBe(true);
    const metrics = res.additionalSections?.find(s => s.title === 'Suggested Metrics');
    expect(metrics).toBeDefined();
  });
});
