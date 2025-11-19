
export enum Sender {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video'
}

export interface MessagePart {
  type: ContentType;
  text?: string;
  imageUrl?: string; // For display
  audioData?: string; // Base64
  videoUrl?: string;
  mimeType?: string;
}

export interface Message {
  id: string;
  sender: Sender;
  parts: MessagePart[];
  timestamp: number;
  isThinking?: boolean;
  persona?: string; // Metadata: Persona used for this message
  model?: string;   // Metadata: Technical model name (e.g., Gemini 3 Pro)
  groundingLinks?: {title: string, uri: string}[]; // Metadata: Search sources
}

export enum AppMode {
  CHAT = 'chat',
  IMAGE_GEN = 'image_gen',
  VIDEO_GEN = 'video_gen',
  LIVE_AUDIO = 'live_audio',
  IMAGE_EDIT = 'image_edit'
}

export interface ImageGenerationConfig {
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  numberOfImages: number;
}

export type VideoAspectRatio = '16:9' | '9:16';
