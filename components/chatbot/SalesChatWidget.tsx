"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSalesChatHistory, streamSalesChatMessage } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface ChatMessageProps {
  role: string;
  content: string;
}

export default function SalesChatWidget() {
  const { user } = useAuth();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide on learning pages — the AI Tutor (ChatWidget) is used there instead
  const isLearningPage = pathname?.includes('/learn');


  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      setFetching(true);
      const data = await getSalesChatHistory();
      if (data && data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");

    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setMessages(prev => [...prev, { role: "model", content: "" }]);
    setLoading(true);

    try {
      const resp = await streamSalesChatMessage(userMsg);
      if (!resp.body) throw new Error("No response body");

      setLoading(false);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages(prev => {
            const newArr = [...prev];
            const lastIndex = newArr.length - 1;
            const lastMsg = newArr[lastIndex];
            if (lastMsg && lastMsg.role === "model") {
              newArr[lastIndex] = { ...lastMsg, content: lastMsg.content + chunk };
            }
            return newArr;
          });
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => {
        const newArr = [...prev];
        const lastMsg = newArr[newArr.length - 1];
        if (lastMsg && lastMsg.role === "model" && !lastMsg.content) {
          lastMsg.content = "Sorry, I encountered an error.";
        } else if (lastMsg && lastMsg.role === "model") {
          lastMsg.content += "\n\n*(Error disconnected)*";
        }
        return newArr;
      });
    } finally {
      setLoading(false);
    }
  };

  const markdownComponents: Components = {
    a({ href, children }) {
      return (
        <Link
          href={href ?? "#"}
          className="inline-block mt-1 underline decoration-indigo-400 font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
        >
          {children}
        </Link>
      );
    },
    code({ children, className }) {
      const isBlock = className?.includes("language-");
      if (isBlock) {
        return (
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto text-xs my-2">
            <code>{children}</code>
          </pre>
        );
      }
      return (
        <code className="bg-indigo-50 text-indigo-700 rounded px-1 py-0.5 text-xs font-mono">
          {children}
        </code>
      );
    },
  };

  // Hide the Sales Chatbot on learning pages, as the Teaching Assistant will be there.
  if (pathname?.startsWith("/learning/")) {
    return null;
  }

  // Also require user to be logged in for now, because ChatSession needs a user.
  // In a real-world scenario, you might want to create a guest session mechanism.
  if (!user) {
    return null;
  }

  // Don't render on learning pages (AI Tutor handles chat there)
  if (isLearningPage) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        aria-label="Open Sales Assistant"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white transition-all transform hover:scale-110 active:scale-95"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles size={24} />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 w-[350px] md:w-[400px] h-[540px] md:h-[600px] z-50 flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-gray-200 bg-white"
    >
      <Card className="flex flex-col h-full border-0 rounded-none shadow-none">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-full p-1.5">
              <Sparkles size={16} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Studigo Assistant</CardTitle>
              <p className="text-xs text-white/75 mt-0.5">Find the perfect course</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
            onClick={() => setIsOpen(false)}
          >
            <X size={18} />
          </Button>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/60 min-h-0">
          {fetching ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-80">
              <div className="bg-indigo-100 rounded-full p-4">
                <Sparkles size={36} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Hi {user.first_name || user.username}!</p>
                <p className="text-sm text-gray-500 mt-1">
                  I can help you find courses, answer questions about pricing, or suggest learning paths.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full mt-2">
                {["Do you have any Python courses?", "What are the best free courses?", "I want to learn web development"].map(hint => (
                  <button
                    key={hint}
                    onClick={() => { setInput(hint); }}
                    className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-left"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white border border-gray-200 text-gray-800 shadow-sm rounded-bl-sm"
                  }`}
                >
                  {m.role === "model" ? (
                    <div className="prose prose-sm max-w-none break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown components={markdownComponents}>
                        {m.content || "..."}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="break-words">{m.content}</p>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <CardFooter className="p-3 bg-white border-t border-gray-100 shrink-0">
          <form
            className="flex w-full gap-2"
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          >
            <input
              type="text"
              placeholder="Ask me about our courses..."
              className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 placeholder:text-gray-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:scale-105 transition-transform shrink-0 disabled:opacity-40"
              disabled={!input.trim() || loading}
            >
              <Send size={16} />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
