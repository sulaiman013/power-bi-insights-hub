import { User, Sparkles, Copy, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Message } from "@/types";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      
      <div className={`max-w-[85%] ${isUser ? 'chat-message-user' : 'chat-message-assistant'} p-4`}>
        <div className="prose prose-invert prose-sm max-w-none">
          <MessageContent content={message.content} />
        </div>
        
        {/* DAX Query Block */}
        {message.daxQuery && (
          <DaxQueryBlock query={message.daxQuery} />
        )}
        
        {/* Query Results Table */}
        {message.queryResults && (
          <QueryResultsTable results={message.queryResults} />
        )}
        
        <p className="text-xs text-muted-foreground mt-3">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

const MessageContent = ({ content }: { content: string }) => {
  // Simple markdown-like parsing
  const parts = content.split(/(```[\s\S]*?```|\*\*.*?\*\*)/g);
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3);
          const [lang, ...lines] = code.split('\n');
          return (
            <pre key={i} className="code-block my-3">
              <code>{lines.join('\n') || lang}</code>
            </pre>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

const DaxQueryBlock = ({ query }: { query: string }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(query);
    setCopied(true);
    toast({ title: "DAX query copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-secondary/50 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground">Generated DAX Query</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
            {copied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
          </Button>
          <Button variant="ghost" size="icon-sm">
            <Play className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <pre className="p-3 text-xs font-mono overflow-x-auto bg-background/50">
        <code className="text-primary">{query}</code>
      </pre>
    </div>
  );
};

const QueryResultsTable = ({ results }: { results: { columns: string[]; rows: any[][]; rowCount: number } }) => {
  return (
    <div className="mt-4 rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-secondary/50 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground">
          Query Results ({results.rowCount} rows)
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {results.columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="font-mono text-xs">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChatMessage;
