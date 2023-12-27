"use client";

import { Input } from "@/components/ui/input";
import { useChat } from "ai/react";
import { useTheme } from "next-themes";
import { ElementRef, FC, useEffect, useRef } from "react";
import { BeatLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import UserMessage from "./user-message";
import AIMessage from "./ai-message";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { MemoizedReactMarkdown } from "./markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock } from "@/components/ui/codeblock";

type MessageTenant = {
  id: string;
  text: string;
  isUserMessage: boolean;
  createdAt: Date;
  updatedAt: Date;
  user_id: string | null;
  tenant_id: string;
};

interface ChatTenantProps {
  pastMessages: MessageTenant[];
  userId: string;
  tenant_id: string;
}

export const ChatTenant: FC<ChatTenantProps> = ({

  tenant_id,
  pastMessages,
  userId,
}) => {
  const router = useRouter();
  const {
    input,
    handleInputChange,
    handleSubmit,
    data,
    isLoading,
    setInput,
    append,
    messages,
  } = useChat({
    body: {
      user_id: userId,
      tenant_id: tenant_id,
    },
    api: "/api/chattenant",
    onResponse(response) {
      if (response.status === 401) {
        toast.error("Error Processing Request");
      }
    },
  });
  const { theme } = useTheme();
  const scrollRef = useRef<ElementRef<"div">>(null);
  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const onCopy = (content: string) => {
    if (isCopied) return;
    copyToClipboard(content);
    toast.success("Message Copied to Clipboard");
  };
  console.log(pastMessages);
  return (
    <div className="flex flex-col w-full max-w-xl pb-24 mx-auto stretch min-h-screen">
      {/* {pastMessages.length > 0 ? (
        <>
          {pastMessages.map((message, index) => (
            <div key={index}>
              {message.isUserMessage ? (
                <UserMessage text={message.text} />
              ) : (
                <AIMessage text={message.text} />
              )}
            </div>
          ))}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("whitespace-pre-wrap group", {
                "text-blue-500 text-right p-4  gap-x-8 rounded-lg max-w-lg ":
                  m.role === "user",
                "text-green-500 p-4 w-full flex items-start gap-x-8 rounded-lg max-w-lg bg-muted":
                  m.role !== "user",
              })}
            >
              <ReactMarkdown
                components={{
                  pre: ({ node, ...props }) => (
                    <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg text-blue-400">
                      <pre {...props} />
                    </div>
                  ),
                  code: ({ node, ...props }) => (
                    <code
                      className="bg-black/10 rounded-lg p-1 text-indigo-300"
                      {...props}
                    />
                  ),
                  a: ({ node, ...props }) => (
                    <a target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-green-600" {...props} />
                  ),
                }}
                className="text-base overflow-hidden leading-7"
              >
                {m.content}
              </ReactMarkdown>
              <Button
                onClick={() => onCopy(m.content)}
                className="hidden group-hover:block"
                size="icon"
                variant="ghost"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </>
      ) : (
        <>
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("whitespace-pre-wrap group", {
                "text-blue-500 text-right p-4  gap-x-8 rounded-lg max-w-lg ":
                  m.role === "user",
                "text-green-500 p-4 w-full flex items-start gap-x-8 rounded-lg max-w-lg bg-muted":
                  m.role !== "user",
              })}
            >
              <ReactMarkdown
                components={{
                  pre: ({ node, ...props }) => (
                    <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg text-blue-400">
                      <pre {...props} />
                    </div>
                  ),
                  code: ({ node, ...props }) => (
                    <code
                      className="bg-black/10 rounded-lg p-1 text-indigo-300"
                      {...props}
                    />
                  ),
                  a: ({ node, ...props }) => (
                    <a target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-green-600" {...props} />
                  ),
                }}
                className="text-base overflow-hidden leading-7"
              >
                {m.content}
              </ReactMarkdown>
              <Button
                onClick={() => onCopy(m.content)}
                className="hidden group-hover:block"
                size="icon"
                variant="ghost"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </>
      )} */}
      {pastMessages.length > 0 ? (
        <>
          {pastMessages.map((message, index) => (
            <div key={index}>
              {message.isUserMessage ? (
                <UserMessage text={message.text} />
              ) : (
                <AIMessage text={message.text} />
              )}
            </div>
          ))}
        </>
      ) : (
        ""
      )}
      {messages.map((m) => (
        <div
          key={m.id}
          className={cn("whitespace-pre-wrap group", {
            "text-blue-500 text-right p-4  gap-x-8 rounded-lg max-w-lg ":
              m.role === "user",
            "text-green-500 p-4 w-full flex items-start gap-x-8 rounded-lg max-w-lg bg-muted":
              m.role !== "user",
            "prose-p:text-indigo-400 prose-li:text-indigo-400":
              m.role === "user",
          })}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            className="text-base prose dark:prose-invert prose-ul:m-0 prose-li:m-0 prose-p:my-0 prose-h3:my-0"
          >
            {m.content}
          </ReactMarkdown>
          {/* <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            className={cn(
              "text-base prose prose-ul:m-0 prose-li:m-0 prose-p:my-0",
              {
                "prose-p:text-indigo-400": m.role === "user",
                "prose-p:text-green-500": m.role !== "user",
              }
            )}
          >
            {m.content}
          </ReactMarkdown> */}
          {/* <MemoizedReactMarkdown
            className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              },
              code({ node, inline, className, children, ...props }) {
                if (children.length) {
                  if (children[0] == "▍") {
                    return (
                      <span className="mt-1 cursor-default animate-pulse">
                        ▍
                      </span>
                    );
                  }

                  children[0] = (children[0] as string).replace("`▍`", "▍");
                }

                const match = /language-(\w+)/.exec(className || "");

                if (inline) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }

                return (
                  <CodeBlock
                    key={Math.random()}
                    language={(match && match[1]) || ""}
                    value={String(children).replace(/\n$/, "")}
                    {...props}
                  />
                );
              },
            }}
          >
            {m.content}
          </MemoizedReactMarkdown> */}
          <Button
            onClick={() => onCopy(m.content)}
            className="hidden group-hover:block"
            size="icon"
            variant="ghost"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        {isLoading && (
          <div className="p-4 rounded-lg w-1/2 flex items-center justify-center bg-muted mt-10">
            <BeatLoader
              color={theme === "light" ? "black" : "white"}
              size={5}
            />
          </div>
        )}
        <Input
          className="fixed bottom-0 w-[80vw] md:w-full max-w-md p-2 mb-8 min-h-4 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Talk to the document..."
          onChange={handleInputChange}
        />
        <div ref={scrollRef} />
      </form>
    </div>
  );
};
