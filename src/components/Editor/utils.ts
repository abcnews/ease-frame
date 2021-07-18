import { sortedNumericAscending } from '../../utils';
import type { StillFrames, VideoDocument, VideoFile } from './constants';

const isFileAsTallAsOrTallerThanWide = (file: VideoFile) => file.height >= file.width;
const isFileWiderThanTall = (file: VideoFile) => file.width > file.height;
const comparatorSizeDescending = (a: VideoFile, b: VideoFile) => b.size - a.size;

export const getVideoFile = (videoDocument: VideoDocument, isPortraitPreferred: boolean): VideoFile | undefined => {
  const files = videoDocument.media.video.renditions.files;
  const preferredFiles = files.filter(isPortraitPreferred ? isFileAsTallAsOrTallerThanWide : isFileWiderThanTall);

  return (preferredFiles.length > 0 ? preferredFiles : files).sort(comparatorSizeDescending)[0];
};

export const shouldStillFramesUpdate = (
  stillFrames: StillFrames,
  timesMS: number[],
  videoEl?: HTMLVideoElement
): boolean => {
  // We should update if:
  //   a) we have a video, and
  //   b) our stillFrames keys don't match our timesMS values
  return videoEl !== null && sortedNumericAscending(Object.keys(stillFrames).map(x => +x)).join() !== timesMS.join();
};

const stillFramesCanvas = document.createElement('canvas');
const stillFramesCanvasContext = stillFramesCanvas.getContext('2d');

export const getNextStillFrames = async (
  currentStillFrames: StillFrames,
  timesMS: number[],
  videoEl: HTMLVideoElement
): Promise<StillFrames> => {
  // This strategy won't work once we 'load' projects, but suffices
  // for snapping the current 'missing' frames as we add them.
  const { videoWidth, videoHeight } = videoEl;

  stillFramesCanvas.width = videoWidth;
  stillFramesCanvas.height = videoHeight;

  const nextStillFrames: StillFrames = {
    ...currentStillFrames
  };

  timesMSIterator: for (let timeMS of timesMS) {
    if (!nextStillFrames[timeMS] && stillFramesCanvasContext !== null) {
      await new Promise<void>(resolve =>
        setTimeout(
          async () => {
            stillFramesCanvasContext.clearRect(0, 0, stillFramesCanvas.width, stillFramesCanvas.height);
            stillFramesCanvasContext.drawImage(
              videoEl,
              0,
              0,
              videoWidth,
              videoHeight,
              0,
              0,
              stillFramesCanvas.width,
              stillFramesCanvas.height
            );

            const blob = await new Promise<Blob | null>(resolve =>
              stillFramesCanvas.toBlob(blob => resolve(blob), 'image/png')
            );

            if (blob !== null) {
              nextStillFrames[timeMS] = blob;
            }

            resolve();
          },
          videoEl.paused ? 100 : 0 // When dragging a handle to a potentially un-buffered frame, wait a bit
        )
      );

      break timesMSIterator;
    }
  }

  Object.keys(nextStillFrames).forEach(timeMS => {
    if (timesMS.indexOf(+timeMS) === -1) {
      delete nextStillFrames[timeMS];
    }
  });

  return nextStillFrames;
};
