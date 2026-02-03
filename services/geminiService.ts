
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Task, ProjectInsight, User, ChatMessage } from "../types";

export async function generateSubtasks(title: string, description: string, imageBase64?: string): Promise<string[]> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [
      { text: `Break down the following task into exactly 4-6 actionable subtasks.
      Title: ${title}
      Description: ${description}
      ${imageBase64 ? "I have also attached an image for visual context. Please use it to make the subtasks more specific." : ""}` }
    ];

    if (imageBase64) {
      const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating subtasks:", error);
    return [];
  }
}

export async function getProjectInsights(tasks: Task[]): Promise<ProjectInsight | null> {
  if (tasks.length === 0) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const taskSummary = tasks.map(t => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      subtasksCompleted: t.subtasks.filter(st => st.isCompleted).length,
      totalSubtasks: t.subtasks.length
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these tasks and provide insights on project progress and potential bottlenecks:
      Tasks: ${JSON.stringify(taskSummary)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A high-level summary of progress" },
            productivityScore: { type: Type.NUMBER, description: "Score from 0 to 100 based on completion rates" },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 concrete recommendations to improve velocity"
            }
          },
          required: ["summary", "productivityScore", "recommendations"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating insights:", error);
    return null;
  }
}

export async function* streamPersonnelResponse(
  targetUser: User, 
  userTasks: Task[], 
  messageHistory: ChatMessage[], 
  newMessage: string
) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const taskList = userTasks.map(t => `- ${t.title} (${t.status})`).join('\n');
    
    const systemInstruction = `You are ${targetUser.name}, a ${targetUser.role} at TaskFlow. 
    You are professional, efficient, and helpful. 
    You are currently assigned to the following tasks:
    ${taskList || 'No tasks currently assigned.'}
    
    Respond to the user's message in character. Keep responses concise and focused on project productivity. 
    Do not mention you are an AI. Use a tone appropriate for a professional workplace environment.`;

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: messageHistory.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }))
    });

    const result = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of result) {
      const responseChunk = chunk as GenerateContentResponse;
      yield responseChunk.text;
    }
  } catch (error) {
    console.error("Personnel chat error:", error);
    yield "I'm having trouble connecting to the network right now. Please try again in a moment.";
  }
}
