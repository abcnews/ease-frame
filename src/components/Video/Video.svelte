<script lang="ts">
  import { onMount } from 'svelte';
  import Figure from '../Figure/Figure.svelte';
  import { isTouchEvent, millisecondsToSeconds } from '../../utils';

  export let src: string;
  export let currentTime: number;
  export let duration: number;
  export let paused: boolean;

  export const seek = (timeMS: number, shouldPlaybackContinue: boolean = false) => {
    if (!shouldPlaybackContinue) {
      pauseIfPlaying();
    }

    currentTime = millisecondsToSeconds(timeMS);
  };
  export const togglePlayback = () => videoEl[paused ? 'play' : 'pause']();

  const pauseIfPlaying = () => !paused && videoEl.pause();

  let videoEl: HTMLVideoElement;
  let isAcceptingPointerMovement: boolean = false;

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

  onMount(() => {
    videoEl.load();

    ['disablePictureInPicture', 'disableRemotePlayback'].forEach(experimentalProp => {
      if (experimentalProp in videoEl) {
        videoEl[experimentalProp] = true;
      }
    });
  });
</script>

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
    {src}
    on:mousedown={handleVideoPointerDown}
    on:touchstart={handleVideoPointerDown}
    on:mousemove={handleVideoPointerMove}
    on:touchmove={handleVideoPointerMove}
  />
</Figure>

<style>
  video {
    cursor: ew-resize;
  }
</style>
