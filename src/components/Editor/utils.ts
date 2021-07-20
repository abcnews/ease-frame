import { millisecondsToSeconds, oneShotEvent, sortedNumericAscending } from '../../utils';
import type { StillFrames, VideoDocument, VideoFile } from './constants';

const isFileAsTallAsOrTallerThanWide = (file: VideoFile) => file.height >= file.width;
const isFileWiderThanTall = (file: VideoFile) => file.width > file.height;
const comparatorSizeDescending = (a: VideoFile, b: VideoFile) => b.size - a.size;

export const getVideoFile = (videoDocument: VideoDocument, isPortraitPreferred: boolean): VideoFile | undefined => {
  const files = videoDocument.media.video.renditions.files;
  const preferredFiles = files.filter(isPortraitPreferred ? isFileAsTallAsOrTallerThanWide : isFileWiderThanTall);

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
  return (
    stillFramesVideoEl.src !== videoFile.url ||
    sortedNumericAscending(Object.keys(stillFrames).map(x => +x)).join() !== timesMS.join()
  );
};

export const getNextStillFrames = async (
  videoFile: VideoFile,
  timesMS: number[],
  currentStillFrames: StillFrames
): Promise<StillFrames> => {
  if (stillFramesCanvasContext === null) {
    throw new Error('No canvas context to work with');
  }

  const { width, height } = videoFile;
  const nextStillFrames: StillFrames = {
    ...currentStillFrames
  };

  stillFramesCanvasEl.width = width;
  stillFramesCanvasEl.height = height;
  stillFramesVideoEl.src = videoFile.url;
  await stillFramesVideoEl.play();
  await oneShotEvent(stillFramesVideoEl, 'canplaythrough');
  stillFramesVideoEl.pause();

  for (let timeMS of timesMS) {
    if (!nextStillFrames[timeMS]) {
      stillFramesVideoEl.currentTime = millisecondsToSeconds(timeMS);
      await oneShotEvent(stillFramesVideoEl, 'seeked');
      stillFramesCanvasContext.clearRect(0, 0, width, height);
      stillFramesCanvasContext.drawImage(stillFramesVideoEl, 0, 0, width, height, 0, 0, width, height);

      const blob = await new Promise<Blob | null>(resolve =>
        stillFramesCanvasEl.toBlob(blob => resolve(blob), 'image/png')
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
