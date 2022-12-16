<script lang="ts">
  import { fetchOne } from '@abcnews/terminus-fetch';
  import url2cmid from '@abcnews/url2cmid';
  import Button from 'carbon-components-svelte/src/Button/Button.svelte';
  import Form from 'carbon-components-svelte/src/Form/Form.svelte';
  import TextInput from 'carbon-components-svelte/src/TextInput/TextInput.svelte';
  import DocumentVideo24 from 'carbon-icons-svelte/lib/DocumentVideo24/DocumentVideo24.svelte';
  import { get } from 'svelte/store';
  import type { ImportedProject, VideoDocument } from '../../constants';
  import { default as preferences } from '../../stores/preferences';
  import { getVideoFile } from '../../utils';
  import Editor from '../Editor/Editor.svelte';
  import RecentProjects from '../RecentProjects/RecentProjects.svelte';

  export let importedProject: ImportedProject | undefined;

  let videoReference: string = importedProject
    ? importedProject.videoReference
    : process.env.EASE_FRAME_DEBUG_VIDEO_REFERENCE || '';
  let videoDocument: VideoDocument | null = null;
  let isFetching: boolean = false;
  let errorMessage: string | null = null;

  const isVideoDocument = (terminusDocument: {}): terminusDocument is VideoDocument =>
    'docType' in terminusDocument && terminusDocument['docType'] === 'Video';

  const isNumericString = (value: string) => String(parseInt(value, 10)) === value;

  const fail = (reason: string) => {
    errorMessage = `${importedProject ? `Import failed. ` : ''}${reason}`;

    if (importedProject) {
      importedProject = undefined;
    }
  };

  const loadVideoDocument = () => {
    const id = isNumericString(videoReference) ? videoReference : url2cmid(videoReference);

    if (!id) {
      return fail(`Couldn't parse a Core Media document ID`);
    }

    isFetching = true;

    fetchOne({ id, type: 'video' })
      .then(terminusDocument => {
        isFetching = false;

        if (!isVideoDocument(terminusDocument)) {
          return fail(`Core Media document isn't a Video`);
        }

        if (
          !getVideoFile(
            terminusDocument,
            (importedProject && importedProject.orientation) || get(preferences).orientation
          )
        ) {
          return fail(`Video has no associated files`);
        }

        videoDocument = terminusDocument;

        if (importedProject) {
          preferences.import(importedProject);
        }
      })
      .catch(_error => {
        isFetching = false;

        return fail(`Couldn't fetch Core Media document`);
      });
  };

  const clearError = () => (errorMessage = null);
</script>

{#if videoDocument}
  <Editor {importedProject} {videoDocument} />
{:else}
  <section>
    <Form on:submit={loadVideoDocument}>
      <TextInput
        labelText="Video document URL / ID"
        disabled={isFetching}
        invalid={errorMessage !== null}
        invalidText={errorMessage || undefined}
        bind:value={videoReference}
        on:keydown={clearError}
        on:focus={clearError}
      />
      <div class="recent">
        <RecentProjects />
      </div>
      <Button type="submit" disabled={isFetching} icon={DocumentVideo24} size="field"
        >{`${importedProject ? 'Import' : 'Create'} project`}</Button
      >
    </Form>
  </section>
{/if}

<style>
  section :global(form) {
    position: relative;
    margin: 20vh auto 0;
    padding: 0 1rem;
    width: 100%;
    min-height: 6rem;
    max-width: 32rem;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .recent {
    position: absolute;
    top: 1.75rem;
    right: 1.25rem;
    width: 2rem;
    text-align: right;
  }

  section :global(form) > :global(*) {
    width: 100%;
    max-width: none;
  }

  section :global(form) > :global(button) {
    margin-top: 1rem;
  }
</style>
