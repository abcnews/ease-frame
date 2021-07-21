<script lang="ts">
  import Button from 'carbon-components-svelte/src/Button/Button.svelte';
  import BookmarkAdd24 from 'carbon-icons-svelte/lib/BookmarkAdd24/BookmarkAdd24.svelte';
  import Hashtag24 from 'carbon-icons-svelte/lib/Hashtag24/Hashtag24.svelte';
  import ImageCopy24 from 'carbon-icons-svelte/lib/ImageCopy24/ImageCopy24.svelte';
  import NextFilled24 from 'carbon-icons-svelte/lib/NextFilled24/NextFilled24.svelte';
  import NextOutline24 from 'carbon-icons-svelte/lib/NextOutline24/NextOutline24.svelte';
  import PauseFilled24 from 'carbon-icons-svelte/lib/PauseFilled24/PauseFilled24.svelte';
  import PlayFilledAlt24 from 'carbon-icons-svelte/lib/PlayFilledAlt24/PlayFilledAlt24.svelte';
  import PreviousFilled24 from 'carbon-icons-svelte/lib/PreviousFilled24/PreviousFilled24.svelte';
  import PreviousOutline24 from 'carbon-icons-svelte/lib/PreviousOutline24/PreviousOutline24.svelte';
  import TrashCan24 from 'carbon-icons-svelte/lib/TrashCan24/TrashCan24.svelte';
  import JSZip from 'jszip';
  import { saveAs } from 'file-saver';
  import RangeSlider from 'svelte-range-slider-pips';
  import {
    formatMillisecondsAsSecondsAndMilliseconds,
    secondsToMilliseconds,
    sortedNumericAscending
  } from '../../utils';
  import Figure from '../Figure/Figure.svelte';
  import PreferencesManager from '../Preferences/PreferencesManager.svelte';
  import { default as preferences } from '../Preferences/store';
  import Video from '../Video/Video.svelte';
  import type { RangeSliderEvent, StillFrames, VideoDocument } from './constants';
  import { getNextStillFrames, getVideoFile, shouldStillFramesUpdate } from './utils';

  export let videoDocument: VideoDocument;
  export let isPortraitPreferred: boolean = false;

  const videoFile = getVideoFile(videoDocument, isPortraitPreferred);

  if (!videoFile) {
    throw new Error('Video document has no files');
  }

  let seek: Video['seek'];
  let togglePlayback: Video['togglePlayback'];
  let currentTime: number = 0;
  let duration: number = 0;
  let paused: boolean = true;
  let timesMS: number[] = [];
  let stillFrames: StillFrames = {};

  $: currentTimeMS = secondsToMilliseconds(currentTime);
  $: durationMS = secondsToMilliseconds(duration);
  $: isCurrentTimeMSMarked = timesMS.includes(currentTimeMS);
  $: keyTimesMS = [0, ...timesMS.filter(timeMS => timeMS !== 0), durationMS];
  $: previousKeyTimesMS = keyTimesMS.filter(timeMS => timeMS < currentTimeMS);
  $: nextKeyTimesMS = keyTimesMS.filter(timeMS => timeMS > currentTimeMS);
  $: articleLines = [
    `#easeframe${videoDocument.id}${$preferences && preferences.getAlternatingCase()}`,
    ...timesMS.map(timeMS => `#markTIME${timeMS}`),
    `#endeaseframe`
  ];
  $: shouldStillFramesUpdate(videoFile, timesMS, stillFrames) &&
    getNextStillFrames(videoFile, timesMS, stillFrames).then(nextStillFrames => (stillFrames = nextStillFrames));

  const addCurrentTimeMS = () => (timesMS = sortedNumericAscending([...timesMS, currentTimeMS]));
  const removeCurrentTimeMS = () => (timesMS = timesMS.filter(timeMS => timeMS !== currentTimeMS));
  const seekToHandleValue = (event: RangeSliderEvent) => seek(event.detail.value);
  const updateTimesMSToHandlesValues = (event: RangeSliderEvent) =>
    (timesMS = sortedNumericAscending(new Set(event.detail.values)));
  const seekToPreviousKeyTimeMS = () => seek(Math.max(...previousKeyTimesMS));
  const seekToNextKeyTimeMS = () => seek(Math.min(...nextKeyTimesMS));
  const seekBy = (diffMS: number) => seek(Math.round((currentTimeMS + diffMS) / 10) * 10);

  const copyMarkers = () => {
    navigator.clipboard.writeText(articleLines.join('\n\n'));
  };

  const exportAssets = async () => {
    const zip = new JSZip();
    const numDurationMSChars = String(durationMS).length;
    const name = `ease-frame-${videoDocument.id}`;

    // Images
    timesMS.forEach(timeMS => {
      zip.file(`${name}-image-${String(timeMS).padStart(numDurationMSChars, '0')}.png`, stillFrames[timeMS]);
    });

    // Text
    zip.file(`${name}-text.txt`, articleLines.join('\n\n'));

    // Archive
    const zipFile = await zip.generateAsync({ type: 'blob' });

    saveAs(zipFile, `${name}.zip`);
  };
</script>

<section>
  <article>
    <Video bind:currentTime bind:duration bind:paused bind:seek bind:togglePlayback src={videoFile.url} />
    {#if durationMS > 0}
      <div class="mounts-input">
        <RangeSlider
          min={0}
          max={durationMS}
          step={1}
          handleFormatter={formatMillisecondsAsSecondsAndMilliseconds}
          springValues={{ stiffness: 1, damping: 1 }}
          values={timesMS}
          on:start={seekToHandleValue}
          on:change={seekToHandleValue}
          on:stop={updateTimesMSToHandlesValues}
        />
      </div>
      <nav>
        <div data-group="left">
          <Button
            icon={paused ? PlayFilledAlt24 : PauseFilled24}
            iconDescription={`${paused ? 'Play' : 'Pause'} video`}
            kind="secondary"
            size="field"
            tooltipAlignment="start"
            tooltipPosition="bottom"
            on:click={togglePlayback}
          />
          <Button
            disabled={previousKeyTimesMS.length === 0}
            icon={PreviousFilled24}
            iconDescription={`Jump to ${previousKeyTimesMS.length === 1 ? 'beginning' : 'previous mark'}`}
            kind="secondary"
            size="field"
            tooltipAlignment="start"
            tooltipPosition="bottom"
            on:click={seekToPreviousKeyTimeMS}
          />
          <Button
            disabled={currentTimeMS - 10 < 0}
            icon={PreviousOutline24}
            iconDescription="Step back ten milliseconds"
            kind="secondary"
            size="field"
            tooltipAlignment="start"
            tooltipPosition="bottom"
            on:click={() => seekBy(-10)}
          />
        </div>
        <div data-group="right">
          <Button
            disabled={currentTimeMS + 10 > durationMS}
            icon={NextOutline24}
            iconDescription="Step forward ten milliseconds"
            kind="secondary"
            size="field"
            tooltipAlignment="end"
            tooltipPosition="bottom"
            on:click={() => seekBy(10)}
          />
          <Button
            disabled={nextKeyTimesMS.length === 0}
            icon={NextFilled24}
            iconDescription={`Jump to ${nextKeyTimesMS.length === 1 ? 'end' : 'next mark'}`}
            kind="secondary"
            size="field"
            tooltipAlignment="end"
            tooltipPosition="bottom"
            on:click={seekToNextKeyTimeMS}
          />
          {#if isCurrentTimeMSMarked}
            <Button
              icon={TrashCan24}
              iconDescription="Remove mark from current time"
              kind="danger"
              size="field"
              tooltipAlignment="end"
              tooltipPosition="bottom"
              on:click={removeCurrentTimeMS}
            />
          {:else}
            <Button
              icon={BookmarkAdd24}
              iconDescription="Add mark at current time"
              size="field"
              tooltipAlignment="end"
              tooltipPosition="bottom"
              on:click={addCurrentTimeMS}
            />
          {/if}
        </div>
        <div data-group="center">
          <pre>{`${formatMillisecondsAsSecondsAndMilliseconds(currentTimeMS)} / ${formatMillisecondsAsSecondsAndMilliseconds(durationMS)}`}</pre>
        </div>
      </nav>
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
        <Button icon={Hashtag24} kind="secondary" size="field" on:click={copyMarkers}>Copy Markers</Button>
        <Button icon={ImageCopy24} size="field" on:click={exportAssets}>Export Assets</Button>
      </footer>
    {/if}
  </aside>
</section>

<style>
  section {
    --range-handle: var(--primary);
    --range-handle-inactive: var(--primary);
    --range-handle-focus: var(--primary);
    --range-float-text: #000;
    --range-pip: #fff;
    --range-pip-text: #000;
    --range-slider: var(--tint);

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

  article > * {
    width: 100%;
  }

  .mounts-input {
    font-size: 1rem;
  }

  .mounts-input :global(.rangeSlider) {
    margin: 1.5rem 0;
    border-radius: 0;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    background-color: #f4f4f4;
  }

  nav > div {
    display: flex;
    justify-content: space-between;
    min-width: 8.5rem;
  }

  nav > div[data-group='center'] {
    flex-grow: 1;
    line-height: 2.5rem;
    text-align: center;
    justify-content: center;
  }

  @media (min-width: 60rem) {
    nav > div[data-group='left'] {
      order: 1;
    }

    nav > div[data-group='center'] {
      order: 2;
    }

    nav > div[data-group='right'] {
      order: 3;
    }
  }

  nav > div pre {
    margin: 0;
    text-align: center;
    font-family: monospace;
    font-size: 1.5rem;
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

  aside img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    vertical-align: bottom;
  }

  aside footer {
    margin-top: auto;
  }

  aside footer > :global(*) {
    width: 100%;
    max-width: none;
  }
</style>
