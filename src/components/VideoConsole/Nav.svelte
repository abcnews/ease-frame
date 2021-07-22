<script lang="ts">
  import Button from 'carbon-components-svelte/src/Button/Button.svelte';
  import BookmarkAdd24 from 'carbon-icons-svelte/lib/BookmarkAdd24/BookmarkAdd24.svelte';
  import NextFilled24 from 'carbon-icons-svelte/lib/NextFilled24/NextFilled24.svelte';
  import NextOutline24 from 'carbon-icons-svelte/lib/NextOutline24/NextOutline24.svelte';
  import PauseFilled24 from 'carbon-icons-svelte/lib/PauseFilled24/PauseFilled24.svelte';
  import PlayFilledAlt24 from 'carbon-icons-svelte/lib/PlayFilledAlt24/PlayFilledAlt24.svelte';
  import PreviousFilled24 from 'carbon-icons-svelte/lib/PreviousFilled24/PreviousFilled24.svelte';
  import PreviousOutline24 from 'carbon-icons-svelte/lib/PreviousOutline24/PreviousOutline24.svelte';
  import TrashCan24 from 'carbon-icons-svelte/lib/TrashCan24/TrashCan24.svelte';
  import { formatMillisecondsAsSecondsAndMilliseconds, sortedNumericAscending } from '../../utils';
  import type VideoConsole from '../VideoConsole/VideoConsole.svelte';

  export let currentTimeMS: number;
  export let durationMS: number;
  export let timesMS: number[];
  export let paused: HTMLVideoElement['paused'];
  export let seek: VideoConsole['seek'];
  export let togglePlayback: () => void | Promise<void>;

  $: isCurrentTimeMSMarked = timesMS.includes(currentTimeMS);
  $: keyTimesMS = [0, ...timesMS.filter(timeMS => timeMS !== 0), durationMS];
  $: previousKeyTimesMS = keyTimesMS.filter(timeMS => timeMS < currentTimeMS);
  $: nextKeyTimesMS = keyTimesMS.filter(timeMS => timeMS > currentTimeMS);

  const addCurrentTimeMS = () => (timesMS = sortedNumericAscending([...timesMS, currentTimeMS]));
  const removeCurrentTimeMS = () => (timesMS = timesMS.filter(timeMS => timeMS !== currentTimeMS));
  const seekToPreviousKeyTimeMS = () => seek(Math.max(...previousKeyTimesMS));
  const seekToNextKeyTimeMS = () => seek(Math.min(...nextKeyTimesMS));
  const seekBy = (diffMS: number) => seek(Math.round((currentTimeMS + diffMS) / 10) * 10);
</script>

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
        iconDescription="Remove mark at current time"
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

<style>
  nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    background-color: var(--tint);
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
</style>
