export type Message = {
  id: string;
  role: 'user' | 'model' | 'assistant_image';
  content: string;
  imageUrl?: string;
  timestamp: number;
};

export type Character = {
  id: string;
  name: string;
  avatarUrl: string;
  tagline: string;
  tags: string[];
  targetAudience: 'all' | 'male' | 'female';
  isNsfw: boolean;
  worldview: string;
  persona: string;
  memory: string;
  greeting: string;
  userPersonaName: string;
  userPersonaDetails: string;
  customRules: string;
  lorebook: LorebookEntry[];
};

export type LorebookEntry = {
  id: string;
  keys: string[];
  content: string;
};

export type TextModel = 
  | "gemini-3.1-pro-preview" 
  | "gemini-3-flash-preview"
  | "gemini-3.1-flash-lite-preview"
  | "gemini-3.1-flash-preview"
  | "gemini-3.0-pro-preview"
  | "gemini-3.0-flash" 
  | "gemini-2.5-pro-preview"
  | "gemini-2.5-flash-preview"
  | "gemini-1.5-pro" 
  | "gemini-1.5-flash";

export type ImageModel = 
  | "imagen-3.0-generate-002" 
  | "imagen-4.0-generate-001"
  | "gemini-2.5-flash-image-preview"
  | "gemini-3.1-flash-image-preview" 
  | "gemini-3-pro-image-preview"
  | string;

export type AppSettings = {
  geminiApiKey: string;
  maxOutputTokens: number;
  safetyBlockNone: boolean;
  textModel: TextModel;
  imageModel: ImageModel;
  userDisplayName: string;
  userDescription: string;
};

export type ChatSession = {
  id: string;
  characterId: string;
  title?: string;
  messages: Message[];
  updatedAt: number;
};

