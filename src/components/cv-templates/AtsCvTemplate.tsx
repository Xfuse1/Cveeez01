
import type { AICVBuilderFromPromptOutput } from '@/ai/flows/ai-cv-builder-from-prompt';

interface TemplateProps {
  cvData: AICVBuilderFromPromptOutput;
}

export function AtsCvTemplate({ cvData }: TemplateProps) {
  return (
    <div className="p-4 bg-white text-black font-sans text-sm">
      {/* Header - No name to be more ATS friendly */}
      <div className="text-center border-b pb-2 mb-4">
         {/* Personal info can be added here if needed */}
      </div>

      {/* Summary */}
      <div className="mb-4">
        <h2 className="text-lg font-bold border-b pb-1 mb-2 uppercase tracking-wider">Professional Summary</h2>
        <p className="text-sm">{cvData.summary}</p>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <h2 className="text-lg font-bold border-b pb-1 mb-2 uppercase tracking-wider">Skills</h2>
        <p className="text-sm">{cvData.skills.join(' | ')}</p>
      </div>

      {/* Experience */}
      <div className="mb-4">
        <h2 className="text-lg font-bold border-b pb-1 mb-2 uppercase tracking-wider">Work Experience</h2>
        {cvData.experiences.map((exp, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-baseline">
              <h3 className="font-bold text-base">{exp.jobTitle}</h3>
              <p className="text-sm font-medium">{exp.startDate} - {exp.endDate}</p>
            </div>
            <p className="font-medium italic text-sm">{exp.company}, {exp.location}</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {exp.responsibilities.map((resp, i) => (
                <li key={i} className="text-sm">{resp}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Education */}
      <div>
        <h2 className="text-lg font-bold border-b pb-1 mb-2 uppercase tracking-wider">Education</h2>
        {cvData.education.map((edu, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-base">{edu.degree}, {edu.fieldOfStudy}</h3>
                <p className="text-sm font-medium">{edu.graduationYear}</p>
            </div>
            <p className="font-medium italic text-sm">{edu.institution}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
