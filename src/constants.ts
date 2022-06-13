import type { Options } from 'miniget';
import type { Preferences } from './stores/preferences';

export type VideoReference = string;

export interface ImportedProject extends Preferences {
  videoReference: VideoReference;
  timesMS: number[];
}

export enum VideoLibrary {
  TERMINUS = 'terminus',
  YOUTUBE = 'youtube'
}

export type VideoLocation = {
  id: string;
  library: VideoLibrary;
};

export interface VideoFile {
  width: number;
  height: number;
  url: string;
}

export type TerminusVideoDocument = {
  id: string;
  docType: 'video';
  media: {
    video: {
      renditions: {
        files: VideoFile[];
      };
    };
    image: {
      poster: {
        images: {
          [key: string]: string;
        };
      };
    };
  };
};

export type YouTubeVideoDocument = {
  formats: VideoFile[];
};

export type VideoDocument = {
  _library: VideoLibrary;
  _reference: VideoReference;
} & (TerminusVideoDocument | YouTubeVideoDocument);

export interface StillFrames {
  [key: number]: Blob;
}

export interface StillFramesObjectURLs {
  [key: number]: string;
}

export const PROXY_HOSTNAME = 'abcnews-cors-anywhere.herokuapp.com';
export const YOUTUBE_WATCH_URL_PREFIX = 'https://www.youtube.com/watch?v=';
export const YTDL_OPTIONS = {
  requestOptions: {
    transform: parsedUrl => {
      parsedUrl.path = `/${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.path}`;
      parsedUrl.host = parsedUrl.hostname = PROXY_HOSTNAME;

      return parsedUrl;
    }
  } as Options
};
