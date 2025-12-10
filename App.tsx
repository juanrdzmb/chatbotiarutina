import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';
import { UploadedFile, Message, Sender, AppState } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Upload);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (file: UploadedFile) => {
    setIsLoading(true);
    setAppState(AppState.Analyzing); // Show loading UI immediately

    try {
      // Start the analysis with Gemini
      const responseText = await geminiService.startAnalysis(file);

      const botMessage: Message = {
        id: Date.now().toString(),
        text: responseText,
        sender: Sender.Bot,
        timestamp: new Date(),
      };

      setMessages([botMessage]);
      setAppState(AppState.Chat); // Switch to chat view
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Hubo un error analizando tu archivo. Por favor intenta con una imagen más clara o un PDF válido.");
      setAppState(AppState.Upload); // Go back to upload on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    // Optimistically add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: Sender.User,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const responseText = await geminiService.sendMessage(text);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: Sender.Bot,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Message failed", error);
      // Optional: Add an error message to chat
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100 font-sans selection:bg-brand-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-brand-900/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 w-full h-full">
        {appState === AppState.Upload && (
          <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        )}

        {(appState === AppState.Analyzing || appState === AppState.Chat) && (
          <div className="h-screen md:h-screen md:py-8 md:px-4 flex items-center justify-center animate-in slide-in-from-bottom-4 duration-500">
             <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
             />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;