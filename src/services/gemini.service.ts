
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { environment } from '../environment';


export interface Quiz {
  question: string;
  options: string[];
  answer: string;
}

export interface TopicDetails {
  explanation: string;
  codeExample: string;
  quiz: Quiz | null;
}

export interface ResourceCategory {
  category: string;
  topics: string[];
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Use the API key from environment configuration
    const apiKey = environment.geminiApiKey;

    console.log('Initializing Gemini service...');
    console.log('API Key configured:', apiKey ? 'Yes (key exists)' : 'No (missing)');

    if (!apiKey || apiKey === 'YOUR_API_KEY_PLACEHOLDER') {
      console.error('GEMINI_API_KEY is not set. Please configure it in src/environment.ts');
    }

    this.ai = new GoogleGenAI({ apiKey });
    console.log('Gemini AI initialized successfully');
  }

  async generateExplanation(skillName: string): Promise<string> {
    const prompt = `As an expert instructor, explain the core concept of ${skillName} for a beginner developer. In a concise paragraph, cover its primary purpose, what makes it unique, and why it's a valuable skill in modern web development.`;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating explanation:', error);
      return 'Sorry, I couldn\'t generate an explanation right now. Please try again.';
    }
  }

  async generateCodeExample(skillName: string): Promise<string> {
    const prompt = `Provide a simple, well-commented "hello world" or basic usage code example for ${skillName}. The code should be self-contained, easy to copy and run, and perfectly illustrate a fundamental concept. Use markdown for the code block.`;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating code example:', error);
      return 'Sorry, I couldn\'t generate a code example right now. Please try again.';
    }
  }

  async generateQuiz(skillName: string): Promise<Quiz | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Create a multiple-choice quiz question about a fundamental concept in ${skillName}. Provide 4 options and clearly indicate the correct answer. The question should be clear and test a key piece of knowledge.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              answer: { type: Type.STRING }
            },
            required: ["question", "options", "answer"]
          },
        },
      });

      const jsonStr = response.text.trim();
      return JSON.parse(jsonStr) as Quiz;

    } catch (error) {
      console.error('Error generating quiz:', error);
      return null;
    }
  }

  async generateResourceTopics(skillName: string): Promise<ResourceCategory[]> {
    const prompt = `Generate a comprehensive list of topics for learning ${skillName}, from basic to advanced. Group the topics into categories representing proficiency levels (e.g., "Beginner Concepts", "Intermediate Topics", "Advanced Techniques"). Return a JSON object containing a 'curriculum' array.`;
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              curriculum: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING, description: "The proficiency level, e.g., 'Beginner'" },
                    topics: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "A list of topics for this category."
                    }
                  },
                  required: ["category", "topics"]
                }
              }
            },
            required: ["curriculum"]
          }
        }
      });
      const jsonStr = response.text.trim();
      return (JSON.parse(jsonStr) as { curriculum: ResourceCategory[] }).curriculum;
    } catch (error) {
      console.error('Error generating resource topics:', error);
      return [];
    }
  }

  async generateTopicDetail(skillName: string, topic: string): Promise<TopicDetails | null> {
    const prompt = `Act as a Principal Technical Instructor. Your knowledge base is synthesized from the best learning websites and official documentation on the internet. Create a comprehensive, in-depth learning module for a beginner learning ${skillName}, focusing on the topic: "${topic}".
The goal is to provide a full, simplified, yet thorough conceptual understanding.
Return a JSON object with three keys: "explanation", "codeExample", and "quiz".
- "explanation": Write a detailed but beginner-friendly explanation. Structure the content with markdown headings. Cover the '### Core Concept' (what it is), '### Why It's Important' (its use cases and benefits), and '### Practical Usage & Best Practices' (how it's used in real-world scenarios). Use analogies to simplify complex ideas. This should be like a chapter in a high-quality online course.
- "codeExample": Provide a simple, well-commented code example in a markdown block that is easy to copy, run, and understand. It must directly demonstrate the core concept explained.
- "quiz": Create a single, high-quality multiple-choice question with 4 options and the correct answer to test understanding of this specific topic. If a quiz is not applicable, set the value to null.`;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              explanation: { type: Type.STRING, description: "A comprehensive, in-depth, and beginner-friendly explanation of the topic, covering what, why, and how, with analogies and best practices." },
              codeExample: { type: Type.STRING, description: "A simple, well-commented code example in a markdown block." },
              quiz: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING }
                },
                required: ["question", "options", "answer"]
              }
            },
            required: ["explanation", "codeExample"]
          }
        }
      });

      const jsonStr = response.text.trim();
      console.log('Topic detail response received for:', topic);

      const parsed = JSON.parse(jsonStr) as TopicDetails;

      // Validate the response has required fields
      if (!parsed.explanation || !parsed.codeExample) {
        console.error('Invalid topic details response - missing required fields');
        return null;
      }

      return parsed;
    } catch (error) {
      console.error(`Error generating structured detail for topic "${topic}":`, error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return null;
    }
  }

  async generatePracticeProblem(skillName: string): Promise<string> {
    const prompt = `Create a simple practice problem or coding challenge for a beginner learning ${skillName}. The problem should be solvable with a few lines of code and focus on a core concept. Describe the task clearly and provide a hint.`;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating practice problem:', error);
      return 'Could not generate a practice problem. Please try again.';
    }
  }

  async generateCodeFeedback(skillName: string, problem: string, userCode: string): Promise<string> {
    const prompt = `As an expert in ${skillName}, review the following code written by a beginner for the problem: "${problem}". Provide constructive, encouraging feedback. If the code is correct, praise it and suggest one minor improvement or an alternative approach to broaden their understanding. If there are errors, explain them clearly and provide a corrected code snippet. Format the response using markdown.

    User's Code:
    \`\`\`
    ${userCode}
    \`\`\``;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating code feedback:', error);
      return 'Sorry, I couldn\'t provide feedback right now. Please try again.';
    }
  }

  async generateQuickValidation(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error validating code:', error);
      return 'Sorry, I couldn\'t validate your code right now. Please try again.';
    }
  }
}
