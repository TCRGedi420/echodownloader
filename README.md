# EchoDownloader - YouTube Playlist Downloader

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/TCRGedi420/echodownloader)

EchoDownloader is a visually stunning and intuitive web application designed for personal and educational use, allowing users to fetch YouTube playlists and simulate downloading them in various audio or video formats. The application features a clean, modern interface with a single input for a YouTube playlist URL. Upon fetching, it displays a detailed list of all videos in the playlist, including thumbnails, titles, and durations.

The core of the experience is the advanced download queue, which provides real-time simulated progress for each video, showing statuses like 'Queued', 'Processing', and 'Complete' with individual progress bars. The entire application is built to be flawlessly responsive, providing a seamless experience on desktops, tablets, and mobile devices.

## Key Features

- **Playlist Fetching**: Simply paste a YouTube playlist URL to fetch video details.
- **Detailed Video List**: View all videos in a playlist with thumbnails, titles, and durations.
- **Flexible Selection**: Select individual videos or all videos at once for bulk actions.
- **Format Options**: Choose the desired download format (e.g., MP3, MP4) in a clean modal.
- **Simulated Download Queue**: Track the progress of each "download" in a beautiful, real-time queue.
- **Responsive Design**: Flawless experience on desktops, tablets, and mobile devices.
- **Modern UI**: Built with shadcn/ui and Tailwind CSS for a clean, polished look and feel.
- **User Feedback**: Integrated toast notifications for a smooth user experience.

## Technology Stack

- **Frontend**: React, Vite, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Framer Motion
- **State Management**: Zustand
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Backend**: Hono
- **Deployment**: Cloudflare Workers

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and configured.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/echodownloader.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd echodownloader
    ```
3.  **Install dependencies:**
    ```sh
    bun install
    ```

## Development

To run the application in development mode, which includes hot-reloading for both the frontend and the Cloudflare Worker, use the following command:

```sh
bun dev
```

This will start the Vite development server, typically available at `http://localhost:3000`.

## Deployment

This project is configured for easy deployment to Cloudflare Pages.

1.  **Log in to Wrangler:**
    ```sh
    wrangler login
    ```
2.  **Build and deploy the application:**
    ```sh
    bun deploy
    ```

This command will build the application and deploy it to your Cloudflare account.

Alternatively, you can deploy directly from your GitHub repository using the button below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/TCRGedi420/echodownloader)

## Disclaimer

This application is for educational and personal use only. It **simulates** the process of downloading and does not actually download any content from YouTube. Downloading content from YouTube without permission from the content owner is against their Terms of Service. The developers of this project do not endorse or support any form of copyright infringement.