import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { useStore } from "../store";
import { generateId, cn } from "../lib/utils";
import { generateChatResponse } from "../lib/gemini";
import { Send, ArrowLeft, MoreHorizontal, Settings, History } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChatView() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { characters, chats, addChat, updateChat, settings } = useStore();
  
  const [session, setSession] = useState(chats.find(c => c.id === sessionId));
  
  // If no session found, it means it's a new chat, construct it if charId is given
  const initCharId = searchParams.get("charId") || session?.characterId;
  const character = characters.find(c => c.id === initCharId);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!character) {
      if(!session) navigate("/");
      return;
    }
    
    // Create new session if missing
    if (!session && sessionId) {
      const existingInStore = chats.find(c => c.id === sessionId);
      if (existingInStore) {
        setSession(existingInStore);
        return;
      }

      const newSession = {
        id: sessionId,
        characterId: character.id,
        title: `${character.name}과의 새로운 대화`,
        updatedAt: Date.now(),
        messages: character.greeting ? [
          {
            id: generateId(),
            role: "model" as const,
            content: character.greeting,
            timestamp: Date.now(),
          }
        ] : []
      };
      addChat(newSession);
      setSession(newSession);
    }
  }, [character, session, sessionId, addChat, navigate, chats]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages, isTyping]);

  if (!character || !session) return null;

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const userMsg = {
      id: generateId(),
      role: "user" as const,
      content: inputValue.trim(),
      timestamp: Date.now()
    };
    
    const newMessages = [...session.messages, userMsg];
    setSession(prev => prev ? { ...prev, messages: newMessages, updatedAt: Date.now() } : prev);
    updateChat(session.id, { messages: newMessages, updatedAt: Date.now() });
    
    setInputValue("");
    setIsTyping(true);

    try {
      const responseText = await generateChatResponse(
        settings,
        character,
        session.messages,
        userMsg.content
      );

      const modelMsg = {
        id: generateId(),
        role: "model" as const,
        content: responseText,
        timestamp: Date.now()
      };
      
      setSession(prev => prev ? { ...prev, messages: [...prev.messages, modelMsg], updatedAt: Date.now() } : prev);
      updateChat(session.id, { messages: [...newMessages, modelMsg], updatedAt: Date.now() });

    } catch (e: any) {
      alert("AI 연결 오류: " + e.message);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Bar */}
      <header className="glass-panel border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/chats")} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white" title="대화 기록 보기">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            {character.avatarUrl ? (
              <img src={character.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-serif">
                {character.name[0]}
              </div>
            )}
            <div>
              <h2 className="serif-title font-medium text-lg leading-tight">{character.name}</h2>
              <p className="text-xs text-white/50">{character.tagline}</p>
            </div>
          </div>
        </div>
        <button onClick={() => navigate(`/character/edit/${character.id}`)} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
          <Settings size={20} />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {session.messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] md:max-w-[70%] rounded-2xl p-4 leading-relaxed",
                isUser ? "bg-orange-600/80 text-white rounded-br-sm" : "glass-panel rounded-bl-sm"
              )}>
                {isUser ? (
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                ) : (
                  <div className="text-sm markdown-body text-white/90 leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass-panel rounded-2xl rounded-bl-sm p-4 px-5">
              <div className="flex space-x-1 items-center h-4">
                <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} className="h-[20px]" />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 shrink-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
            className="w-full bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-sm text-white resize-none focus:outline-none focus:border-orange-500/50 shadow-2xl transition-colors"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-3 bottom-0 top-0 my-auto h-10 w-10 flex items-center justify-center bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:bg-white/10 disabled:text-white/30 transition-colors"
          >
            <Send size={18} className="translate-x-[1px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
