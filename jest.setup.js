// Test setup: provide a dummy GEMINI_API_KEY so AI flows don't throw
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-local-key';

// Mock the genkit AI module so tests don't call external models
const safeResponse = {
  text: JSON.stringify({
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
  })
};

jest.mock('@/ai/genkit', () => ({
  getAI: () => ({
    generate: async () => safeResponse,
  }),
}));
