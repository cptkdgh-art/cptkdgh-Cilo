import { useNavigate, Link } from "react-router";
import { useStore } from "../store";
import { Plus as PlusIcon, Settings2, Trash2, Users, Check, X } from "lucide-react";
import { useState } from "react";

export default function CharacterManagementView() {
  const { characters, chats, deleteCharacter } = useStore();
  const navigate = useNavigate();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const requestDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteCharacter(id);
    setDeletingId(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto pb-24 h-full overflow-y-auto">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-3">
            <Users className="text-orange-500" />
            통합 캐릭터 관리
          </h1>
          <p className="text-white/50 text-sm">창조된 매력적인 인물들을 이곳에서 한 눈에 확인하고 수정하세요.<br/>현재 총 <strong className="text-orange-400">{characters.length}</strong> 명의 캐릭터가 생성되었습니다.</p>
        </div>
        <Link
          to="/character/new"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-5 py-2.5 rounded-full transition-all text-sm font-bold text-white shadow-lg shadow-orange-900/20"
        >
          <PlusIcon size={18} />
          <span>새 캐릭터 창조</span>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {characters.map((char) => {
          const charChats = chats.filter(c => c.characterId === char.id);
          
          return (
            <div key={char.id} className="relative flex items-center gap-4 bg-[#1E1E1E] border border-white/5 p-4 rounded-2xl hover:border-white/20 transition-colors group">
              <div className="w-20 h-24 rounded-lg overflow-hidden shrink-0 bg-black/40 relative">
                {char.avatarUrl ? (
                  <img src={char.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-serif text-3xl text-white/20">
                    {char.name[0]}
                  </div>
                )}
                {char.isNsfw && (
                  <div className="absolute top-1 left-1 bg-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold">19</div>
                )}
              </div>
              
              <div className="flex-1 min-w-0 pr-4 drop-shadow-md">
                <h3 className="text-lg font-bold text-white/90 truncate mb-1">{char.name}</h3>
                <p className="text-xs text-white/50 truncate mb-2">{char.tagline}</p>
                <div className="flex items-center gap-3 text-xs text-white/40 font-medium">
                   <span className="bg-white/5 px-2 py-1 rounded-md">대화 세션: {charChats.length} 개</span>
                   <span className="bg-white/5 px-2 py-1 rounded-md">{char.targetAudience === 'male' ? '남성향' : char.targetAudience === 'female' ? '여성향' : '전체'}</span>
                </div>
              </div>

              <div className="absolute right-4 top-4 bottom-4 flex flex-col justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 {deletingId === char.id ? (
                   <div className="flex flex-col gap-2 bg-red-900/40 p-2 rounded-xl border border-red-500/50">
                     <span className="text-[10px] font-bold text-red-200 text-center uppercase tracking-wider">삭제 확인</span>
                     <button onClick={(e) => confirmDelete(e, char.id)} className="p-1.5 hover:bg-red-500/20 text-red-300 rounded-full flex items-center justify-center"><Check size={16} /></button>
                     <button onClick={cancelDelete} className="p-1.5 hover:bg-white/10 text-white/50 hover:text-white rounded-full flex items-center justify-center"><X size={16} /></button>
                   </div>
                 ) : (
                   <>
                     <button 
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         navigate(`/character/edit/${char.id}`);
                       }}
                       className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors flex items-center justify-center"
                       title="수정"
                     >
                       <Settings2 size={16} />
                     </button>
                     <button 
                       onClick={(e) => requestDelete(e, char.id)}
                       className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-colors flex items-center justify-center"
                       title="삭제"
                     >
                       <Trash2 size={16} />
                     </button>
                   </>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
