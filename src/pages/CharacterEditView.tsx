import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useStore } from "../store";
import { generateId } from "../lib/utils";
import { ArrowLeft, Save, Trash2, Sparkles, ImagePlus, Upload, Link as LinkIcon, LoaderIcon } from "lucide-react";
import { autoGenerateCharacterProfile, generateCharacterImage } from "../lib/gemini";
import { resizeAndCompressImage } from "../lib/imageUtils";

import { Character, LorebookEntry } from "../types";

export default function CharacterEditView() {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const { characters, addCharacter, updateCharacter, deleteCharacter, settings } = useStore();
  const isEdit = Boolean(characterId);

  const [autoGenIdea, setAutoGenIdea] = useState("");
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);

  const [imgMode, setImgMode] = useState<"url" | "upload" | "ai">("url");
  const [imgPrompt, setImgPrompt] = useState("");
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    avatarUrl: "",
    tagline: "",
    tags: [] as string[],
    targetAudience: "all" as "all" | "male" | "female",
    isNsfw: false,
    worldview: "",
    persona: "",
    memory: "",
    greeting: "",
    userPersonaName: "",
    userPersonaDetails: "",
    customRules: "",
    lorebook: [] as LorebookEntry[],
  });

  const [tagInput, setTagInput] = useState("");

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, "");
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const addLorebookEntry = () => {
    setFormData(prev => ({
      ...prev,
      lorebook: [...prev.lorebook, { id: generateId(), keys: [], content: "" }]
    }));
  };

  const removeLorebookEntry = (id: string) => {
    setFormData(prev => ({
      ...prev,
      lorebook: prev.lorebook.filter(l => l.id !== id)
    }));
  };

  const updateLorebookEntry = (id: string, field: "keys" | "content", value: string) => {
    setFormData(prev => ({
      ...prev,
      lorebook: prev.lorebook.map(l => {
        if (l.id !== id) return l;
        if (field === "keys") {
           return { ...l, keys: value.split(",").map(k => k.trim()).filter(k => k) };
        }
        return { ...l, content: value };
      })
    }));
  };

  const handleAutoGen = async () => {
    if (!autoGenIdea.trim()) return alert("대략적인 상황이나 컨셉을 입력해주세요.");
    const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) return alert("Gemini API Key가 설정 창이나 환경변수에 필요합니다.");

    setIsGeneratingProfile(true);
    try {
      const profile = await autoGenerateCharacterProfile(settings, autoGenIdea);
      setFormData(prev => ({ ...prev, ...profile }));
    } catch (e: any) {
      alert("생성 실패: " + e.message);
    } finally {
      setIsGeneratingProfile(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await resizeAndCompressImage(file);
      setFormData(prev => ({ ...prev, avatarUrl: b64 }));
    } catch (e) {
      alert("이미지 처리 실패");
    }
  };

  const handleGenImage = async () => {
    if (!imgPrompt.trim()) return alert("이미지 프롬프트를 입력해주세요.");
    const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) return alert("Gemini API Key가 필요합니다.");
    
    setIsGeneratingImg(true);
    try {
      const b64 = await generateCharacterImage(settings, imgPrompt);
      setFormData(prev => ({ ...prev, avatarUrl: b64 }));
    } catch (e: any) {
      alert("이미지 생성 실패 (콘텐츠 필터링에 걸렸을 수 있습니다): " + e.message);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      const char = characters.find(c => c.id === characterId);
      if (char) {
        setFormData({
          name: char.name,
          avatarUrl: char.avatarUrl,
          tagline: char.tagline,
          tags: char.tags || [],
          targetAudience: char.targetAudience || "all",
          isNsfw: char.isNsfw || false,
          worldview: char.worldview,
          persona: char.persona,
          memory: char.memory,
          greeting: char.greeting,
          userPersonaName: char.userPersonaName || "",
          userPersonaDetails: char.userPersonaDetails || "",
          customRules: char.customRules || "",
          lorebook: char.lorebook || [],
        });
      } else {
        navigate("/");
      }
    }
  }, [characterId, characters, isEdit, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) return alert("캐릭터 이름은 필수입니다.");

    if (isEdit) {
      updateCharacter(characterId!, formData);
    } else {
      addCharacter({
        id: "char-" + generateId(),
        ...formData
      });
    }
    navigate("/");
  };

  const handleDelete = () => {
    if (confirm("정말 이 캐릭터를 삭제하시겠습니까?")) {
      deleteCharacter(characterId!);
      navigate("/");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto pb-24">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="serif-title text-3xl font-light">{isEdit ? "캐릭터 수정" : "새 캐릭터 창조"}</h1>
        </div>
        <div className="flex gap-2">
          {isEdit && (
            <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-full transition-colors">
              <Trash2 size={20} />
            </button>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full transition-all text-sm font-medium">
            <Save size={16} />
            <span>저장</span>
          </button>
        </div>
      </header>

      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Sparkles size={100} />
        </div>
        <h3 className="text-xl font-medium serif-title mb-2 flex items-center gap-2 text-orange-400">
          <Sparkles size={20} /> 은밀한 상상 자동 창조
        </h3>
        <p className="text-white/60 text-sm mb-5 leading-relaxed max-w-2xl">
          머릿속에 맴도는 대략적인 상황, 성적 취향, 캐릭터의 컨디션 등을 자유롭게 적어보세요. AI가 19금 역할극에 최적화된 디테일한 설정(페르소나, 메모리 등)을 자동으로 완성해줍니다.
        </p>
        <div className="flex flex-col md:flex-row gap-3 relative z-10">
          <textarea 
            value={autoGenIdea}
            onChange={e => setAutoGenIdea(e.target.value)}
            placeholder="상사인데 나한테만 발정난 여자, 비밀 사내 연애 중인데 지금 비상구 계단에서 마주침. 수위 높게 묘사해줘."
            className="flex-1 bg-black/40 border border-orange-500/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 text-sm resize-none h-20"
          />
          <button 
            onClick={handleAutoGen}
            disabled={isGeneratingProfile}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-all font-medium flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-orange-900/20"
          >
            {isGeneratingProfile ? <LoaderIcon size={18} className="animate-spin" /> : "설정 생성하기"}
          </button>
        </div>
      </div>

      <div className="space-y-6 glass-panel rounded-2xl p-6 md:p-8 border border-white/5">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-medium serif-title border-b border-white/10 pb-2">기본 정보</h2>
            <InputField label="이름 *" name="name" value={formData.name} onChange={handleChange} placeholder="ex) 클리오" />
            <InputField label="캐릭터 소개말 *" name="tagline" value={formData.tagline} onChange={handleChange} placeholder="캐릭터에 대한 소개를 간략하게 작성해 주세요." />
            
            <div className="pt-2">
              <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">태그</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-400 ml-1">×</button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="태그 작성 후 Enter (ex: 순애, 일상...)"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 text-sm"
              />
            </div>

            <div className="pt-2 flex flex-col gap-6">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">타겟 유저층</label>
                <div className="flex gap-2">
                  {(["all", "male", "female"] as const).map(aud => (
                    <button 
                      key={aud}
                      onClick={() => setFormData(prev => ({ ...prev, targetAudience: aud }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${formData.targetAudience === aud ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-black/30 border-white/10 text-white/50 hover:bg-white/5'}`}
                    >
                      {aud === "all" ? "전체" : aud === "male" ? "남성향" : "여성향"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider text-red-400">성인 컨텐츠 (19+)</label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={formData.isNsfw}
                      onChange={e => setFormData(prev => ({ ...prev, isNsfw: e.target.checked }))}
                    />
                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${formData.isNsfw ? 'bg-red-500 border-red-500' : 'bg-black/30 border-white/20'}`}>
                       {formData.isNsfw && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white/90">해당 캐릭터는 NSFW 컨텐츠 입니다.</span>
                    <p className="text-xs text-white/50 mt-1">성인 콘텐츠 이용을 위해 연령 확인이 필요할 수 있습니다.</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="pt-2">
              <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">프로필 이미지</label>
              <div className="flex gap-1 mb-3 bg-black/30 p-1 rounded-lg border border-white/10 w-fit">
                <button onClick={() => setImgMode("url")} className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-colors ${imgMode === "url" ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5"}`}><LinkIcon size={14}/> URL</button>
                <button onClick={() => setImgMode("upload")} className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-colors ${imgMode === "upload" ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5"}`}><Upload size={14}/> 업로드</button>
                <button onClick={() => setImgMode("ai")} className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-colors ${imgMode === "ai" ? "bg-orange-500/20 text-orange-400" : "text-white/50 hover:bg-white/5"}`}><ImagePlus size={14}/> AI 생성</button>
              </div>

              {imgMode === "url" && (
                <input type="text" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} placeholder="https://..." className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 text-sm" />
              )}
              {imgMode === "upload" && (
                <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white file:hover:bg-white/20" />
              )}
              {imgMode === "ai" && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input type="text" value={imgPrompt} onChange={e => setImgPrompt(e.target.value)} placeholder="이미지 프롬프트 (영문 권장, 예: a beautiful anime girl...)" className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 text-sm" />
                    <button onClick={handleGenImage} disabled={isGeneratingImg} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50">
                      {isGeneratingImg ? <LoaderIcon size={16} className="animate-spin" /> : "생성"}
                    </button>
                  </div>
                  <p className="text-xs text-orange-300/60 leading-relaxed">※ 제공되는 모델은 과도하게 야한 프롬프트를 차단할 수 있습니다.<br/>원하는 수위의 이미지를 뽑을 수 없다면 직접 뽑은 이미지를 "업로드" 탭에서 넣어주세요.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="w-40 h-56 rounded-xl border border-white/10 overflow-hidden bg-black/40 relative">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">이미지 미리보기</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-white/10">
          <h2 className="text-xl font-medium serif-title border-b border-white/10 pb-2">프롬프트 및 초기 설정</h2>
          
          <TextAreaField 
            label="캐릭터 세계관 및 페르소나 (외형, 성격, 배경 등)" 
            name="persona" 
            value={formData.persona} 
            onChange={handleChange} 
            placeholder="캐릭터 외형, 성격, 배경, 이야기 등을 상세히 작성해주세요." 
            rows={8} 
          />
          
          <TextAreaField 
            label="메모리 (Memory) - 매 턴마다 상기" 
            name="memory" 
            value={formData.memory} 
            onChange={handleChange} 
            placeholder="대화 중 절대 잊지 말아야 할 현재 상황이나 비밀. (ex: 현재 둘은 좁은 동굴에 갇혀있다.)" 
            rows={3} 
          />
          
          <TextAreaField 
            label="첫 메시지 *" 
            name="greeting" 
            value={formData.greeting} 
            onChange={handleChange} 
            placeholder="캐릭터가 대화를 시작할 때 보내는 첫 메시지를 설정하세요." 
            rows={4} 
          />
        </div>

        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex items-end justify-between border-b border-white/10 pb-2">
             <div>
               <h2 className="text-xl font-medium serif-title text-orange-400">로어북 (Lorebook)</h2>
               <p className="text-xs text-white/50 mt-1 flex-1">
                 필요한 순간에만 불러올 정보를 담는 곳입니다. 대화에 활성화 키가 등장하면 해당 항목이 입력에 포함됩니다.
               </p>
             </div>
             <button onClick={addLorebookEntry} className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors whitespace-nowrap mb-1">
               + 로어 추가하기
             </button>
          </div>
          
          <div className="space-y-4">
            {formData.lorebook.map(entry => (
              <div key={entry.id} className="bg-black/30 border border-white/10 rounded-xl p-4 relative group">
                <button 
                  onClick={() => removeLorebookEntry(entry.id)} 
                  className="absolute top-4 right-4 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
                <div className="mb-3 pr-8">
                  <label className="block text-xs font-semibold text-white/60 mb-1">활성화 키 (쉼표로 구분)</label>
                  <input 
                    type="text" 
                    value={entry.keys.join(", ")}
                    onChange={e => updateLorebookEntry(entry.id, "keys", e.target.value)}
                    placeholder="ex) 유물, 검, 전설"
                    className="w-full bg-black/50 border border-white/5 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-orange-500/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">내용</label>
                  <textarea 
                    value={entry.content}
                    onChange={e => updateLorebookEntry(entry.id, "content", e.target.value)}
                    placeholder="해당 키워드가 언급될 때 AI에게 주입할 상세 설정..."
                    rows={2}
                    className="w-full bg-black/50 border border-white/5 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-orange-500/30 text-sm resize-y"
                  />
                </div>
              </div>
            ))}
            {formData.lorebook.length === 0 && (
              <div className="text-center py-6 text-white/30 text-sm bg-black/20 rounded-xl border border-white/5 border-dashed">
                등록된 로어북 항목이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-white/10">
          <h2 className="text-xl font-medium serif-title border-b border-white/10 pb-2">나의 설정 (User Persona)</h2>
          <p className="text-sm text-white/50">선택한 캐릭터와 대화할 때만 적용되는 당신의 페르소나입니다.</p>
          
          <InputField 
            label="내 이름 (User Name)" 
            name="userPersonaName" 
            value={formData.userPersonaName} 
            onChange={handleChange} 
            placeholder="ex) 나그네, 지휘관, 용사..." 
          />
          
          <TextAreaField 
            label="내 설정 (User Details)" 
            name="userPersonaDetails" 
            value={formData.userPersonaDetails} 
            onChange={handleChange} 
            placeholder="이 캐릭터가 인식할 당신의 외형, 성격, 배경 등을 자유롭게 적어주세요." 
            rows={4} 
          />
        </div>

        <div className="space-y-6 pt-6 border-t border-white/10">
          <h2 className="text-xl font-medium serif-title border-b border-white/10 pb-2 text-orange-400">포맷 및 고급 지시 (Advanced Rules)</h2>
          <p className="text-sm text-white/50">
            특정 출력 포맷(예: 독백, 대사 분리, JSON 출력 등)이나 절대 규칙을 강제합니다.<br/>
            복잡한 조건이나 프롬프팅 기법(Jailbreak, Formatting)을 여기에 작성하세요.
          </p>
          
          <TextAreaField 
            label="고급 지시사항" 
            name="customRules" 
            value={formData.customRules} 
            onChange={handleChange} 
            placeholder="ex) 대사는 반드시 쌍따옴표 안에 넣고, 행동은 괄호 안에 넣을 것. 내부 사고(Plan)를 먼저 출력하고 대사를 출력할 것 등..." 
            rows={6} 
          />
        </div>
        
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 transition-colors"
      />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder, rows }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 transition-colors resize-y text-sm leading-relaxed"
      />
    </div>
  );
}
