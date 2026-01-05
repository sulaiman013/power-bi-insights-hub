import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, Play, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";
import type { Message } from "@/types";
import ChatMessage from "./ChatMessage";

const ChatPanel = () => {
  const { messages, addMessage, isLoading, setLoading, connection, provider, setSettingsOpen } = useAppStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    const currentInput = input.trim();
    setInput("");
    setLoading(true);

    try {
      const response = await api.sendChatMessage(currentInput);

      // Parse response for DAX query and results
      let daxQuery: string | undefined;
      let content = response.response;

      // Extract DAX query from response if present
      const daxMatch = content.match(/```dax\n([\s\S]*?)\n```/);
      if (daxMatch) {
        daxQuery = daxMatch[1];
      }

      // Check for query details in the response
      const detailsMatch = content.match(/<details><summary>.*?<\/summary>\n\n```dax\n([\s\S]*?)\n```/);
      if (detailsMatch && !daxQuery) {
        daxQuery = detailsMatch[1];
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: content,
        timestamp: new Date(),
        daxQuery: daxQuery,
      };

      addMessage(assistantMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}\n\nPlease make sure the Python backend server is running on port 5050.`,
        timestamp: new Date(),
      };

      addMessage(assistantMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const isReady = connection.isConnected && provider.isConfigured;

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {messages.length === 0 ? (
          <WelcomeScreen onExampleClick={handleExampleClick} onSettingsClick={() => setSettingsOpen(true)} />
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 p-4 glass-panel rounded-2xl rounded-bl-md max-w-[85%]">
                <div className="typing-indicator flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Generating response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-card/50">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="glass-panel rounded-2xl p-2 flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isReady
                ? "Ask a question about your Power BI data..."
                : "Connect to Power BI and configure an AI provider to start..."}
              disabled={!isReady || isLoading}
              rows={1}
              className="flex-1 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 py-2 px-3 text-sm placeholder:text-muted-foreground disabled:opacity-50"
              style={{ minHeight: '40px', maxHeight: '160px' }}
            />
            <Button
              type="submit"
              size="icon"
              variant="gold"
              disabled={!input.trim() || isLoading || !isReady}
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Power BI Expert sends only schema metadata to AI. Your data never leaves your environment.
          </p>
        </form>
      </div>
    </div>
  );
};

interface WelcomeScreenProps {
  onExampleClick: (prompt: string) => void;
  onSettingsClick: () => void;
}

const WelcomeScreen = ({ onExampleClick, onSettingsClick }: WelcomeScreenProps) => {
  const { connection, provider } = useAppStore();

  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mb-6 glow-gold">
        <Sparkles className="w-8 h-8 text-primary-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Welcome to Power BI Expert</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Your AI-powered assistant for Microsoft Power BI. Generate DAX queries, execute analytics,
        and get insights using natural language.
      </p>

      {/* Status Checklist */}
      <div className="glass-panel rounded-xl p-6 max-w-md w-full space-y-4">
        <StatusItem
          label="Power BI Connection"
          status={connection.isConnected ? 'connected' : 'disconnected'}
          detail={connection.isConnected ? connection.instanceName || connection.workspaceName : 'Not connected'}
          onClick={onSettingsClick}
        />
        <StatusItem
          label="AI Provider"
          status={provider.isConfigured ? 'connected' : 'disconnected'}
          detail={provider.isConfigured ? provider.provider?.replace('-', ' ') : 'Not configured'}
          onClick={onSettingsClick}
        />

        {(!connection.isConnected || !provider.isConfigured) && (
          <Button variant="gold" className="w-full mt-4" onClick={onSettingsClick}>
            Open Settings
          </Button>
        )}
      </div>

      {/* Example Prompts */}
      {connection.isConnected && provider.isConfigured && (
        <div className="mt-8 max-w-2xl w-full">
          <p className="text-sm text-muted-foreground mb-4">Try asking:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "What is total revenue by region?",
              "Show me top 10 customers by sales",
              "Create a YoY growth measure",
              "Which products have negative margins?",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => onExampleClick(prompt)}
                className="text-left text-sm p-4 glass-panel rounded-xl hover:bg-secondary/50 transition-colors"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface StatusItemProps {
  label: string;
  status: 'connected' | 'disconnected';
  detail?: string;
  onClick?: () => void;
}

const StatusItem = ({ label, status, detail, onClick }: StatusItemProps) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 w-full hover:bg-secondary/30 p-2 -m-2 rounded-lg transition-colors"
  >
    <div className={`status-dot ${status === 'connected' ? 'status-dot-connected' : 'status-dot-disconnected'}`} />
    <div className="flex-1 text-left">
      <p className="text-sm font-medium">{label}</p>
      {detail && <p className="text-xs text-muted-foreground capitalize">{detail}</p>}
    </div>
    <span className={`text-xs font-medium ${status === 'connected' ? 'text-accent' : 'text-muted-foreground'}`}>
      {status === 'connected' ? 'Ready' : 'Required'}
    </span>
  </button>
);

export default ChatPanel;
