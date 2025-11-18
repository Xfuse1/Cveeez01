import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userRole, conversationHistory, userName } = body;

    console.log('Chatbot API called with:', { message, userRole, userName });

    // Validate required fields
    if (!message || !userRole) {
      return NextResponse.json(
        { error: 'Message and userRole are required' },
        { status: 400 }
      );
    }

    // Validate userRole
    if (!['seeker', 'employer', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Invalid userRole. Must be seeker, employer, or admin' },
        { status: 400 }
      );
    }

    // Role-specific context
    const roleContext = {
      seeker: 'The user is a Job Seeker. Help them with CV building, job applications, and career guidance.',
      employer: 'The user is an Employer. Help them with job postings, candidate screening, and hiring process.',
      admin: 'The user is an Admin. Help them with platform management, user administration, and analytics.',
    };

    // Build conversation history
    const historyText = conversationHistory && conversationHistory.length > 0
      ? conversationHistory.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')
      : '';

    const greeting = userName ? `Hello ${userName}! ` : '';

    // Create prompt
    const prompt = `You are a helpful AI assistant for a CV and job platform.

User Role: ${userRole.toUpperCase()}
${roleContext[userRole as keyof typeof roleContext]}

${historyText ? `Previous Conversation:\n${historyText}\n` : ''}

Current User Message: "${message}"

Instructions:
- Provide helpful, accurate responses about the platform
- Be friendly and professional
- Respond in the same language as the user (Arabic or English)
- Keep responses concise but informative (2-4 sentences)
- Add relevant emojis to make it friendly
- If the user asks about:
  * CV building → Explain our AI CV Builder service
  * Jobs → Explain job search and application features
  * Wallet → Explain payment and wallet system
  * Customer service → Tell them you can help or escalate if needed

${greeting}Respond now:`;

    console.log('Calling AI generate...');

    // Call Gemini AI using Genkit
    const result = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const responseText = result.text;

    console.log('AI Response:', responseText);

    // Check if escalation is needed
    const escalationKeywords = [
      'تواصل مع خدمة العملاء', 'talk to human', 'speak to agent', 
      'customer service', 'support', 'مشكلة في الدفع', 'payment issue'
    ];
    const requiresEscalation = escalationKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    // Generate suggested actions
    const suggestedActions: string[] = [];
    if (userRole === 'seeker') {
      if (message.toLowerCase().includes('cv') || message.toLowerCase().includes('سيرة')) {
        suggestedActions.push('Build CV with AI', 'View CV Templates');
      }
      if (message.toLowerCase().includes('job') || message.toLowerCase().includes('وظيفة')) {
        suggestedActions.push('Browse Jobs', 'View My Applications');
      }
      if (message.toLowerCase().includes('wallet') || message.toLowerCase().includes('محفظة')) {
        suggestedActions.push('Add Funds', 'View Transactions');
      }
    } else if (userRole === 'employer') {
      if (message.toLowerCase().includes('job') || message.toLowerCase().includes('وظيفة')) {
        suggestedActions.push('Post New Job', 'View My Jobs');
      }
      if (message.toLowerCase().includes('applicant') || message.toLowerCase().includes('متقدم')) {
        suggestedActions.push('Review Applications');
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        response: responseText,
        suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
        requiresEscalation,
      },
    });
  } catch (error) {
    console.error('Chatbot API error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to process chatbot request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
