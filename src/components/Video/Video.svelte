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
  <div
    on:mousedown={handleVideoPointerDown}
    on:touchstart={handleVideoPointerDown}
    on:mousemove={handleVideoPointerMove}
    on:touchmove={handleVideoPointerMove}
  >
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
    />
    <progress value={currentTime / duration || 0} />
  </div>
</Figure>

<style lang="scss">
  div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
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
</style>
