import { Plus as PlusIcon, Settings2, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useStore } from "../store";
import { generateId } from "../lib/utils";

export default function Home() {
  const { characters, chats } = useStore();
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-white">따끈따끈한 인기 신작 캐릭터</h1>
          <p className="text-white/50 text-sm">대화를 나눌 파트너를 선택하거나 새로운 캐릭터를 창조하세요.</p>
        </div>
        <Link
          to="/character/new"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full transition-all text-sm font-bold text-white"
        >
          <PlusIcon size={18} />
          <span>새 캐릭터</span>
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
