import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings, Character, ChatSession } from '../types';
import { get, set } from 'idb-keyval';

interface StoreState {
  characters: Character[];
  chats: ChatSession[];
  settings: AppSettings;
}

interface StoreContextType extends StoreState {
  addCharacter: (char: Character) => void;
  updateCharacter: (id: string, char: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  addChat: (chat: ChatSession) => void;
  updateChat: (id: string, chat: Partial<ChatSession>) => void;
  deleteChat: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  geminiApiKey: '',
  maxOutputTokens: 800,
  safetyBlockNone: true,
  textModel: 'gemini-3.1-pro-preview',
  imageModel: 'imagen-3.0-generate-002',
  userDisplayName: '여행자',
  userDescription: '평범하지만 호기심 많은 모험가',
};

const defaultCharacters: Character[] = [
  {
    id: 'char-m1',
    name: '세라핌 (Seraphim)',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    tagline: '몰락한 엘프 귀족. 단호하지만 내면은 따뜻하다.',
    tags: ['판타지', '엘프', '츤데레', '주종관계'],
    targetAudience: 'male',
    isNsfw: true,
    worldview: '당신은 마법과 기계가 공존하는 세계인 "아르카디아"에 살고 있습니다. 인간과 엘프는 과거의 전쟁으로 신뢰를 잃었으나, 당신은 인간 마스터를 만나면서 마음을 열기 시작했습니다.',
    persona: '너는 긍지 높은 엘프 귀족이었으나 지금은 노예로 전락했다. 다소 틱틱거리지만, 상대방의 다정함에는 속수무책으로 무너진다. 말투는 존댓말과 반말을 섞어 쓴다.',
    memory: '지금 우리는 낡은 여관의 작은 방에 단둘이 있다. 바깥은 비가 내리고 있고, 분위기는 묘하게 고조되고 있다.',
    greeting: '...뭘 그렇게 쳐다보시죠? 이런 꼴이 된 엘프는 처음 보나요? 흥, 어차피 당신도 다른 인간들과 똑같겠죠.',
    userPersonaName: '선비',
    userPersonaDetails: '조선시대에서 공간 이동을 한 선비. 예의바르고 부드러운 성격이지만 뜻하지않게 다정하다.',
    customRules: '',
    lorebook: []
  }
];

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [characters, setCharacters] = useState<Character[]>(defaultCharacters);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const savedChars = await get('clio_characters');
        if (savedChars) setCharacters(savedChars);

        const savedChats = await get('clio_chats');
        if (savedChats) setChats(savedChats);

        const savedSettings = await get('clio_settings');
        if (savedSettings) setSettings({ ...defaultSettings, ...savedSettings });
      } catch(e) {
        console.error("Failed to load from IndexedDB", e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      set('clio_characters', characters).catch(console.error);
    }
  }, [characters, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      set('clio_chats', chats).catch(console.error);
    }
  }, [chats, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
       set('clio_settings', settings).catch(console.error);
    }
  }, [settings, isLoaded]);


  const addCharacter = (char: Character) => setCharacters(prev => [...prev, char]);
  const updateCharacter = (id: string, char: Partial<Character>) => setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...char } : c));
  const deleteCharacter = (id: string) => setCharacters(prev => prev.filter(c => c.id !== id));

  const addChat = (chat: ChatSession) => setChats(prev => {
    if (prev.some(c => c.id === chat.id)) return prev;
    return [...prev, chat];
  });
  const updateChat = (id: string, chat: Partial<ChatSession>) => setChats(prev => prev.map(c => c.id === id ? { ...c, ...chat } : c));
  const deleteChat = (id: string) => setChats(prev => prev.filter(c => c.id !== id));

  const updateSettings = (newSettings: Partial<AppSettings>) => setSettings(prev => ({ ...prev, ...newSettings }));

  if (!isLoaded) return null; // Or a loading spinner

  return (
    <StoreContext.Provider value={{
      characters, chats, settings,
      addCharacter, updateCharacter, deleteCharacter,
      addChat, updateChat, deleteChat,
      updateSettings
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}

