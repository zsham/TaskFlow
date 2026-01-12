
import { GoogleGenAI, Type } from "@google/genai";
import { Task, ProjectInsight } from "../types";

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
      // Remove data:image/png;base64, prefix if present
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
