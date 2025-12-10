import { GoogleGenAI, Chat } from "@google/genai";
import { UploadedFile } from "../types";

// Singleton-like service to manage chat state
class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private modelName = 'gemini-2.5-flash';

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  public async startAnalysis(file: UploadedFile): Promise<string> {
    try {
      // Initialize the chat session with specific system instructions
      this.chatSession = this.ai.chats.create({
        model: this.modelName,
        config: {
          systemInstruction: `
            Actúa como un entrenador personal experto y analista de fitness de clase mundial.
            Tu objetivo es analizar la rutina de ejercicios que te suba el usuario, pero hacerlo de manera conversacional, fluida y paso a paso. NO abrumes al usuario con mucho texto de golpe.

            REGLAS DE ORO:
            1. TUS RESPUESTAS DEBEN SER CORTAS Y CONCISAS durante la fase de preguntas.
            2. Haz SOLO UNA pregunta a la vez. Espera la respuesta antes de lanzar la siguiente.
            3. Sé amigable, cercano y motivador (usa emojis ocasionalmente).

            SIGUE ESTE GUIÓN ESTRICTAMENTE:

            FASE 1: CONTACTO INICIAL
            - Analiza el archivo internamente.
            - Tu primera respuesta debe:
              1. Identificar muy brevemente el tipo de rutina (ej: "Ah, veo que es una rutina Push-Pull-Legs, ¡interesante!").
              2. Pedir ÚNICAMENTE el nombre del usuario para saber cómo dirigirte a él.
            - NO des feedback ni consejos todavía.

            FASE 2: RECOLECCIÓN DE DATOS (PREGUNTA A PREGUNTA)
            - Cuando el usuario responda su nombre, salúdalo y haz la SIGUIENTE pregunta (una sola).
            - Orden sugerido de preguntas (una por turno):
              1. ¿Cuál es tu objetivo principal ahora mismo? (Ganar masa, fuerza, perder grasa, salud...).
              2. ¿Qué edad tienes y cuánto tiempo llevas entrenando?
              3. ¿Tienes alguna lesión o molestia física que deba saber?
              4. ¿Cuántos días reales a la semana puedes entrenar?

            FASE 3: EL GRAN ANÁLISIS
            - SOLO cuando hayas obtenido estas respuestas, procede a dar tu feedback completo sobre la rutina que subió al principio.
            - Ahora sí: detalla mejoras, cambios de ejercicios, correcciones de volumen/intensidad y tips personalizados basados en sus respuestas anteriores.
            - Usa formato Markdown (negritas, listas) para que sea fácil de leer.
          `,
        },
      });

      // Send the initial file with a trigger prompt
      const response = await this.chatSession.sendMessage({
        message: [
          {
            inlineData: {
              data: file.data,
              mimeType: file.mimeType,
            },
          },
          {
            text: "Aquí está mi rutina. Por favor, analízala pero empieza preguntándome mi nombre primero como acordamos en tus instrucciones.",
          },
        ],
      });

      return response.text || "Lo siento, no pude analizar el archivo. Inténtalo de nuevo.";
    } catch (error) {
      console.error("Error starting analysis:", error);
      throw error;
    }
  }

  public async sendMessage(text: string): Promise<string> {
    if (!this.chatSession) {
      throw new Error("Chat session not initialized. Upload a file first.");
    }

    try {
      const response = await this.chatSession.sendMessage({
        message: text,
      });
      return response.text || "Hubo un error al procesar tu respuesta.";
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();