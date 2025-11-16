import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { VideoItem, DownloadQueueItem, DownloadFormat } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
type DownloaderState = {
  playlistUrl: string;
  isLoading: boolean;
  error: string | null;
  videos: VideoItem[];
  selectedVideos: Set<string>;
  downloadQueue: DownloadQueueItem[];
  isDialogOpen: boolean;
};
type DownloaderActions = {
  setPlaylistUrl: (url: string) => void;
  fetchPlaylist: () => Promise<void>;
  toggleVideoSelection: (videoId: string) => void;
  toggleSelectAll: () => void;
  openDownloadDialog: () => void;
  closeDownloadDialog: () => void;
  startDownload: (format: DownloadFormat) => void;
  updateDownloadProgress: (videoId: string, progress: number) => void;
  updateDownloadStatus: (videoId: string, status: 'complete' | 'error') => void;
  clearPlaylist: () => void;
};
export const useDownloaderStore = create<DownloaderState & DownloaderActions>()(
  immer((set, get) => ({
    playlistUrl: '',
    isLoading: false,
    error: null,
    videos: [],
    selectedVideos: new Set(),
    downloadQueue: [],
    isDialogOpen: false,
    setPlaylistUrl: (url) => set({ playlistUrl: url }),
    fetchPlaylist: async () => {
      const url = get().playlistUrl;
      if (!url) return;
      set({ isLoading: true, error: null, videos: [], selectedVideos: new Set() });
      try {
        const fetchedVideos = await api<VideoItem[]>(`/api/playlist/fetch?url=${encodeURIComponent(url)}`);
        set({ videos: fetchedVideos, isLoading: false });
        toast.success('Playlist fetched successfully!');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
      }
    },
    toggleVideoSelection: (videoId) => {
      set((state) => {
        if (state.selectedVideos.has(videoId)) {
          state.selectedVideos.delete(videoId);
        } else {
          state.selectedVideos.add(videoId);
        }
      });
    },
    toggleSelectAll: () => {
      set((state) => {
        if (state.selectedVideos.size === state.videos.length) {
          state.selectedVideos.clear();
        } else {
          state.videos.forEach((video) => state.selectedVideos.add(video.id));
        }
      });
    },
    openDownloadDialog: () => set({ isDialogOpen: true }),
    closeDownloadDialog: () => set({ isDialogOpen: false }),
    startDownload: (format) => {
      const { videos, selectedVideos } = get();
      const videosToDownload = videos.filter((v) => selectedVideos.has(v.id));
      if (videosToDownload.length === 0) {
        toast.warning('No videos selected for download.');
        return;
      }
      const newQueueItems: DownloadQueueItem[] = videosToDownload.map((video) => ({
        ...video,
        format,
        status: 'queued',
        progress: 0,
      }));
      set((state) => {
        // Avoid adding duplicates to the queue
        const existingIds = new Set(state.downloadQueue.map(item => item.id));
        const filteredNewItems = newQueueItems.filter(item => !existingIds.has(item.id));
        state.downloadQueue.push(...filteredNewItems);
        state.isDialogOpen = false;
      });
      toast.info(`Added ${newQueueItems.length} videos to the download queue.`);
    },
    updateDownloadProgress: (videoId, progress) => {
      set((state) => {
        const item = state.downloadQueue.find((i) => i.id === videoId);
        if (item) {
          item.progress = progress;
          if (item.status === 'queued') {
            item.status = 'processing';
          }
        }
      });
    },
    updateDownloadStatus: (videoId, status) => {
        set((state) => {
            const item = state.downloadQueue.find((i) => i.id === videoId);
            if (item) {
                item.status = status;
                if (status === 'complete') {
                    item.progress = 100;
                }
            }
        });
    },
    clearPlaylist: () => {
      set({
        playlistUrl: '',
        videos: [],
        selectedVideos: new Set(),
        error: null,
      });
    },
  }))
);