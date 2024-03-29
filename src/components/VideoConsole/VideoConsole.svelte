<script lang="ts">
  import { beforeUpdate, onMount, tick } from 'svelte';
  import { isTouchEvent, secondsToMilliseconds, millisecondsToSeconds } from '../../utils';
  import type { VideoFile } from '../../constants';
  import Figure from '../Figure/Figure.svelte';
  import Nav from './Nav.svelte';
  import Timeline from './Timeline.svelte';

  export let timesMS: number[];
  export let videoFile: VideoFile;

  let videoEl: HTMLVideoElement;
  let currentTime: HTMLVideoElement['currentTime'];
  let duration: HTMLVideoElement['duration'];
  let paused: HTMLVideoElement['paused'];
  let isAcceptingPointerMovement: boolean = false;

  export const seek = (timeMS: number, shouldPlaybackContinue: boolean = false) => {
    if (!shouldPlaybackContinue) {
      pauseIfPlaying();
    }

    currentTime = millisecondsToSeconds(timeMS);
  };

  $: currentTimeMS = secondsToMilliseconds(currentTime || 0);
  $: durationMS = secondsToMilliseconds(duration || 0);

  $: if (durationMS > 0 && timesMS.some(timeMS => timeMS > durationMS)) {
    timesMS = timesMS.filter(timeMS => timeMS <= durationMS);
    console.debug('Removed marks that occur beyond video duration');
  }

  const pauseIfPlaying = () => !paused && videoEl.pause();
  const togglePlayback = () => videoEl[paused ? 'play' : 'pause']();
  const handleVideoPointerDown = (event: MouseEvent | TouchEvent) => {
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
  };
  const handleVideoPointerMove = (event: MouseEvent | TouchEvent) => {
    if (!isAcceptingPointerMovement || event.type === 'touchend' || event.type === 'touchcancel') {
      return;
    }

    const { left, right } = videoEl.getBoundingClientRect();
    const { clientX } = isTouchEvent(event) ? event.touches[0] : event;

    currentTime = (duration * (clientX - left)) / (right - left);
  };

  onMount(() => {
    ['disablePictureInPicture', 'disableRemotePlayback'].forEach(experimentalProp => {
      if (experimentalProp in videoEl) {
        videoEl[experimentalProp] = true;
      }
    });
  });

  let lastVideoFile: VideoFile;

  beforeUpdate(async () => {
    if (lastVideoFile !== videoFile) {
      paused = true;
      lastVideoFile = videoFile;
      await tick();
      videoEl.load();
    }
  });
</script>

<div>
  <Figure>
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
      on:mousedown={handleVideoPointerDown}
      on:touchstart|passive={handleVideoPointerDown}
      on:mousemove={handleVideoPointerMove}
      on:touchmove|passive={handleVideoPointerMove}
    />
  </Figure>
  {#if durationMS > 0}
    <Timeline bind:timesMS {currentTimeMS} {durationMS} {seek} />
    <Nav bind:timesMS {currentTimeMS} {durationMS} {seek} {togglePlayback} {paused} />
  {/if}
</div>

<style>
  video {
    cursor: ew-resize;
  }
</style>
