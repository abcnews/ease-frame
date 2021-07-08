import type { VideoDocument } from './constants';

export const getVideoURL = (videoDocument: VideoDocument) => {
  return [...videoDocument.media.video.renditions.files].sort((a, b) => b.size - a.size)[0].url;
};
