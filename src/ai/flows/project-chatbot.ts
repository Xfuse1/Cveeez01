/**
 * Project Chatbot Flow
 * 
 * This flow handles intelligent conversations about the CV project platform.
 * It provides contextual help for seekers, employers, and admins.
 */

import { getAI } from '../genkit';
import { z } from 'zod';

// Input schema for chatbot
const ChatbotInputSchema = z.object({
  message: z.string().describe('User message/question'),
  userRole: z.enum(['seeker', 'employer', 'admin']).describe('User role in the system'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('Previous conversation messages'),
  userName: z.string().optional().describe('User name for personalization'),
});

// Output schema
const ChatbotOutputSchema = z.object({
  response: z.string().describe('Chatbot response message'),
  suggestedActions: z.array(z.string()).optional().describe('Suggested actions or links'),
  requiresEscalation: z.boolean().describe('Whether this needs customer service escalation'),
});

// Project knowledge base
const PROJECT_KNOWLEDGE = `
# CV Platform Knowledge Base

## Platform Overview
This is a comprehensive CV and job platform that serves three main user types:
1. **Job Seekers**: Can build CVs with AI, apply for jobs, manage applications
2. **Employers**: Can post jobs, review applications, manage hiring
3. **Admins**: Can manage all users, jobs, and platform operations

## Main Features

### For Job Seekers:
- **AI CV Builder**: Generate professional CVs using AI based on your information
  - Multiple CV templates (ATS-friendly, Modern, Professional, etc.)
  - AI-powered content suggestions and improvements
  - CV scoring and optimization tips
  - Export CVs as PDF
- **Job Board**: Browse and search for jobs with smart filters
  - Location, salary, job type filters
  - Job recommendations based on profile
  - Save jobs for later
- **Application Tracking**: Track all your job applications
  - View application status (pending, reviewed, shortlisted, rejected)
  - Get notifications on application updates
- **Talent Space**: Professional networking and community features
  - Create posts and share experiences
  - Connect with other professionals
  - Join industry groups
- **Wallet**: Manage payments and subscriptions
  - Add funds to wallet
  - Purchase premium services
  - View transaction history
- **Dashboard**: Personal dashboard with:
  - Profile completion status
  - Active applications count
  - Recommended jobs
  - Recent orders and wallet balance

### For Employers:
- **Post Jobs**: Create and manage job listings
  - Set job requirements and qualifications
  - Define salary ranges and benefits
  - Manage application deadlines
- **Review Applications**: Screen candidates efficiently
  - View candidate CVs and profiles
  - Filter by qualifications and experience
  - Shortlist and schedule interviews
- **Company Profile**: Build company presence
  - Add company information and logo
  - Showcase company culture
  - Display job openings
- **Dashboard**: Employer dashboard with:
  - Total job postings
  - Applications received
  - Active job listings
  - Analytics and insights

### For Admins:
- **User Management**: Manage all platform users
  - View seeker and employer profiles
  - Delete or suspend accounts
  - Monitor user activity
- **Job Management**: Oversee all job postings
  - Review and approve jobs
  - Remove inappropriate postings
  - Monitor job performance
- **Platform Analytics**: Comprehensive insights
  - Total users, jobs, applications
  - Revenue and transaction tracking
  - Platform usage statistics
- **Customer Support**: Handle user inquiries and issues

## Services & Pricing
- **Free Services**: Basic job search, standard CV templates
- **Premium Services**: AI CV Builder, priority applications, premium templates
- **Payment**: Wallet system with Egyptian Pounds (EGP)

## Technical Features
- Multi-language support (English & Arabic)
- Real-time notifications
- Secure authentication with Firebase
- Responsive design for mobile and desktop
- Cloud storage for CVs and documents

## Common Questions

### Account & Profile
Q: How do I complete my profile?
A: Go to your dashboard, click on profile settings, and fill in all required fields including personal info, education, experience, and skills.

Q: How do I change my password?
A: Navigate to Settings → Security → Change Password.

Q: Can I switch between seeker and employer accounts?
A: No, you need separate accounts for different roles. However, you can sign up for both with different emails.

### CV Builder
Q: How does the AI CV Builder work?
A: Simply provide your information and career goals. Our AI analyzes your data and generates a professionally formatted CV optimized for ATS systems and recruiters.

Q: Can I download my CV?
A: Yes! All CVs can be downloaded as PDF files once completed.

Q: How many CV versions can I create?
A: Premium users can create unlimited versions. Free users are limited to 2 versions.

### Jobs & Applications
Q: How do I apply for a job?
A: Click on any job listing, review the requirements, and click "Apply Now". Select your CV version and submit your application.

Q: Can I track my applications?
A: Yes! Your dashboard shows all your applications with their current status.

Q: What do the application statuses mean?
- Pending: Application received, awaiting review
- Reviewed: Employer has viewed your application
- Shortlisted: You're selected for next round
- Rejected: Application not selected
- Withdrawn: You cancelled the application

### Payments & Wallet
Q: How do I add funds to my wallet?
A: Click "Add Funds" in your wallet section, choose amount, and complete payment.

Q: What payment methods are accepted?
A: We accept credit/debit cards, mobile wallets, and bank transfers.

Q: Are refunds available?
A: Yes, unused credits can be refunded within 30 days according to our refund policy.

### Customer Support
Q: How can I contact customer service?
A: You can reach customer service through:
- This chat (for general inquiries)
- Email: support@cvplatform.com
- WhatsApp: [Will be integrated in future]
- Phone: Available in contact section

Q: What are support hours?
A: 24/7 automated support through this chatbot. Human support available Sunday-Thursday, 9 AM - 5 PM EGT.
`;

export const projectChatbotFlow = getAI().defineFlow(
  {
    name: 'projectChatbot',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input) => {
    const { message, userRole, conversationHistory = [], userName } = input;

    // Build conversation context
    const historyContext = conversationHistory.length > 0
      ? conversationHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')
      : '';

    // Role-specific context
    const roleContext = {
      seeker: 'The user is a Job Seeker. Focus on helping them with CV building, job applications, and career guidance.',
      employer: 'The user is an Employer. Focus on helping them with job postings, candidate screening, and hiring process.',
      admin: 'The user is an Admin. Focus on helping them with platform management, user administration, and analytics.',
    };

    const greeting = userName ? `Hello ${userName}! ` : 'Hello! ';

    // Create the prompt
    const prompt = `You are an intelligent, friendly, and professional customer support chatbot for a CV and job platform.

${PROJECT_KNOWLEDGE}

User Role: ${userRole.toUpperCase()}
${roleContext[userRole]}

${historyContext ? `Previous Conversation:\n${historyContext}\n` : ''}

Current User Message: "${message}"

Instructions:
1. Provide accurate, helpful, and contextual responses based on the platform knowledge
2. Be conversational, friendly, and professional
3. Give step-by-step guidance when needed
4. Suggest relevant features or actions that might help the user
5. If the question is about customer service escalation, billing disputes, or technical issues you can't resolve, indicate escalation is needed
6. Use the user's language (respond in Arabic if they write in Arabic, English if they write in English)
7. Keep responses concise but comprehensive
8. Add relevant emojis to make the conversation friendly (but don't overdo it)

Respond now:`;

    // Call Gemini AI
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    const responseText = llmResponse.text;

    // Analyze if escalation is needed
    const escalationKeywords = [
      'تواصل مع خدمة العملاء',
      'تحدث مع موظف',
      'اتكلم مع حد',
      'مشكلة في الدفع',
      'talk to human',
      'speak to agent',
      'customer service',
      'payment issue',
      'billing problem',
      'technical support',
      'can\'t login',
      'account locked',
    ];

    const requiresEscalation = escalationKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    // Generate suggested actions based on context
    const suggestedActions: string[] = [];
    
    if (userRole === 'seeker') {
      if (message.toLowerCase().includes('cv') || message.toLowerCase().includes('سيرة')) {
        suggestedActions.push('Build CV with AI', 'View CV Templates');
      }
      if (message.toLowerCase().includes('job') || message.toLowerCase().includes('وظيفة')) {
        suggestedActions.push('Browse Jobs', 'View My Applications');
      }
      if (message.toLowerCase().includes('wallet') || message.toLowerCase().includes('محفظة')) {
        suggestedActions.push('Add Funds', 'View Transaction History');
      }
    } else if (userRole === 'employer') {
      if (message.toLowerCase().includes('job') || message.toLowerCase().includes('وظيفة')) {
        suggestedActions.push('Post New Job', 'Manage Job Listings');
      }
      if (message.toLowerCase().includes('applicant') || message.toLowerCase().includes('متقدم')) {
        suggestedActions.push('Review Applications', 'View Candidates');
      }
    } else if (userRole === 'admin') {
      suggestedActions.push('View Analytics', 'Manage Users', 'Review Jobs');
    }

    return {
      response: responseText,
      suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
      requiresEscalation,
    };
  }
);
