export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Minimal real-world chat example types (shared by frontend and worker)
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}
// EchoDownloader specific types
export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}
export type DownloadStatus = 'queued' | 'processing' | 'complete' | 'error';
export type DownloadFormat = 'mp3' | 'mp4';
export interface DownloadQueueItem extends VideoItem {
  status: DownloadStatus;
  progress: number;
  format: DownloadFormat;
}