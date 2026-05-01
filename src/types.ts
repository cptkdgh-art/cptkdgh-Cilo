export type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
};

export type Character = {
  id: string;
  name: string;
  avatarUrl: string;
  tagline: string;
  tags: string[]; // 새로 추가
  targetAudience: 'all' | 'male' | 'female'; // 새로 추가
  isNsfw: boolean; // 새로 추가
  worldview: string;
  persona: string;
  memory: string;
  greeting: string;
  userPersonaName: string;
  userPersonaDetails: string;
  customRules: string;
  lorebook: LorebookEntry[]; // 새로 추가
};

export type LorebookEntry = {
  id: string;
  keys: string[]; // 콤마로 구분된 키워드 배열
  content: string; // 설정 내용
};

export type AppSettings = {
  geminiApiKey: string;
  maxOutputTokens: number;
  safetyBlockNone: boolean; // Custom setting
};

export type ChatSession = {
  id: string;
  characterId: string;
  title?: string;
  messages: Message[];
  updatedAt: number;
};

