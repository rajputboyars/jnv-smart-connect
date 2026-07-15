"use client";

import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAiChat } from "@/hooks/use-ai";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function ChatAssistantCard() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const mutation = useAiChat();

  function handleSend() {
    const message = input.trim();
    if (!message) return;

    const history = messages;
    setMessages([...history, { role: "user", content: message }]);
    setInput("");

    mutation.mutate(
      { message, history },
      {
        onSuccess: (result) => {
          setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
        },
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher assistant</CardTitle>
        <CardDescription>
          General-purpose help drafting communications and answering teaching questions. It doesn&apos;t have
          live access to this school&apos;s data — use the other modules for specific student records.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border border-border p-3">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">Ask something to get started.</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-2", m.role === "user" && "flex-row-reverse")}>
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
              </div>
              <div
                className={cn(
                  "max-w-[80%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask the assistant…"
          />
          <Button onClick={handleSend} loading={mutation.isPending} disabled={!input.trim()}>
            <Send className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
