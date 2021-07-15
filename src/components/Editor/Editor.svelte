<script lang="ts">
  import AspectRatio from 'carbon-components-svelte/src/AspectRatio/AspectRatio.svelte';
  import Button from 'carbon-components-svelte/src/Button/Button.svelte';
  import Popover from 'carbon-components-svelte/src/Popover/Popover.svelte';
  import RadioButton from 'carbon-components-svelte/src/RadioButton/RadioButton.svelte';
  import RadioButtonGroup from 'carbon-components-svelte/src/RadioButtonGroup/RadioButtonGroup.svelte';
  import Toggle from 'carbon-components-svelte/src/Toggle/Toggle.svelte';
  import BookmarkAdd24 from 'carbon-icons-svelte/lib/BookmarkAdd24/BookmarkAdd24.svelte';
  import Hashtag24 from 'carbon-icons-svelte/lib/Hashtag24/Hashtag24.svelte';
  import ImageCopy24 from 'carbon-icons-svelte/lib/ImageCopy24/ImageCopy24.svelte';
  import NextFilled24 from 'carbon-icons-svelte/lib/NextFilled24/NextFilled24.svelte';
  import NextOutline24 from 'carbon-icons-svelte/lib/NextOutline24/NextOutline24.svelte';
  import PauseFilled24 from 'carbon-icons-svelte/lib/PauseFilled24/PauseFilled24.svelte';
  import PlayFilledAlt24 from 'carbon-icons-svelte/lib/PlayFilledAlt24/PlayFilledAlt24.svelte';
  import PreviousFilled24 from 'carbon-icons-svelte/lib/PreviousFilled24/PreviousFilled24.svelte';
  import PreviousOutline24 from 'carbon-icons-svelte/lib/PreviousOutline24/PreviousOutline24.svelte';
  import Settings24 from 'carbon-icons-svelte/lib/Settings24/Settings24.svelte';
  import TrashCan24 from 'carbon-icons-svelte/lib/TrashCan24/TrashCan24.svelte';
  import JSZip from 'jszip';
  import { saveAs } from 'file-saver';
  import { onMount } from 'svelte';
  import RangeSlider from 'svelte-range-slider-pips';
  import {
    comparatorNumericAscending,
    formatMillisecondsAsSecondsAndMilliseconds,
    isTouchEvent,
    millisecondsToSeconds,
    secondsToMilliseconds
  } from '../../utils';
  import type { RangeSliderChangeEvent, RangeSliderStopEvent, StillFrames, VideoDocument } from './constants';
  import { getVideoFile } from './utils';

  export let videoDocument: VideoDocument;
  export let isPortraitPreferred: boolean = false;

  const videoFile = getVideoFile(videoDocument, isPortraitPreferred);

  if (!videoFile) {
    throw new Error('Video document has no files');
  }

  let videoEl: HTMLVideoElement;
  let currentTime: number = 0;
  let duration: number = 0;
  let paused: boolean = true;
  let timesMS: number[] = [];
  let stillFrames: StillFrames = {};
  let isEditingPreferences: boolean = false;
  let insetPreference: string = 'none';
  let isBackgroundPreferenceEnabled: boolean = false;
  let backgroundPreference: string = '#666666';

  $: figureStyles = isBackgroundPreferenceEnabled ? `background: ${backgroundPreference};` : undefined;
  $: currentTimeMS = secondsToMilliseconds(currentTime);
  $: durationMS = secondsToMilliseconds(duration);
  $: isCurrentTimeMSMarked = timesMS.includes(currentTimeMS);
  $: keyTimesMS = [0, ...timesMS.filter(timeMS => timeMS !== 0), durationMS];
  $: previousKeyTimesMS = keyTimesMS.filter(timeMS => timeMS < currentTimeMS);
  $: nextKeyTimesMS = keyTimesMS.filter(timeMS => timeMS > currentTimeMS);
  $: articleLines = [
    `#easeframe${videoDocument.id}${insetPreference === 'none' ? '' : `INSET${insetPreference}`}${
      isBackgroundPreferenceEnabled ? `BACKGROUND${backgroundPreference.replace('#', '')}` : ''
    }`,
    ...timesMS.map(timeMS => `#markTIME${timeMS}`),
    `#endeaseframe`
  ];
  $: (async () => {
    // No need to go further if:
    //   a) we don't have a video, or
    //   b) our stillFrames keys match our timesMS values
    if (
      !videoEl ||
      Object.keys(stillFrames)
        .map(x => +x)
        .sort(comparatorNumericAscending)
        .join() === timesMS.join()
    ) {
      return;
    }

    // This strategy won't work once we 'load' projects, but suffices
    // for snapping the current 'missing' frames as we add them.
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { videoWidth, videoHeight } = videoEl;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const nextStillFrames: StillFrames = {
      ...stillFrames
    };

    timesMSIterator: for (let timeMS of timesMS) {
      if (!nextStillFrames[timeMS] && ctx !== null) {
        await new Promise<void>(resolve =>
          setTimeout(
            async () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(videoEl, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);

              const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(blob => resolve(blob), 'image/png'));

              if (blob !== null) {
                nextStillFrames[timeMS] = blob;
              }

              resolve();
            },
            paused ? 100 : 0 // When dragging a handle to a potentially un-buffered frame, wait a bit
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

    stillFrames = nextStillFrames;
  })();

  const togglePlayback = () => videoEl[paused ? 'play' : 'pause']();
  const addCurrentTimeMS = () => (timesMS = [...timesMS, currentTimeMS].sort(comparatorNumericAscending));
  const removeCurrentTimeMS = () => (timesMS = timesMS.filter(timeMS => timeMS !== currentTimeMS));
  const updateVideoCurrentTimeToHandleValue = (event: RangeSliderChangeEvent) => {
    const { value } = event.detail;

    if (currentTime !== value) {
      currentTime = value / 1000;
    }
  };
  const updateTimesMSToHandlesValues = (event: RangeSliderStopEvent) => {
    const { startValue, value, values } = event.detail;

    if (startValue !== value) {
      timesMS = [...new Set(values)].sort(comparatorNumericAscending);
    }
  };
  const pauseIfPlaying = () => !paused && videoEl.pause();
  const jumpToPreviousKeyTimeMS = () => {
    pauseIfPlaying();
    videoEl.currentTime = millisecondsToSeconds(Math.max(...previousKeyTimesMS));
  };
  const jumpToNextKeyTimeMS = () => {
    pauseIfPlaying();
    videoEl.currentTime = millisecondsToSeconds(Math.min(...nextKeyTimesMS));
  };
  const stepCurrentTime = (diff: number) => {
    pauseIfPlaying();
    videoEl.currentTime = millisecondsToSeconds(Math.round((currentTimeMS + diff) / 10) * 10);
  };

  let isAcceptingPointerMovement = false;

  function handleVideoPointerDown(event: MouseEvent | TouchEvent) {
    pauseIfPlaying();

    const pointerLiftEventName = isTouchEvent(event) ? 'touchend' : 'mouseup';
    const pointerAbortEventName = isTouchEvent(event) ? 'touchcancel' : 'mouseleave';

    function stop(event: MouseEvent | TouchEvent) {
      if (event) {
        handleVideoPointerMove(event);
      }

      isAcceptingPointerMovement = false;

      document.removeEventListener(pointerLiftEventName, stop);
      document.addEventListener(pointerAbortEventName, stop);
    }

    isAcceptingPointerMovement = true;
    document.addEventListener(pointerLiftEventName, stop);
    document.addEventListener(pointerAbortEventName, stop);
    handleVideoPointerMove(event);
  }

  function handleVideoPointerMove(event: MouseEvent | TouchEvent) {
    if (!isAcceptingPointerMovement || event.type === 'touchend' || event.type === 'touchcancel') {
      return;
    }

    const { left, right } = videoEl.getBoundingClientRect();
    const { clientX } = isTouchEvent(event) ? event.touches[0] : event;

    currentTime = (duration * (clientX - left)) / (right - left);
  }

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

  onMount(() => {
    videoEl.load();
  });
</script>

<section>
  <article>
    <figure
      style={figureStyles}
      on:mousedown={handleVideoPointerDown}
      on:touchstart={handleVideoPointerDown}
      on:mousemove={handleVideoPointerMove}
      on:touchmove={handleVideoPointerMove}
    >
      <AspectRatio ratio="4x3">
        <video
          bind:this={videoEl}
          bind:currentTime
          bind:duration
          bind:paused
          crossorigin="anonymous"
          muted
          playsinline
          preload="auto"
          src={videoFile.url}
        />
      </AspectRatio>
      <progress value={currentTime / duration || 0} />
    </figure>
    {#if durationMS > 0}
      <div class="mounts-input">
        <RangeSlider
          min={0}
          max={durationMS}
          step={1}
          handleFormatter={formatMillisecondsAsSecondsAndMilliseconds}
          springValues={{ stiffness: 1, damping: 1 }}
          values={timesMS}
          on:start={pauseIfPlaying}
          on:change={updateVideoCurrentTimeToHandleValue}
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
            tooltipPosition="top"
            on:click={togglePlayback}
          />
          <Button
            disabled={previousKeyTimesMS.length === 0}
            icon={PreviousFilled24}
            iconDescription={`Jump to ${previousKeyTimesMS.length === 1 ? 'beginning' : 'previous mark'}`}
            kind="secondary"
            size="field"
            tooltipAlignment="start"
            tooltipPosition="top"
            on:click={jumpToPreviousKeyTimeMS}
          />
          <Button
            disabled={currentTimeMS - 10 < 0}
            icon={PreviousOutline24}
            iconDescription="Step back ten milliseconds"
            kind="secondary"
            size="field"
            tooltipAlignment="start"
            tooltipPosition="top"
            on:click={() => stepCurrentTime(-10)}
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
            tooltipPosition="top"
            on:click={() => stepCurrentTime(10)}
          />
          <Button
            disabled={nextKeyTimesMS.length === 0}
            icon={NextFilled24}
            iconDescription={`Jump to ${nextKeyTimesMS.length === 1 ? 'end' : 'next mark'}`}
            kind="secondary"
            size="field"
            tooltipAlignment="end"
            tooltipPosition="top"
            on:click={jumpToNextKeyTimeMS}
          />
          {#if isCurrentTimeMSMarked}
            <Button
              icon={TrashCan24}
              iconDescription="Remove mark from current time"
              kind="danger"
              size="field"
              tooltipAlignment="end"
              tooltipPosition="top"
              on:click={removeCurrentTimeMS}
            />
          {:else}
            <Button
              icon={BookmarkAdd24}
              iconDescription="Add mark at current time"
              size="field"
              tooltipAlignment="end"
              tooltipPosition="top"
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
      <div class="settings">
        <Button
          icon={Settings24}
          iconDescription={`Change properties`}
          kind="secondary"
          size="field"
          tooltipAlignment="end"
          tooltipPosition="left"
          on:click={() => (isEditingPreferences = !isEditingPreferences)}
        />
        <Popover bind:open={isEditingPreferences} align="bottom-right" closeOnOutsideClick light relative>
          <div class="popover">
            <RadioButtonGroup bind:selected={insetPreference} legendText="Video position" orientation="vertical">
              <RadioButton labelText="Full cover" value="none" />
              <RadioButton labelText="Inset left" value="left" />
              <RadioButton labelText="Inset center" value="center" />
              <RadioButton labelText="Inset right" value="right" />
            </RadioButtonGroup>
            <br />
            <input type="color" bind:value={backgroundPreference} disabled={!isBackgroundPreferenceEnabled} />
            <Toggle bind:toggled={isBackgroundPreferenceEnabled} labelText="Inset video background colour" size="sm" />
          </div>
        </Popover>
      </div>
    </div>
    {#each Object.keys(stillFrames) as timeMS, index}
      <div>
        <pre>{articleLines[index + 1]}</pre>
        <figure style={figureStyles} on:click={() => (currentTime = millisecondsToSeconds(+timeMS))}>
          <AspectRatio ratio="4x3">
            <img src={URL.createObjectURL(stillFrames[timeMS])} alt={`A still image of the video at ${timeMS}ms`} />
          </AspectRatio>
        </figure>
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
    --figure-gradient: repeating-linear-gradient(-45deg, #c6c6c6, #c6c6c6 0.25rem, #8d8d8d 0.25rem, #8d8d8d 0.5rem);
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

  article figure {
    position: relative;
    overflow: hidden;
    margin: 0 0 1rem;
    background-image: var(--figure-gradient);
    touch-action: none;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    vertical-align: bottom;
    cursor: ew-resize;
  }

  progress {
    position: absolute;
    bottom: 0;
    left: 0;
    display: block;
    width: 100%;
    height: 0.5rem;
    -webkit-appearance: none;
    appearance: none;
    pointer-events: none;
    transition: opacity 0.25s;
  }

  progress::-webkit-progress-bar {
    background-color: rgba(0, 0, 0, 0.2);
    vertical-align: bottom;
  }

  progress::-webkit-progress-value {
    background-color: rgba(255, 255, 255, 0.6);
    vertical-align: bottom;
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
    width: 100%;
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

  aside .settings {
    position: relative;
    margin-right: 0.75rem;
  }

  .popover {
    padding: 0.75rem 0.75rem 1rem;
    width: 15rem;
  }

  .popover input[type='color'] {
    transform: translate(0, 1.625rem);
    position: absolute;
    left: 6rem;
  }

  .popover input[type='color'][disabled] {
    opacity: 0.5;
  }

  aside figure {
    margin: 0;
    width: 5.334rem;
    background-image: var(--figure-gradient);
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
