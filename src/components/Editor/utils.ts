import type { VideoDocument, VideoFile } from './constants';

const isFileAsTallAsOrTallerThanWide = (file: VideoFile) => file.height >= file.width;
const isFileWiderThanTall = (file: VideoFile) => file.width > file.height;
const comparatorSizeDescending = (a: VideoFile, b: VideoFile) => b.size - a.size;

export const getVideoFile = (videoDocument: VideoDocument, isPortraitPreferred: boolean): VideoFile | undefined => {
  const files = videoDocument.media.video.renditions.files;
  const preferredFiles = files.filter(isPortraitPreferred ? isFileAsTallAsOrTallerThanWide : isFileWiderThanTall);

  return (preferredFiles.length > 0 ? preferredFiles : files).sort(comparatorSizeDescending)[0];
};
