import { useState, useEffect } from "react";
import { useStore } from "../store";
import { User } from "lucide-react";

import { AppSettings, ImageModel, TextModel } from "../types";

export default function SettingsView() {
  const { settings, updateSettings } = useStore();
  const [localSettings, setLocalSettings] = useState(settings);

  // Debounce save
  useEffect(() => {
    const timer = setTimeout(() => {
      updateSettings(localSettings);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSettings, updateSettings]);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto pb-24">
      <header className="mb-10">
        <h1 className="serif-title text-4xl font-light mb-2">환경 설정</h1>
        <p className="text-white/50 text-sm">마스터의 정보와 시스템 API를 설정합니다.</p>
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
                  className="w-5 h-5 accent-orange-500 bg-black/30 border-white/10 rounded"
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
                  rows={3}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-orange-500/50 transition-colors resize-none"
                />
                <p className="mt-1 text-[10px] text-white/40">이 설정은 캐릭터와의 대화에서 기본적으로 참고됩니다.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
