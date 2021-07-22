import type { Preferences } from './stores/preferences';

export interface ImportedProject extends Preferences {
  videoReference: string;
  timesMS: number[];
}

export interface VideoFile {
  size: number;
  width: number;
  height: number;
  url: string;
}

export type VideoDocument = {
  id: string;
  docType: string;
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

export interface StillFrames {
  [key: number]: Blob;
}
