import { Plus as PlusIcon, Settings2, MessageCircle, Sparkles, Wand2, Info } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useStore } from "../store";
import { generateId } from "../lib/utils";
import { useState } from "react";

export default function Home() {
  const { characters, chats, settings } = useStore();
  const navigate = useNavigate();
  const [quickIdea, setQuickIdea] = useState("");

  const handleQuickCreate = () => {
    if (!quickIdea.trim()) return alert("만들고 싶은 캐릭터나 상황을 입력해주세요.");
    navigate(`/character/new?idea=${encodeURIComponent(quickIdea)}`);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto pb-20">
      {/* Hero Section */}
      <section className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600/20 via-black to-red-900/20 border border-white/5 p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles size={160} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-light serif-title mb-3 leading-tight">
            당신의 가장 <span className="text-orange-500 font-medium">은밀한 상상</span>을<br />
            현실로 만드세요
          </h1>
          <p className="text-white/60 mb-6 text-sm md:text-base leading-relaxed">
            한계를 모르는 AI와 함께하는 고수위 역할극. 
            이미 수천 명의 사용자가 자신만의 페르소나를 창조하고 대화하고 있습니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={quickIdea}
                onChange={e => setQuickIdea(e.target.value)}
                placeholder="상황이나 캐릭터를 짧게 적어보세요 (예: 까칠한 여상사)"
                className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20">
                <Wand2 size={18} />
              </div>
            </div>
            <button 
              onClick={handleQuickCreate}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Sparkles size={16} />
              <span>딸깍 생성</span>
            </button>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-4 text-[11px] text-white/40 font-medium uppercase tracking-wider">
             <div className="flex items-center gap-1.5"><Info size={12}/> No Filters (NSFW OK)</div>
             <div className="flex items-center gap-1.5"><Info size={12}/> Real-time Memory</div>
             <div className="flex items-center gap-1.5"><Info size={12}/> Image Generation</div>
          </div>
        </div>
      </section>

      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium serif-title text-white">따끈따끈한 인기 캐릭터</h2>
          <p className="text-white/40 text-sm">마음에 드는 캐릭터를 선택해 대화를 시작해보세요.</p>
        </div>
        <Link
          to="/character/new"
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-full transition-all text-sm font-bold text-white group"
        >
          <PlusIcon size={18} className="text-orange-500 group-hover:rotate-90 transition-transform" />
          <span>직접 만들기</span>
        </Link>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {characters.map((char) => {
          const chatSession = chats.find(c => c.characterId === char.id);
          const chatCount = chats.filter(c => c.characterId === char.id).length;
          
          const handleNewChat = (e: React.MouseEvent) => {
            e.stopPropagation();
            const newSessionId = "chat-" + generateId();
            navigate(`/chat/${newSessionId}?charId=${char.id}`);
          };

          return (
            <div
              key={char.id}
              onClick={handleNewChat}
              className="group flex flex-col rounded-xl overflow-hidden bg-[#1E1E1E] border border-white/5 hover:border-white/20 hover:-translate-y-1 transition-all cursor-pointer shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden bg-black/40">
                {char.avatarUrl ? (
                  <img
                    src={char.avatarUrl}
                    alt={char.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/20 text-4xl font-serif">{char.name[0]}</span>
                  </div>
                )}
                
                {char.isNsfw && (
                  <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    19
                  </div>
                )}
                
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md rounded-full px-2 py-1 flex items-center gap-1.5 text-[11px] text-white/90">
                  <MessageCircle size={12} className="text-white/70" />
                  <span className="font-medium">{chatCount > 0 ? chatCount : "0"}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/character/edit/${char.id}`);
                  }}
                  className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-xs p-1.5 rounded-full border border-white/10 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <Settings2 size={14} />
                </button>
              </div>

              <div className="p-3.5 flex flex-col flex-1 border-t border-white/5">
                <h2 className="text-[15px] font-bold text-white/90 mb-1 leading-tight truncate">{char.name}</h2>
                <p className="text-[12px] text-white/40 line-clamp-2 leading-[1.4] mb-3 flex-1">{char.tagline}</p>
                
                {char.tags && char.tags.length > 0 && (
                  <div className="flex flex-wrap gap-x-1.5 gap-y-1 mt-auto overflow-hidden max-h-5">
                    {char.tags.map(tag => (
                      <span key={tag} className="text-[11px] text-blue-400 mb-0.5 whitespace-nowrap">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
