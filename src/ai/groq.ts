import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export interface GroqChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export async function callGroq(
    messages: GroqChatMessage[],
    model: string = 'llama-3.1-70b-versatile',
    temperature: number = 0.2
): Promise<string> {
    try {
        const completion = await groq.chat.completions.create({
            messages,
            model,
            temperature,
            max_tokens: 8000,
            top_p: 0.8,
        });

        return completion.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Groq API Error:', error);
        throw error;
    }
}

export async function callGroqWithFallback(
    messages: GroqChatMessage[],
    temperature: number = 0.2
): Promise<string> {
    const models = [
        'llama-3.1-70b-versatile',  // Best quality
        'llama-3.1-8b-instant',     // Fastest
        'mixtral-8x7b-32768',       // Good for long context
    ];

    let lastError: any = null;

    for (const model of models) {
        try {
            return await callGroq(messages, model, temperature);
        } catch (error) {
            console.error(`Failed with model ${model}:`, error);
            lastError = error;
            continue;
        }
    }

    throw lastError || new Error('All Groq models failed');
}
