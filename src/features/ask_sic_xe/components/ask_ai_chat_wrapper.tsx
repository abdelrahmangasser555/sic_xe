"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  PaperPlaneIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "./markdown_displayer";

export default function ChatSicXE({ code }: { code: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: {
      code,
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  //   // Auto-scroll to bottom when new messages arrive
  //   useEffect(() => {
  //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }, [messages]);

  // Focus the input when expanded
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Custom submit handler to expand the chat if collapsed
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }
    handleSubmit(e);
  };

  return (
    <div
      className={cn(
        "w-full border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm transition-all duration-300 ease-in-out overflow-hidden",
        isExpanded ? "h-[800px]" : "h-[56px]"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header - only visible when expanded */}
        <div
          className={cn(
            "p-3 border-b border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out flex items-center justify-between",
            isExpanded ? "opacity-100" : "opacity-0 h-0 p-0 border-none"
          )}
        >
          <h3 className="font-medium text-sm">SIC/XE Code Assistant</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleExpanded}
            className="h-7 w-7 opacity-70 hover:opacity-100"
          >
            <ChevronDownIcon className="h-4 w-4" />
            <span className="sr-only">Collapse chat</span>
          </Button>
        </div>

        {/* Chat messages container - only visible when expanded */}
        <div
          className={cn(
            "flex-1 overflow-y-auto p-4 space-y-4 transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0 h-0 p-0"
          )}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400 text-sm">
              Ask a question about your SIC/XE code...
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <Card
                  className={cn(
                    "max-w-[80%] p-3 whitespace-pre-wrap text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.role === "user"
                    ? message.parts.map((part, i) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <div key={`${message.id}-${i}`}>{part.text}</div>
                            );
                        }
                      })
                    : message.parts.map((part, i) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <MarkdownContent
                                content={part.text}
                                key={`${message.id}-${i}`}
                              />
                            );
                        }
                      })}
                </Card>
              </div>
            ))
          )}
        </div>

        {/* Chat input - always visible, changes based on expanded state */}
        <div
          className={cn(
            "p-3 transition-all duration-300 ease-in-out",
            isExpanded
              ? "border-t border-zinc-200 dark:border-zinc-800"
              : "flex-1 flex items-center"
          )}
        >
          <form onSubmit={onSubmit} className="flex gap-2 w-full relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              readOnly={!isExpanded}
              placeholder={
                isExpanded
                  ? "Type your message..."
                  : "Ask about your SIC/XE code..."
              }
              className="flex-1 focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200 ease-in-out"
              autoComplete="off"
              onClick={!isExpanded ? toggleExpanded : undefined}
            />
            <Button
              type={isExpanded ? "submit" : "button"}
              size="icon"
              className="shrink-0"
              onClick={!isExpanded ? toggleExpanded : undefined}
            >
              {isExpanded ? (
                <PaperPlaneIcon className="h-4 w-4" />
              ) : (
                <ChevronUpIcon className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isExpanded ? "Send message" : "Expand chat"}
              </span>
            </Button>

            {/* Collapse button - only visible when expanded */}
            {isExpanded && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleExpanded}
                className="absolute top-1 right-12 h-7 w-7 opacity-50 hover:opacity-100"
              >
                <ChevronDownIcon className="h-4 w-4" />
                <span className="sr-only">Collapse chat</span>
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
