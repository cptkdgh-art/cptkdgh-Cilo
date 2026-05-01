import { useState, useEffect } from "react";
import { useStore } from "../store";

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
        </section>

      </div>
    </div>
  );
}
