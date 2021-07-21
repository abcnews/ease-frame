<script lang="ts">
  import { secondsToMilliseconds } from '../../utils';
  import Exporter from '../Exporter/Exporter.svelte';
  import Figure from '../Figure/Figure.svelte';
  import Nav from '../Nav/Nav.svelte';
  import PreferencesManager from '../Preferences/PreferencesManager.svelte';
  import { default as preferences } from '../Preferences/store';
  import Timeline from '../Timeline/Timeline.svelte';
  import Video from '../Video/Video.svelte';
  import type { StillFrames, VideoDocument } from './constants';
  import { getNextStillFrames, getVideoFile, shouldStillFramesUpdate } from './utils';

  export let videoDocument: VideoDocument;
  export let isPortraitPreferred: boolean = false;

  const videoFile = getVideoFile(videoDocument, isPortraitPreferred);

  if (!videoFile) {
    throw new Error('Video document has no files');
  }

  let seek: Video['seek'];
  let togglePlayback: Video['togglePlayback'];
  let currentTime: HTMLVideoElement['currentTime'] = 0;
  let duration: HTMLVideoElement['duration'] = 0;
  let paused: HTMLVideoElement['paused'] = true;
  let timesMS: number[] = [];
  let stillFrames: StillFrames = {};

  $: currentTimeMS = secondsToMilliseconds(currentTime);
  $: durationMS = secondsToMilliseconds(duration);
  $: articleLines = [
    `#easeframe${videoDocument.id}${$preferences && preferences.getAlternatingCase()}`,
    ...timesMS.map(timeMS => `#markTIME${timeMS}`),
    `#endeaseframe`
  ];
  $: shouldStillFramesUpdate(videoFile, timesMS, stillFrames) &&
    getNextStillFrames(videoFile, timesMS, stillFrames).then(nextStillFrames => (stillFrames = nextStillFrames));
</script>

<section>
  <article>
    <Video bind:currentTime bind:duration bind:paused bind:seek bind:togglePlayback src={videoFile.url} />
    {#if durationMS > 0}
      <Timeline bind:timesMS {currentTimeMS} {durationMS} {seek} />
      <Nav bind:timesMS {currentTimeMS} {durationMS} {seek} {togglePlayback} {paused} />
    {/if}
  </article>
  <aside>
    <div>
      <pre>{articleLines[0].replace(/([A-Z]+)/g, '\n…$1')}</pre>
      <div class="preferences">
        <PreferencesManager />
      </div>
    </div>
    {#each Object.keys(stillFrames) as timeMS, index}
      <div>
        <pre>{articleLines[index + 1]}</pre>
        <Figure>
          <img
            src={URL.createObjectURL(stillFrames[timeMS])}
            alt={`A still image of the video at ${timeMS}ms`}
            on:click={() => seek(+timeMS)}
          />
        </Figure>
      </div>
    {/each}
    <div>
      <pre>{articleLines[articleLines.length - 1]}</pre>
    </div>
    {#if timesMS.length > 0}
      <footer>
        <Exporter {videoDocument} {articleLines} {stillFrames} />
      </footer>
    {/if}
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
  }

  article {
    width: calc(100% - 2rem);
  }

  article > :global(*) {
    width: 100%;
  }

  aside {
    flex-shrink: 0;
    width: calc(100% - 2rem);
    min-height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f4f4f4;
    font-size: 0.875rem;
  }

  @media (min-width: 60rem) {
    aside {
      margin-left: 0;
      max-width: 18rem;
      font-size: 1rem;
    }
  }

  aside > div {
    box-sizing: content-box;
    height: 4rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  aside > div ~ div {
    border-top: 1px solid #c6c6c6;
  }

  aside pre {
    margin-left: 0.75rem;
  }

  aside .preferences {
    position: relative;
    margin-right: 0.75rem;
  }

  aside :global(figure) {
    margin: 0;
    width: 5.334rem;
    cursor: pointer;
  }

  aside footer {
    margin-top: auto;
  }
</style>
