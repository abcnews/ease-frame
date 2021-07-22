<script lang="ts">
  import type { VideoDocument } from '../../constants';
  import { getVideoFile } from '../../utils';
  import ContentConsole from '../ContentConsole/ContentConsole.svelte';
  import VideoConsole from '../VideoConsole/VideoConsole.svelte';

  export let videoDocument: VideoDocument;
  export let isPortraitPreferred: boolean = false;

  const videoFile = getVideoFile(videoDocument, isPortraitPreferred);

  if (!videoFile) {
    throw new Error('Video document has no files');
  }

  let seek: VideoConsole['seek'];
  let timesMS: number[] = [];
</script>

<section>
  <article>
    <VideoConsole bind:timesMS bind:seek {videoFile} />
  </article>
  <aside>
    <ContentConsole bind:timesMS bind:seek {videoDocument} {videoFile} />
  </aside>
</section>

<style>
  section {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 60rem) {
    section {
      flex-direction: row;
    }
  }

  section > * {
    margin: 1rem;
    width: calc(100% - 2rem);
    min-height: 100%;
  }

  aside {
    flex-shrink: 0;
  }

  @media (min-width: 60rem) {
    aside {
      margin-left: 0;
      max-width: 18rem;
    }
  }
</style>
