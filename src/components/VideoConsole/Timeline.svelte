<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips';
  import { formatMillisecondsAsSecondsAndMilliseconds, sortedNumericAscending } from '../../utils';
  import type VideoConsole from '../VideoConsole/VideoConsole.svelte';

  interface RangeSliderEvent extends CustomEvent {
    detail: {
      value: number;
      values: number[];
    };
  }

  export let currentTimeMS: number;
  export let durationMS: number;
  export let timesMS: number[];
  export let seek: VideoConsole['seek'];

  const seekToHandleValue = (event: RangeSliderEvent) => seek(event.detail.value);
  const updateTimesMSToHandlesValues = (event: RangeSliderEvent) =>
    (timesMS = sortedNumericAscending(new Set(event.detail.values)));
</script>

<div>
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
  <progress value={currentTimeMS / durationMS || 0} />
</div>

<style>
  div {
    --range-handle: var(--primary);
    --range-handle-inactive: var(--primary);
    --range-handle-focus: var(--primary);
    --range-float-text: #000;
    --range-pip: #fff;
    --range-pip-text: #000;
    --range-slider: var(--tint);

    position: relative;
    margin: 1.5rem 0;
    font-size: 1rem;
  }

  div :global(.rangeSlider) {
    margin: 0;
    border-radius: 0;
  }

  progress {
    position: absolute;
    bottom: 0;
    left: 0;
    display: block;
    border: 0;
    width: 100%;
    height: 100%;
    -webkit-appearance: none;
    appearance: none;
    pointer-events: none;
    transition: opacity 0.25s;
  }

  progress::-webkit-progress-bar {
    background-color: transparent;
  }

  progress::-moz-progress-bar {
    background-color: var(--primary);
  }

  progress::-webkit-progress-value {
    background-color: var(--primary);
  }
</style>
