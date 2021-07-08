import type { CreateFFmpegOptions, FFmpeg } from '@ffmpeg/ffmpeg';

declare global {
  interface Window {
    FFmpeg: {
      createFFmpeg: (options?: CreateFFmpegOptions) => FFmpeg;
      fetchFile: (data: string | Buffer | Blob | File) => Promise<Uint8Array>;
    };
  }
}

import 'carbon-components-svelte/css/white.css';
import App from './components/App/App.svelte';

new App({
  target: document.getElementById('app'),
  props: {}
});
