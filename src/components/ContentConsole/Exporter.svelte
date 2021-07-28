<script lang="ts">
  import Button from 'carbon-components-svelte/src/Button/Button.svelte';
  import CopyLink24 from 'carbon-icons-svelte/lib/CopyLink24/CopyLink24.svelte';
  import Hashtag24 from 'carbon-icons-svelte/lib/Hashtag24/Hashtag24.svelte';
  import ImageCopy24 from 'carbon-icons-svelte/lib/ImageCopy24/ImageCopy24.svelte';
  import JSZip from 'jszip';
  import { saveAs } from 'file-saver';
  import type { StillFrames, VideoDocument } from '../../constants';
  import { default as preferences } from '../../stores/preferences';
  import { areAllTimesMSInStillFrames, onlyStringProps } from '../../utils';

  export let articleLines: string[];
  export let videoDocument: VideoDocument;
  export let timesMS: number[];
  export let stillFrames: StillFrames;

  $: shareURL = `${String(window.location.href).split('?')[0]}?${new URLSearchParams(
    onlyStringProps({
      v: videoDocument._reference,
      t: Object.keys(stillFrames).join('-'),
      b: $preferences.background,
      i: $preferences.inset,
      o: $preferences.orientation
    })
  ).toString()}`;

  const copyShareURL = () => navigator.clipboard.writeText(shareURL);
  const copyMarkers = () => navigator.clipboard.writeText(articleLines.join('\n\n'));
  const exportAssets = async () => {
    const zip = new JSZip();
    const numDurationMSChars = String(timesMS[timesMS.length - 1]).length;
    const name = `ease-frame-${videoDocument._reference}`;

    // Images
    timesMS.forEach(timeMS => {
      zip.file(`${name}-image-${String(timeMS).padStart(numDurationMSChars, '0')}.jpg`, stillFrames[timeMS]);
    });

    // Text
    zip.file(`${name}-text.txt`, articleLines.join('\n\n'));

    // Archive
    const zipFile = await zip.generateAsync({ type: 'blob' });

    saveAs(zipFile, `${name}.zip`);
  };
</script>

<div>
  <Button icon={CopyLink24} kind="secondary" size="field" on:click={copyShareURL}>Share link to project</Button>
  <Button icon={Hashtag24} kind="secondary" size="field" on:click={copyMarkers}>Copy Markers</Button>
  <Button
    icon={ImageCopy24}
    size="field"
    disabled={!areAllTimesMSInStillFrames(timesMS, stillFrames)}
    on:click={exportAssets}>Export Assets</Button
  >
</div>

<style>
  div > :global(*) {
    width: 100%;
    max-width: none;
  }
</style>
