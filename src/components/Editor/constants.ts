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

export interface RangeSliderChangeEvent extends CustomEvent {
  detail: {
    activeHandle: number;
    startValue: number;
    previousValue: number;
    value: number;
    values: number[];
  };
}

export interface RangeSliderStopEvent extends CustomEvent {
  detail: {
    activeHandle: number;
    startValue: number;
    value: number;
    values: number[];
  };
}
