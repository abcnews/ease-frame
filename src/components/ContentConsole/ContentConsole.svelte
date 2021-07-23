<script lang="ts">
  import size from '../../actions/size';
  import type { StillFrames, VideoDocument, VideoFile } from '../../constants';
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
  let preferencesManagerPopoverPosition: PopoverPosition;

  $: articleLines = [
    `#easeframe${videoDocument.id}${$preferences && preferences.getAlternatingCase()}`,
    ...timesMS.map(timeMS => `#markTIME${timeMS}`),
    `#endeaseframe`
  ];
  $: shouldStillFramesUpdate(videoFile, timesMS, stillFrames) &&
    getNextStillFrames(videoFile, timesMS, stillFrames).then(nextStillFrames => (stillFrames = nextStillFrames));

  const onSize = ({ height }: DOMRect) =>
    (preferencesManagerPopoverPosition = height < 200 ? PopoverPosition.TOP : PopoverPosition.BOTTOM);
</script>

<div use:size={onSize}>
  <ul>
    <li>
      <pre>{articleLines[0].replace(/([A-Z]+)/g, '\n…$1')}</pre>
      <PreferencesManager popoverPosition={preferencesManagerPopoverPosition} />
    </li>
    {#each Object.keys(stillFrames) as timeMS, index}
      <li>
        <pre>{articleLines[index + 1]}</pre>
        <Figure>
          <img
            src={URL.createObjectURL(stillFrames[timeMS])}
            alt={`A still image of the video at ${timeMS}ms`}
            on:click={() => seek(+timeMS)}
          />
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
    width: 5.334rem;
    cursor: pointer;
  }

  footer {
    margin-top: auto;
  }
</style>
