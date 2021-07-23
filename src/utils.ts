import type { StillFrames, VideoDocument, VideoFile } from './constants';
import type { OrientationPreference } from './stores/preferences';

export const millisecondsToSeconds = (milliseconds: number) => milliseconds / 1000;

export const secondsToMilliseconds = (seconds: number) => Math.floor(seconds * 1000);

const padToThreeZeroes = (value: number) => String(value).padStart(3, '0');

export const formatMillisecondsAsSecondsAndMilliseconds = (milliseconds: number): string => {
  const wholeSeconds = Math.floor(milliseconds / 1000);
  const remainderMilliseconds = Math.floor(milliseconds % 1000);

  return `${padToThreeZeroes(wholeSeconds)}:${padToThreeZeroes(remainderMilliseconds)}`;
};

const comparatorNumericAscending = (a: number, b: number) => a - b;

export const sortedNumericAscending = (iterable: Iterable<number>) => [...iterable].sort(comparatorNumericAscending);

export const sortedNumericAscendingKeys = (object: { [key: number]: unknown }) =>
  sortedNumericAscending(Object.keys(object).map(x => +x));

export const onlyStringProps = (input: {}): { [key: string]: string } => {
  const output = {};

  Object.keys(input).forEach(prop => {
    if (typeof input[prop] === 'string') {
      output[prop] = input[prop];
    }
  });

  return output;
};

const HEX_COLOR_PATTERN = /^([0-9a-f]{3}){1,2}$/;

export const resolveHexColor = (color: string) => `${HEX_COLOR_PATTERN.test(color) ? '#' : ''}${color}`;

export const isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => 'touches' in event;

export const oneShotEvent = <T extends EventTarget>(target: T, name: string) => {
  return new Promise<void>(resolve => {
    const handler = () => {
      target.removeEventListener(name, handler);
      resolve();
    };

    target.addEventListener(name, handler);
  });
};

const isFileAsTallAsOrTallerThanWide = (file: VideoFile) => file.height >= file.width;
const isFileWiderThanTall = (file: VideoFile) => file.width > file.height;
const comparatorSizeDescending = (a: VideoFile, b: VideoFile) => b.size - a.size;

export const getVideoFile = (
  videoDocument: VideoDocument,
  preferredOrientation: OrientationPreference
): VideoFile | undefined => {
  const files = videoDocument.media.video.renditions.files;
  const preferredFiles = files.filter(
    preferredOrientation === 'portrait' ? isFileAsTallAsOrTallerThanWide : isFileWiderThanTall
  );

  return (preferredFiles.length > 0 ? preferredFiles : files).sort(comparatorSizeDescending)[0];
};

const stillFramesCanvasEl = document.createElement('canvas');
const stillFramesCanvasContext = stillFramesCanvasEl.getContext('2d');
const stillFramesVideoEl = Object.entries<string>({
  crossorigin: 'anonymous',
  muted: '',
  playsinline: '',
  preload: 'auto'
}).reduce<HTMLVideoElement>((el, [attr, value]) => (el.setAttribute(attr, value), el), document.createElement('video'));

export const shouldStillFramesUpdate = (videoFile: VideoFile, timesMS: number[], stillFrames: StillFrames): boolean => {
  // We should update if our stillFrames keys don't match our timesMS values
  return stillFramesVideoEl.src !== videoFile.url || sortedNumericAscendingKeys(stillFrames).join() !== timesMS.join();
};

export const getNextStillFrames = async (
  videoFile: VideoFile,
  timesMS: number[],
  currentStillFrames: StillFrames
): Promise<StillFrames> => {
  if (stillFramesCanvasContext === null) {
    throw new Error('No canvas context to work with');
  }

  const { width, height, url } = videoFile;
  const hasVideoFileChanged = stillFramesVideoEl.src !== url;
  const nextStillFrames: StillFrames = {
    ...currentStillFrames
  };

  if (hasVideoFileChanged) {
    stillFramesCanvasEl.width = width;
    stillFramesCanvasEl.height = height;
    stillFramesVideoEl.src = videoFile.url;
    await stillFramesVideoEl.play();
    await oneShotEvent(stillFramesVideoEl, 'canplaythrough');
    stillFramesVideoEl.pause();
  }

  for (let timeMS of timesMS) {
    if (hasVideoFileChanged || !nextStillFrames[timeMS]) {
      stillFramesVideoEl.currentTime = millisecondsToSeconds(timeMS);
      await oneShotEvent(stillFramesVideoEl, 'seeked');
      stillFramesCanvasContext.clearRect(0, 0, width, height);
      stillFramesCanvasContext.drawImage(stillFramesVideoEl, 0, 0, width, height, 0, 0, width, height);

      const blob = await new Promise<Blob | null>(resolve =>
        stillFramesCanvasEl.toBlob(blob => resolve(blob), 'image/jpeg', 0.5)
      );

      if (blob !== null) {
        nextStillFrames[timeMS] = blob;
      }
    }
  }

  Object.keys(nextStillFrames).forEach(timeMS => {
    if (timesMS.indexOf(+timeMS) === -1) {
      delete nextStillFrames[timeMS];
    }
  });

  return nextStillFrames;
};
