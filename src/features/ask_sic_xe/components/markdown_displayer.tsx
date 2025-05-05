"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";

import { cn } from "@/lib/utils";
import { CopyButton } from "./copy_button";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        "markdown-content prose prose-slate dark:prose-invert max-w-none",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              {...props}
              id={props.id}
              className="scroll-mt-20 text-3xl font-bold tracking-tight mt-8 mb-4 w-fit border-b-2 border-primary pb-1"
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              {...props}
              id={props.id}
              className="scroll-mt-20 text-2xl font-semibold tracking-tight mt-8 mb-4 border-b border-muted/80 pb-2"
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              {...props}
              id={props.id}
              className="scroll-mt-20 text-xl font-semibold tracking-tight mt-6 mb-3 text-primary/90"
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              {...props}
              id={props.id}
              className="scroll-mt-20 text-lg font-semibold tracking-tight mt-4 mb-2 text-primary/80"
            />
          ),
          p: ({ node, ...props }) => (
            <p {...props} className="leading-7 mb-4" />
          ),
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:text-primary/80 transition-colors duration-200"
              target={props.href?.startsWith("http") ? "_blank" : undefined}
              rel={
                props.href?.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              {...props}
              className="my-5 ml-6 list-disc space-y-1 marker:text-primary/70"
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              {...props}
              className="my-5 ml-6 list-decimal space-y-1 marker:text-primary/70"
            />
          ),
          li: ({ node, ...props }) => <li {...props} className="mt-1 pl-1" />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className="mt-5 mb-5 border-l-3 border-primary/60 pl-5 italic text-muted-foreground bg-muted/20 py-2 rounded-r-md"
            />
          ),
          table: ({ node, ...props }) => (
            <div className="mb-6 mt-3 w-full overflow-y-auto rounded-md border border-muted/30">
              <table {...props} className="w-full border-collapse text-sm" />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead
              {...props}
              className="bg-primary/10 text-primary-foreground/90"
            />
          ),
          tr: ({ node, ...props }) => (
            <tr
              {...props}
              className="border-b border-muted/30 transition-colors hover:bg-muted/20 even:bg-muted/5"
            />
          ),
          th: ({ node, ...props }) => (
            <th
              {...props}
              className="h-10 px-4 text-left align-middle font-medium text-foreground"
            />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="p-3 align-middle" />
          ),
          hr: ({ node, ...props }) => (
            <hr
              {...props}
              className="my-6 border-muted not-prose h-px bg-gradient-to-r from-transparent via-muted to-transparent"
            />
          ),
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="rounded-md border border-muted/30 shadow-sm hover:shadow-md transition-shadow duration-200"
              alt={props.alt || "Image"}
            />
          ),
          code: ({ node, className, children, ...props }) => {
            return (
              <div className="relative my-4 overflow-hidden rounded-lg border bg-muted/50 group">
                <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                  <CopyButton
                    text={String(String(children).replace(/\n$/, ""))}
                  />
                </div>
                <code
                  className="grid w-full text-sm leading-relaxed p-4 overflow-auto font-mono"
                  {...props}
                >
                  {children}
                </code>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
