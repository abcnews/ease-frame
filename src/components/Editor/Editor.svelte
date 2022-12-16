<script lang="ts">
  import type { ImportedProject, VideoDocument } from '../../constants';
  import preferences from '../../stores/preferences';
  import { saveProject } from '../../stores/projects';
  import { getVideoFile } from '../../utils';
  import ContentConsole from '../ContentConsole/ContentConsole.svelte';
  import VideoConsole from '../VideoConsole/VideoConsole.svelte';

  export let importedProject: ImportedProject | undefined;
  export let videoDocument: VideoDocument;

  let seek: VideoConsole['seek'];
  let timesMS: number[] = (importedProject && importedProject.timesMS) || [];

  $: videoFile = getVideoFile(videoDocument, $preferences.orientation);

  // Continually persist changes
  $: saveProject(videoDocument.id, timesMS, $preferences);
</script>

{#if videoFile}
  <section>
    <article>
      <VideoConsole bind:timesMS bind:seek {videoFile} />
    </article>
    <aside>
      <ContentConsole bind:timesMS bind:seek {videoDocument} {videoFile} />
    </aside>
  </section>
{:else}
  <section>
    <p>Video document has no files</p>
  </section>
{/if}

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
