<script lang="ts">
  import { fetchOne } from '@abcnews/terminus-fetch';
  import Button from 'carbon-components-svelte/src/Button/Button.svelte';
  import Form from 'carbon-components-svelte/src/Form/Form.svelte';
  import TextInput from 'carbon-components-svelte/src/TextInput/TextInput.svelte';
  import DocumentVideo24 from 'carbon-icons-svelte/lib/DocumentVideo24/DocumentVideo24.svelte';
  import { get } from 'svelte/store';
  import { getInfo } from 'ytdl-core';
  import {
    TerminusVideoDocument,
    VideoLibrary,
    YouTubeVideoDocument,
    YOUTUBE_WATCH_URL_PREFIX,
    YTDL_OPTIONS
  } from '../../constants';
  import type { ImportedProject, VideoDocument } from '../../constants';
  import { default as preferences } from '../../stores/preferences';
  import { encodeYouTubeID, getVideoFile, getVideoLocation } from '../../utils';
  import Editor from '../Editor/Editor.svelte';

  export let importedProject: ImportedProject | undefined;

  let clue: string = importedProject
    ? importedProject.videoReference
    : process.env.EASE_FRAME_DEBUG_VIDEO_REFERENCE || '';
  let videoDocument: VideoDocument | null = null;
  let isFetching: boolean = false;
  let errorMessage: string | null = null;

  const isVideoDocument = (terminusDocument: {}): terminusDocument is TerminusVideoDocument =>
    'docType' in terminusDocument && terminusDocument['docType'] === 'Video';

  const fail = (reason: string) => {
    errorMessage = `${importedProject ? `Import failed. ` : ''}${reason}`;

    if (importedProject) {
      importedProject = undefined;
    }
  };

  const loadVideoConfig = () => {
    const videoLocation = getVideoLocation(clue);

    if (!videoLocation) {
      return fail(`Couldn't locate video based on information provided`);
    }

    isFetching = true;

    switch (videoLocation.library) {
      case VideoLibrary.TERMINUS:
        fetchOne({ id: videoLocation.id, type: 'video' })
          .then(terminusDocument => {
            isFetching = false;

            if (!isVideoDocument(terminusDocument)) {
              return fail(`Core Media document isn't a Video`);
            }

            const _videoDocument = {
              ...terminusDocument,
              _library: VideoLibrary.TERMINUS,
              _reference: terminusDocument.id
            };

            if (
              !getVideoFile(
                _videoDocument,
                (importedProject && importedProject.orientation) || get(preferences).orientation
              )
            ) {
              return fail(`Video has no associated files`);
            }

            videoDocument = _videoDocument;

            if (importedProject) {
              preferences.import(importedProject);
            }
          })
          .catch(_error => {
            isFetching = false;

            return fail(`Couldn't fetch Terminus video document`);
          });
        break;
      case VideoLibrary.YOUTUBE:
        getInfo(`${YOUTUBE_WATCH_URL_PREFIX}${videoLocation.id}`, YTDL_OPTIONS)
          .then(videoInfo => {
            isFetching = false;

            videoDocument = {
              ...(videoInfo as YouTubeVideoDocument),
              _library: VideoLibrary.YOUTUBE,
              _reference: encodeYouTubeID(videoInfo.videoDetails.videoId)
            };

            if (importedProject) {
              preferences.import(importedProject);
            }
          })
          .catch(_error => {
            isFetching = false;

            return fail(`Couldn't fetch YouTube video document`);
          });
        break;
      default:
        break;
    }
  };

  const clearError = () => (errorMessage = null);
</script>

{#if videoDocument}
  <Editor {importedProject} {videoDocument} />
{:else}
  <section>
    <Form on:submit={loadVideoConfig}>
      <TextInput
        labelText="Video URL / ID"
        disabled={isFetching}
        invalid={errorMessage !== null}
        invalidText={errorMessage || undefined}
        bind:value={clue}
        on:keydown={clearError}
        on:focus={clearError}
      />
      <Button type="submit" disabled={isFetching} icon={DocumentVideo24} size="field"
        >{`${importedProject ? 'Import' : 'Create'} project`}</Button
      >
    </Form>
  </section>
{/if}

<style>
  section :global(form) {
    margin: 20vh auto 0;
    padding: 0 1rem;
    width: 100%;
    min-height: 6rem;
    max-width: 32rem;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  section :global(form) > :global(*) {
    width: 100%;
    max-width: none;
  }

  section :global(form) > :global(button) {
    margin-top: 1rem;
  }
</style>
