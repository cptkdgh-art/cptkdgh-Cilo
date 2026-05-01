import { useNavigate } from "react-router";
import { useStore } from "../store";
import { generateId, cn } from "../lib/utils";
import { MessageCircle, Trash2, Edit2, Play, Check, X } from "lucide-react";
import { Character, ChatSession } from "../types";
import { useState } from "react";

export default function ChatHistoryView() {
  const { chats, characters, deleteChat, updateChat } = useStore();
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const uniqueChats = [...chats]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter((chat, index, self) => index === self.findIndex(c => c.id === chat.id));

  const getCharacter = (id: string): Character | undefined => characters.find(c => c.id === id);

  const startRename = (e: React.MouseEvent, chat: ChatSession) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title || getCharacter(chat.characterId)?.name + "과의 대화");
  };

  const saveRename = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (editTitle.trim()) {
      updateChat(chatId, { title: editTitle.trim() });
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(null);
  };

  const requestDelete = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(chatId);
  };

  const confirmDelete = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteChat(chatId);
    setDeletingId(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto pb-24 h-full overflow-y-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-3">
          <MessageCircle className="text-orange-500" />
          대화 기록 관리
        </h1>
        <p className="text-white/50 text-sm">지금까지 나눈 모든 캐릭터와의 은밀한 대화 기록들이 저장됩니다. 원하는 순간으로 돌아가 플레이를 이어가세요.</p>
      </header>

      {uniqueChats.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-white/30 bg-white/5 rounded-2xl border border-white/5 border-dashed">
          <MessageCircle size={48} className="mb-4 opacity-50" />
          <p>아직 저장된 대화 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {uniqueChats.map(chat => {
            const char = getCharacter(chat.characterId);
            if (!char) return null; // Character was deleted

            const lastMessage = chat.messages[chat.messages.length - 1];

            return (
              <div 
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="group relative flex items-center gap-4 bg-[#1E1E1E] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all p-4 rounded-2xl cursor-pointer"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 shrink-0">
                  {char.avatarUrl ? (
                    <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 font-serif text-xl">
                      {char.name[0]}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {editingId === chat.id ? (
                      <input 
                        type="text" 
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        autoFocus
                        onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveRename(e as any, chat.id);
                          if (e.key === 'Escape') cancelRename(e as any);
                        }}
                        className="bg-black/50 border border-white/20 rounded px-2 py-0.5 text-white focus:outline-none focus:border-orange-500/50 text-sm w-full max-w-[200px]"
                      />
                    ) : (
                      <h3 className="text-orange-400 font-bold text-lg leading-tight truncate">
                        {chat.title || `${char.name}과의 대화`}
                      </h3>
                    )}
                    <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {new Date(chat.updatedAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-white/60 font-medium shrink-0">{char.name} :</span>
                    <p className="text-sm text-white/40 truncate flex-1">
                      {lastMessage ? lastMessage.content.replace(/\*/g, "") : "대화가 시작되지 않았습니다."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 relative">
                  {deletingId === chat.id ? (
                    <div className="flex items-center gap-2 bg-red-900/40 px-3 py-1 rounded-full border border-red-500/50">
                      <span className="text-xs font-bold text-red-200">정말 삭제할까요?</span>
                      <button onClick={(e) => confirmDelete(e, chat.id)} className="p-1 hover:text-white text-red-300"><Check size={16} /></button>
                      <button onClick={cancelDelete} className="p-1 hover:text-white text-white/50"><X size={16} /></button>
                    </div>
                  ) : editingId === chat.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => saveRename(e, chat.id)} className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-full"><Check size={18} /></button>
                      <button onClick={cancelRename} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full"><X size={18} /></button>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={(e) => startRename(e, chat)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10 relative"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={(e) => requestDelete(e, chat.id)}
                        className="p-2 text-red-500/60 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors z-10 relative"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="w-px h-6 bg-white/10 mx-1 flex-shrink-0" />
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/chat/${chat.id}`);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors font-medium text-sm z-10 relative"
                      >
                        <Play size={14} fill="currentColor" />
                        이어서
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
