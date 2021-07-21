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

export interface RangeSliderEvent extends CustomEvent {
  detail: {
    value: number;
    values: number[];
  };
}
