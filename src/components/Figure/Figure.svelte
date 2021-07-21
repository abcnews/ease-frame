<script lang="ts">
  import AspectRatio from 'carbon-components-svelte/src/AspectRatio/AspectRatio.svelte';
  import { default as preferences } from '../Preferences/store';

  $: figureStyles = $preferences.background ? `background: ${$preferences.background};` : undefined;
</script>

<figure style={figureStyles}>
  <AspectRatio ratio="4x3">
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
