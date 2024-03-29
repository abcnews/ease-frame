<script lang="ts">
  import { fade } from 'svelte/transition';
  import size from '../../actions/size';
  import type { StillFrames, StillFramesObjectURLs, VideoDocument, VideoFile } from '../../constants';
  import { default as preferences } from '../../stores/preferences';
  import { getNextStillFrames, shouldStillFramesUpdate } from '../../utils';
  import Figure from '../Figure/Figure.svelte';
  import { PopoverPosition } from '../PreferencesManager/constants';
  import PreferencesManager from '../PreferencesManager/PreferencesManager.svelte';

  import type VideoConsole from '../VideoConsole/VideoConsole.svelte';
  import Exporter from './Exporter.svelte';

  export let timesMS: number[];
  export let seek: VideoConsole['seek'];
  export let videoFile: VideoFile;
  export let videoDocument: VideoDocument;

  let stillFrames: StillFrames = {};
  let stillFramesObjectURLs: StillFramesObjectURLs = {};
  let preferencesManagerPopoverPosition: PopoverPosition;

  $: articleLines = [
    `#easeframe${videoDocument.id}${$preferences && preferences.getConfigAsAlternatingCase()}`,
    ...timesMS.map(timeMS => `#markTIME${timeMS}`),
    `#endeaseframe`
  ];
  $: shouldStillFramesUpdate(videoFile, timesMS, stillFrames) &&
    getNextStillFrames(videoFile, timesMS, stillFrames).then(nextStillFrames => {
      stillFrames = nextStillFrames;
      stillFramesObjectURLs = Object.keys(nextStillFrames).reduce(
        (memo, key) => ({
          ...memo,
          [key]: URL.createObjectURL(stillFrames[key])
        }),
        {}
      );
    });

  const onSize = ({ height }: DOMRect) =>
    (preferencesManagerPopoverPosition = height < 200 ? PopoverPosition.TOP : PopoverPosition.BOTTOM);
</script>

<div use:size={onSize}>
  <ul>
    <li>
      <pre>{articleLines[0].replace(/([A-Z]+)/g, '\n…$1')}</pre>
      <PreferencesManager popoverPosition={preferencesManagerPopoverPosition} />
    </li>
    {#each timesMS as timeMS, index}
      <li on:click={() => seek(+timeMS)} on:keydown={() => {}}>
        <pre>{articleLines[index + 1]}</pre>
        <Figure ratio="1x1">
          {#if timeMS in stillFramesObjectURLs}
            <img
              src={stillFramesObjectURLs[timeMS]}
              alt={`A still image of the video at ${timeMS}ms`}
              in:fade
              out:fade
            />
          {/if}
        </Figure>
      </li>
    {/each}
    <li>
      <pre>{articleLines[articleLines.length - 1]}</pre>
    </li>
  </ul>
  {#if timesMS.length > 0}
    <footer>
      <Exporter {videoDocument} {articleLines} {stillFrames} />
    </footer>
  {/if}
</div>

<style>
  div {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f4f4f4;
  }

  ul {
    margin: 0 0 auto;
    padding: 0;
    display: block;
  }

  li {
    min-height: 4rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  li + li {
    border-top: 1px solid #c6c6c6;
  }

  li:not(:first-child):not(:last-child) {
    cursor: pointer;
  }

  li:not(:first-child):not(:last-child):hover {
    background-color: #e0e0e0;
  }

  li > :global(*) {
    position: relative;
  }

  li > :global(:not(figure)) {
    margin: 0.75rem;
  }

  pre {
    font-size: 1rem;
    line-height: 1.2;
  }

  li :global(figure) {
    margin: 0;
    width: 4rem;
  }

  footer {
    margin-top: auto;
  }
</style>
