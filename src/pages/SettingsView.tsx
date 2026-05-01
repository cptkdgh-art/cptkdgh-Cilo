import { useState, useEffect } from "react";
import { useStore } from "../store";
import { User, Sparkles, Loader2 } from "lucide-react";
import { autoGenerateUserPersona } from "../lib/gemini";

import { AppSettings, ImageModel, TextModel } from "../types";

export default function SettingsView() {
  const { settings, updateSettings } = useStore();
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [isGenerating, setIsGenerating] = useState(false);
  const [personaContext, setPersonaContext] = useState("");

  // Debounce save
  useEffect(() => {
    const timer = setTimeout(() => {
      updateSettings(localSettings);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSettings, updateSettings]);

  const handleGenPersona = async () => {
    if (!personaContext.trim()) return alert("어떤 페르소나를 만들고 싶은지 간단히 적어주세요.");
    setIsGenerating(true);
    try {
      const res = await autoGenerateUserPersona(localSettings, personaContext);
      setLocalSettings(prev => ({
        ...prev,
        userDisplayName: res.userDisplayName,
        userDescription: res.userDescription
      }));
      setPersonaContext("");
    } catch (e: any) {
      alert("생성 실패: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto pb-24">
      <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="serif-title text-4xl font-light mb-2">환경 설정</h1>
          <p className="text-white/50 text-sm">마스터의 정보와 시스템 API를 설정합니다.</p>
        </div>
        <div className="flex gap-2 text-[10px] text-white/20 uppercase tracking-widest font-bold">
           <span>Auto-Saving Enabled</span>
        </div>
      </header>

      <div className="space-y-8">
        
        {/* API Settings */}
        <section className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 space-y-6">
          <h2 className="text-2xl font-medium serif-title border-b border-white/10 pb-3 flex items-center gap-2">
            시스템 연결 (API)
          </h2>
          
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Gemini API Key</label>
            <input
              type="password"
              value={localSettings.geminiApiKey}
              onChange={e => setLocalSettings(s => ({ ...s, geminiApiKey: e.target.value }))}
              placeholder="AI Studio 환경에서는 자동 주입됩니다. 필요시 오버라이드 하세요."
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-orange-500/50 transition-colors font-mono text-sm"
            />
            <p className="mt-2 text-xs text-white/40">이 값이 비어있으면 시스템 환경변수를 사용합니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">텍스트 모델</label>
              <select
                value={localSettings.textModel}
                onChange={e => setLocalSettings(s => ({ ...s, textModel: e.target.value as TextModel }))}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-orange-500/50 transition-colors"
              >
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (복잡한 논리/최고성능)</option>
                <option value="gemini-3-flash-preview">Gemini 3 Flash (기본/빠름)</option>
                <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite (초경량)</option>
                <option value="gemini-3.1-flash-preview">Gemini 3.1 Flash</option>
                <option value="gemini-3.0-pro-preview">Gemini 3.0 Pro</option>
                <option value="gemini-3.0-flash">Gemini 3.0 Flash</option>
                <option value="gemini-2.5-pro-preview">Gemini 2.5 Pro</option>
                <option value="gemini-2.5-flash-preview">Gemini 2.5 Flash</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">이미지 모델</label>
              <select
                value={localSettings.imageModel}
                onChange={e => setLocalSettings(s => ({ ...s, imageModel: e.target.value as ImageModel }))}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-orange-500/50 transition-colors"
              >
                <option value="imagen-3.0-generate-002">Imagen 3</option>
                <option value="imagen-4.0-generate-001">Imagen 4</option>
                <option value="gemini-2.5-flash-image-preview">Nano Banana 1 (2.5 Flash Image)</option>
                <option value="gemini-3.1-flash-image-preview">Nano Banana 2 (3.1 Flash Image)</option>
                <option value="gemini-3-pro-image-preview">Nano Banana Pro (3 Pro Image)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">최대 출력 토큰수</label>
              <input
                type="number"
                value={localSettings.maxOutputTokens}
                onChange={e => setLocalSettings(s => ({ ...s, maxOutputTokens: parseInt(e.target.value) || 500 }))}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-orange-500/50 transition-colors"
                min={100} max={2048} step={100}
              />
            </div>
            
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.safetyBlockNone}
                  onChange={e => setLocalSettings(s => ({ ...s, safetyBlockNone: e.target.checked }))}
                  className="w-5 h-5 accent-orange-500 bg-black/30 border-white/10 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-white/80">
                  콘텐츠 필터링 해제 시도 (Block None)
                </span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-6">
            <h2 className="text-xl font-medium serif-title flex items-center gap-2">
              <User size={20} className="text-orange-500" />
              사용자 프로필 (나의 페르소나)
            </h2>

            <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-5 space-y-3">
               <h3 className="text-sm font-semibold flex items-center gap-2 text-orange-400">
                 <Sparkles size={16} /> AI로 내 페르소나 자동 생성 (딸깍)
               </h3>
               <p className="text-xs text-white/50 leading-relaxed mb-1">
                 원하는 컨셉(예: 마왕군 지휘관, 도도한 아가씨의 하인 등)을 입력하면 AI가 이름과 설정을 자동으로 채워줍니다.
               </p>
               <div className="flex gap-2">
                  <input 
                    type="text"
                    value={personaContext}
                    onChange={e => setPersonaContext(e.target.value)}
                    placeholder="예: 현대 사회에서 이세계로 떨어진 평범한 회사원..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-orange-500/30 outline-none"
                  />
                  <button 
                    onClick={handleGenPersona}
                    disabled={isGenerating}
                    className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-900/40 shrink-0"
                  >
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : "페르소나 생성"}
                  </button>
               </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">나의 이름</label>
                <input
                  type="text"
                  value={localSettings.userDisplayName}
                  onChange={e => setLocalSettings(s => ({ ...s, userDisplayName: e.target.value }))}
                  placeholder="대화에서 불리고 싶은 이름"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-orange-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">나의 특징 / 설정</label>
                <textarea
                  value={localSettings.userDescription}
                  onChange={e => setLocalSettings(s => ({ ...s, userDescription: e.target.value }))}
                  placeholder="당신은 어떤 사람인가요? AI가 참고할 나의 기본 정보를 적어주세요."
                  rows={4}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-orange-500/50 transition-colors resize-none leading-relaxed text-sm"
                />
                <p className="mt-2 text-[10px] text-white/40">이 설정은 캐릭터와의 대화에서 기본적으로 참고됩니다. 캐릭터별 개별 설정은 캐릭터 편집에서 가능합니다.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
