import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Link, ListVideo, Loader2, Music, Video, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useDownloaderStore } from '@/stores/downloader-store';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { DownloadFormat, DownloadQueueItem, VideoItem } from '@shared/types';
// Main Component
export function HomePage() {
  return (
    <>
      <div className="min-h-screen bg-background text-foreground relative">
        <ThemeToggle className="absolute top-6 right-6" />
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-[linear-gradient(to_right,#1e1e1e_1px,transparent_1px),linear-gradient(to_bottom,#1e1e1e_1px,transparent_1px)]">
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(79,70,229,0.1),transparent)]"></div>
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 md:py-24 lg:py-32">
            <HeroSection />
            <AnimatePresence>
              <PlaylistSection />
            </AnimatePresence>
            <DownloadQueueSection />
          </div>
        </main>
        <footer className="text-center py-8 text-muted-foreground text-sm">
            Built with ❤️ at Cloudflare
        </footer>
      </div>
      <Toaster richColors position="top-right" />
      <DownloadOptionsDialog />
    </>
  );
}
// Hero Section Component
function HeroSection() {
  const playlistUrl = useDownloaderStore((s) => s.playlistUrl);
  const setPlaylistUrl = useDownloaderStore((s) => s.setPlaylistUrl);
  const fetchPlaylist = useDownloaderStore((s) => s.fetchPlaylist);
  const isLoading = useDownloaderStore((s) => s.isLoading);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!playlistUrl.trim()) {
        toast.warning("Please enter a YouTube playlist URL.");
        return;
    }
    fetchPlaylist();
  };
  return (
    <section className="text-center space-y-6 animate-fade-in">
      <div className="inline-flex items-center justify-center bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300 rounded-full p-3">
        <Download className="h-8 w-8" />
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground">
        EchoDownloader
      </h1>
      <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
        Paste a YouTube playlist link to get started. This is a simulator for personal and educational purposes only.
      </p>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex gap-2">
        <div className="relative flex-grow">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="url"
            placeholder="https://www.youtube.com/playlist?list=..."
            className="pl-10 h-12 text-base"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" size="lg" className="h-12 bg-brand-600 hover:bg-brand-700 text-white" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
          Fetch Playlist
        </Button>
      </form>
    </section>
  );
}
// Playlist Section Component
function PlaylistSection() {
    const isLoading = useDownloaderStore((s) => s.isLoading);
    const videos = useDownloaderStore((s) => s.videos);
    const error = useDownloaderStore((s) => s.error);
    if (isLoading) return <PlaylistSkeleton />;
    if (error) return <ErrorDisplay message={error} />;
    if (videos.length === 0) return null;
    return (
        <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-16"
        >
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><ListVideo /> Playlist Videos</CardTitle>
                        <CardDescription>{videos.length} videos found in the playlist.</CardDescription>
                    </div>
                    <PlaylistActions />
                </CardHeader>
                <CardContent>
                    <Disclaimer />
                    <div className="border rounded-md max-h-[500px] overflow-y-auto">
                        {videos.map((video) => (
                            <VideoItemComponent key={video.id} video={video} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.section>
    );
}
function PlaylistActions() {
    const videos = useDownloaderStore((s) => s.videos);
    const selectedVideos = useDownloaderStore((s) => s.selectedVideos);
    const toggleSelectAll = useDownloaderStore((s) => s.toggleSelectAll);
    const openDownloadDialog = useDownloaderStore((s) => s.openDownloadDialog);
    const allSelected = videos.length > 0 && selectedVideos.size === videos.length;
    const isIndeterminate = selectedVideos.size > 0 && selectedVideos.size < videos.length;
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
                <Checkbox 
                    id="select-all" 
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all videos"
                />
                <label htmlFor="select-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Select All
                </label>
            </div>
            <Button onClick={openDownloadDialog} disabled={selectedVideos.size === 0}>
                <Download className="mr-2 h-4 w-4" />
                Download Selected ({selectedVideos.size})
            </Button>
        </div>
    );
}
function VideoItemComponent({ video }: { video: VideoItem }) {
    const selectedVideos = useDownloaderStore((s) => s.selectedVideos);
    const toggleVideoSelection = useDownloaderStore((s) => s.toggleVideoSelection);
    const isSelected = selectedVideos.has(video.id);
    return (
        <div className={cn(
            "flex items-center gap-4 p-3 border-b last:border-b-0 transition-colors",
            isSelected ? "bg-brand-50 dark:bg-brand-900/20" : "hover:bg-muted/50"
        )}>
            <Checkbox 
                checked={isSelected}
                onCheckedChange={() => toggleVideoSelection(video.id)}
                aria-label={`Select video: ${video.title}`}
            />
            <img src={video.thumbnail} alt={video.title} className="w-24 h-14 rounded-md object-cover" />
            <div className="flex-grow">
                <p className="font-medium line-clamp-2">{video.title}</p>
            </div>
            <span className="text-sm text-muted-foreground font-mono">{video.duration}</span>
        </div>
    );
}
function PlaylistSkeleton() {
    return (
        <section className="mt-16">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <div className="border rounded-md">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 border-b last:border-b-0">
                                <Skeleton className="h-5 w-5" />
                                <Skeleton className="w-24 h-14 rounded-md" />
                                <div className="flex-grow space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <Skeleton className="h-4 w-12" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
function ErrorDisplay({ message }: { message: string }) {
    const clearPlaylist = useDownloaderStore((s) => s.clearPlaylist);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 flex flex-col items-center gap-4 text-center"
        >
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h3 className="text-xl font-semibold">An Error Occurred</h3>
            <p className="text-muted-foreground">{message}</p>
            <Button variant="outline" onClick={clearPlaylist}>Try Again</Button>
        </motion.div>
    );
}
function Disclaimer() {
    return (
        <div className="p-3 mb-4 rounded-md bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50">
            <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Disclaimer</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Downloading content from YouTube without permission may violate their Terms of Service. This tool is for educational and personal use only. Please respect copyright laws.
                    </p>
                </div>
            </div>
        </div>
    );
}
// Download Queue Section Component
function DownloadQueueSection() {
    const downloadQueue = useDownloaderStore((s) => s.downloadQueue);
    useEffect(() => {
        const activeDownloads = downloadQueue.filter(item => item.status === 'queued' || item.status === 'processing');
        if (activeDownloads.length > 0) {
            const interval = setInterval(() => {
                activeDownloads.forEach(item => {
                    if (item.status === 'processing' && item.progress < 100) {
                        const increment = Math.random() * 10 + 5;
                        const newProgress = Math.min(item.progress + increment, 100);
                        useDownloaderStore.getState().updateDownloadProgress(item.id, newProgress);
                        if (newProgress >= 100) {
                            useDownloaderStore.getState().updateDownloadStatus(item.id, 'complete');
                        }
                    } else if (item.status === 'queued') {
                        useDownloaderStore.getState().updateDownloadProgress(item.id, 0);
                    }
                });
            }, 500);
            return () => clearInterval(interval);
        }
    }, [downloadQueue]);
    if (downloadQueue.length === 0) return null;
    return (
        <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-16"
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Download /> Download Queue</CardTitle>
                    <CardDescription>Simulating your downloads. This is not a real download process.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {downloadQueue.map((item) => (
                            <DownloadItemComponent key={item.id} item={item} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.section>
    );
}
function DownloadItemComponent({ item }: { item: DownloadQueueItem }) {
    const getStatusInfo = () => {
        switch (item.status) {
            case 'queued':
                return { icon: <Info className="h-4 w-4 text-muted-foreground" />, text: 'Queued', color: 'text-muted-foreground' };
            case 'processing':
                return { icon: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />, text: 'Processing...', color: 'text-blue-500' };
            case 'complete':
                return { icon: <CheckCircle className="h-4 w-4 text-green-500" />, text: 'Complete', color: 'text-green-500' };
            case 'error':
                return { icon: <X className="h-4 w-4 text-destructive" />, text: 'Error', color: 'text-destructive' };
        }
    };
    const { icon, text, color } = getStatusInfo();
    return (
        <div className="p-3 border rounded-md">
            <div className="flex items-center gap-4">
                <div className="flex-grow">
                    <p className="font-medium line-clamp-1">{item.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="uppercase font-bold text-xs bg-secondary px-2 py-0.5 rounded">
                            {item.format}
                        </span>
                        <span className={cn("flex items-center gap-1", color)}>
                            {icon} {text}
                        </span>
                    </div>
                </div>
                <div className="w-32 text-right">
                    <span className="text-sm font-mono">{item.progress.toFixed(0)}%</span>
                </div>
            </div>
            <Progress value={item.progress} className="mt-2 h-2" />
        </div>
    );
}
// Download Options Dialog Component
function DownloadOptionsDialog() {
    const isDialogOpen = useDownloaderStore((s) => s.isDialogOpen);
    const closeDownloadDialog = useDownloaderStore((s) => s.closeDownloadDialog);
    const startDownload = useDownloaderStore((s) => s.startDownload);
    const [format, setFormat] = useState<DownloadFormat>('mp3');
    const handleConfirm = () => {
        startDownload(format);
    };
    return (
        <Dialog open={isDialogOpen} onOpenChange={closeDownloadDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Download Options</DialogTitle>
                    <DialogDescription>
                        Choose the format for your selected files. The download process is a simulation.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <label htmlFor="format-select" className="text-sm font-medium">Format</label>
                    <Select value={format} onValueChange={(value: DownloadFormat) => setFormat(value)}>
                        <SelectTrigger id="format-select" className="w-full mt-2">
                            <SelectValue placeholder="Select a format" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mp3">
                                <div className="flex items-center gap-2">
                                    <Music className="h-4 w-4" />
                                    <span>MP3 (Audio)</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="mp4">
                                <div className="flex items-center gap-2">
                                    <Video className="h-4 w-4" />
                                    <span>MP4 (Video)</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={closeDownloadDialog}>Cancel</Button>
                    <Button onClick={handleConfirm} className="bg-brand-600 hover:bg-brand-700 text-white">
                        Start Download
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}