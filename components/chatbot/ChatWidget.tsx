"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getChatHistory, streamChatMessage } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

interface ChatMessageProps {
  role: string;
  content: string;
}

interface TimestampLink {
  lectureId: number;
  seconds: number;
  display: string; // "▶ Xem tại MM:SS"
}

interface ChatWidgetProps {
  courseId: number;
  /** 
   * Called when user clicks a timestamp link in the chatbot response.
   * The parent (LearningClient) should seek the video to `seconds`.
   */
  onSeekVideo?: (lectureId: number, seconds: number) => void;
}

/** Parse a timestamp anchor href like "#video-ts?lecture=42&t=90" */
function parseTimestampHref(href: string): TimestampLink | null {
  if (!href || !href.startsWith("#video-ts")) return null;
  try {
    const params = new URLSearchParams(href.replace("#video-ts?", ""));
    const lectureId = parseInt(params.get("lecture") || "", 10);
    const seconds = parseFloat(params.get("t") || "0");
    if (isNaN(lectureId) || isNaN(seconds)) return null;
    return { lectureId, seconds, display: "" };
  } catch {
    return null;
  }
}

/** Format seconds → MM:SS display */
function secondsToDisplay(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export default function ChatWidget({ courseId, onSeekVideo }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const data = await getChatHistory(courseId);
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
      const resp = await streamChatMessage(courseId, userMsg);
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

  /**
   * Custom Markdown components.
   * Intercepts anchor tags with href="#video-ts?..." and renders them
   * as styled timestamp buttons instead of plain links.
   */
  const markdownComponents: Components = {
    a({ href, children }) {
      const ts = parseTimestampHref(href ?? "");

      if (ts) {
        // Extract label text from children
        const labelText = typeof children === "string"
          ? children
          : `▶ Xem tại ${secondsToDisplay(ts.seconds)}`;

        return (
          <button
            onClick={() => {
              if (onSeekVideo) {
                onSeekVideo(ts.lectureId, ts.seconds);
              }
            }}
            title={`Nhảy đến ${secondsToDisplay(ts.seconds)} trong video`}
            className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 text-violet-700 border border-violet-300 hover:bg-violet-600 hover:text-white transition-all duration-200 text-xs font-semibold px-2.5 py-1 mx-0.5 cursor-pointer shadow-sm"
          >
            <Play size={11} className="shrink-0 fill-current" />
            <span>{labelText}</span>
          </button>
        );
      }

      // Normal link
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600 hover:text-blue-800"
        >
          {children}
        </a>
      );
    },
    // Style code blocks nicely
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
        <code className="bg-gray-100 text-violet-700 rounded px-1 py-0.5 text-xs font-mono">
          {children}
        </code>
      );
    },
  };

  if (!isOpen) {
    return (
      <button
        id="chat-widget-toggle"
        aria-label="Mở AI Assistant"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white transition-all transform hover:scale-110 active:scale-95"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  return (
    <div
      id="chat-widget-panel"
      className="fixed bottom-6 right-6 w-[350px] md:w-[420px] h-[540px] md:h-[620px] z-50 flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-gray-200 bg-white"
    >
      <Card className="flex flex-col h-full border-0 rounded-none shadow-none">

        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-full p-1.5">
              <MessageCircle size={16} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">AI Teaching Assistant</CardTitle>
              <p className="text-xs text-white/75 mt-0.5">Hỏi bất cứ điều gì về khóa học</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            id="chat-widget-close"
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
              <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-70">
              <div className="bg-violet-100 rounded-full p-4">
                <MessageCircle size={36} className="text-violet-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Xin chào! Tôi có thể giúp gì?</p>
                <p className="text-sm text-gray-500 mt-1">
                  Hỏi tôi về nội dung bài học — tôi có thể chỉ thẳng đến đúng phút trong video! 🎯
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full mt-2">
                {["Video này nói về gì?", "Giải thích khái niệm chính", "Bài tập thực hành?"].map(hint => (
                  <button
                    key={hint}
                    onClick={() => { setInput(hint); }}
                    className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:border-violet-400 hover:text-violet-600 transition-colors text-left"
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
                      ? "bg-violet-600 text-white rounded-br-sm"
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
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <CardFooter className="p-3 bg-white border-t border-gray-100 shrink-0">
          <form
            id="chat-widget-form"
            className="flex w-full gap-2"
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          >
            <input
              id="chat-widget-input"
              type="text"
              placeholder="Hỏi về nội dung bài học..."
              className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-gray-900 placeholder:text-gray-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
            <Button
              id="chat-widget-send"
              type="submit"
              size="icon"
              className="rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:scale-105 transition-transform shrink-0 disabled:opacity-40"
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
