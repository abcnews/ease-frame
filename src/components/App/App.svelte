<script lang="ts">
  import { fetchOne } from '@abcnews/terminus-fetch';
  import url2cmid from '@abcnews/url2cmid';
  import Button from 'carbon-components-svelte/src/Button/Button.svelte';
  import Form from 'carbon-components-svelte/src/Form/Form.svelte';
  import TextInput from 'carbon-components-svelte/src/TextInput/TextInput.svelte';
  import DocumentVideo24 from 'carbon-icons-svelte/lib/DocumentVideo24/DocumentVideo24.svelte';
  import Editor from '../Editor/Editor.svelte';
  import type { VideoDocument } from '../Editor/constants';

  let textInputValue: string = '';
  let videoDocument: VideoDocument | null = null;
  let isFetching: boolean = false;
  let errorMessage: string | null = null;

  const isVideoDocument = (terminusDocument: {}): terminusDocument is VideoDocument =>
    'docType' in terminusDocument && terminusDocument['docType'] === 'Video';

  const isNumericString = (value: string) => String(parseInt(value, 10)) === value;

  const loadVideoDocument = () => {
    const id = isNumericString(textInputValue) ? textInputValue : url2cmid(textInputValue);

    if (!id) {
      errorMessage = `Couldn't parse a Core Media document ID`;

      return;
    }

    isFetching = true;

    fetchOne({ id, type: 'video' })
      .then(terminusDocument => {
        isFetching = false;

        if (!isVideoDocument(terminusDocument)) {
          errorMessage = `Core Media document isn't a Video`;

          return;
        }

        videoDocument = terminusDocument;
      })
      .catch(_error => {
        isFetching = false;

        errorMessage = `Couldn't fetch Core Media document`;
      });
  };

  const clearError = () => (errorMessage = null);
</script>

<main>
  <header>
    <h1>Ease Frame</h1>
  </header>
  {#if videoDocument}
    <Editor {videoDocument} />
  {:else}
    <section>
      <Form on:submit={loadVideoDocument}>
        <TextInput
          labelText="Video document URL / ID"
          disabled={isFetching}
          invalid={errorMessage !== null}
          invalidText={errorMessage || undefined}
          bind:value={textInputValue}
          on:keydown={clearError}
          on:focus={clearError}
        />
        <Button type="submit" disabled={isFetching} icon={DocumentVideo24} size="field">Load video</Button>
      </Form>
    </section>
  {/if}
</main>

<style>
  main {
    --primary: #0f62fe;
    --tint: #f4f4f4;
  }

  main {
    margin: auto;
    max-width: 80rem;
  }

  header {
    margin: 1rem auto;
  }

  h1 {
    font-size: 1.75rem;
    text-align: center;
  }

  section :global(form) {
    margin: 20vh auto 0;
    padding: 0 1rem;
    width: 100%;
    min-height: 6rem;
    max-width: 60rem;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  section :global(form) > :global(*) {
    width: 100%;
    max-width: none;
  }

  section :global(form) > :global(:last-child) {
    margin-top: 1.5rem;
  }

  @media (min-width: 60rem) {
    section :global(form) > :global(:first-child) {
      margin-right: 1rem;
      width: calc(80% - 1rem);
    }

    section :global(form) > :global(:last-child) {
      width: 20%;
    }
  }
</style>
