<script lang="ts">
  import AspectRatio from 'carbon-components-svelte/src/AspectRatio/AspectRatio.svelte';
  import { default as preferences } from '../../stores/preferences';
  import { resolveHexColor } from '../../utils';

  export let ratio: '2x1' | '16x9' | '4x3' | '1x1' | '3x4' | '3x2' | '9x16' | '1x2' = '4x3';

  $: figureStyles = $preferences.background ? `background: ${resolveHexColor($preferences.background)};` : undefined;
</script>

<figure style={figureStyles}>
  <AspectRatio {ratio}>
    <slot />
  </AspectRatio>
</figure>

<style>
  figure {
    position: relative;
    overflow: hidden;
    margin: 0 0 1rem;
    background-image: repeating-linear-gradient(-45deg, #c6c6c6, #c6c6c6 0.25rem, #8d8d8d 0.25rem, #8d8d8d 0.5rem);
    touch-action: none;
  }

  figure :global(img),
  figure :global(video) {
    width: 100%;
    height: 100%;
    object-fit: contain;
    vertical-align: bottom;
  }
</style>
