/**
 * SyncSpace Backend — Gemini AI Service
 * Integrates Google Gemini API for intelligent features
 */

/**
 * Service for interacting with Google Gemini API.
 * Provides AI-powered features like summarization and task generation.
 */
export class GeminiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  /**
   * Check if the Gemini API is configured
   */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Generate content using Gemini API
   */
  private async generateContent(prompt: string): Promise<string> {
    if (!this.isConfigured()) {
      return this.getFallbackResponse(prompt);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
              topP: 0.95,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: any = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  /**
   * Summarize channel messages or meeting notes
   */
  async summarize(text: string, context: string = 'channel'): Promise<{
    summary: string;
    keyPoints: string[];
    actionItems: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
  }> {
    const prompt = `You are an AI assistant for a team collaboration tool called SyncSpace.
    
Analyze the following ${context} content and provide a structured summary.
Return your response as a JSON object with these fields:
- "summary": A concise 2-3 sentence summary
- "keyPoints": An array of 3-5 key discussion points  
- "actionItems": An array of action items identified from the discussion
- "sentiment": Overall team sentiment ("positive", "neutral", or "negative")

Content to analyze:
${text}

Respond with ONLY the JSON object, no markdown formatting.`;

    const response = await this.generateContent(prompt);
    
    try {
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        summary: response.slice(0, 200),
        keyPoints: ['Unable to parse structured response'],
        actionItems: [],
        sentiment: 'neutral',
      };
    }
  }

  /**
   * Generate task suggestions from meeting notes or descriptions
   */
  async generateTasks(text: string): Promise<Array<{
    title: string;
    description: string;
    priority: string;
    estimatedHours: number;
  }>> {
    const prompt = `You are an AI assistant for a team collaboration tool called SyncSpace.
    
Based on the following text, generate a list of actionable tasks.
Return your response as a JSON array of task objects with these fields:
- "title": Short, clear task title (max 100 chars)
- "description": Detailed task description
- "priority": One of "low", "medium", "high", "urgent"
- "estimatedHours": Estimated hours to complete (number)

Text to analyze:
${text}

Generate 3-5 meaningful tasks. Respond with ONLY the JSON array, no markdown formatting.`;

    const response = await this.generateContent(prompt);
    
    try {
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return [{
        title: 'Review and plan action items',
        description: text.slice(0, 200),
        priority: 'medium',
        estimatedHours: 2,
      }];
    }
  }

  /**
   * Smart search — natural language query over project data
   */
  async smartSearch(query: string, context: string): Promise<string> {
    const prompt = `You are an AI assistant for a team collaboration tool called SyncSpace.
    
A team member is searching for: "${query}"

Here is the current project context:
${context}

Provide a helpful, concise answer based on the available context. If the information isn't available, say so clearly.`;

    return this.generateContent(prompt);
  }

  /**
   * Fallback responses when API key is not configured
   */
  private getFallbackResponse(prompt: string): string {
    if (prompt.includes('summarize') || prompt.includes('summary')) {
      return JSON.stringify({
        summary: 'AI summarization requires a Gemini API key. Configure GEMINI_API_KEY in your .env file.',
        keyPoints: ['Set up Google Gemini API key for AI features'],
        actionItems: ['Configure GEMINI_API_KEY environment variable'],
        sentiment: 'neutral',
      });
    }
    
    if (prompt.includes('tasks') || prompt.includes('actionable')) {
      return JSON.stringify([{
        title: 'Configure AI Integration',
        description: 'Set up Google Gemini API key to enable AI-powered task generation',
        priority: 'medium',
        estimatedHours: 1,
      }]);
    }
    
    return 'AI features require a Gemini API key. Please configure GEMINI_API_KEY in your .env file.';
  }
}

/** Singleton instance */
export const geminiService = new GeminiService();
