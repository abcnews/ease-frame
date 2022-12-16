<script lang="ts">
  import Button from 'carbon-components-svelte/src/Button/Button.svelte';
  import Popover from 'carbon-components-svelte/src/Popover/Popover.svelte';
  import Close24 from 'carbon-icons-svelte/lib/Close24/Close24.svelte';
  import Time24 from 'carbon-icons-svelte/lib/Time24/Time24.svelte';
  import projects, { getImportURL } from '../../stores/projects';

  let open: boolean;

  $: items = Object.keys($projects)
    .map(id => ({
      id,
      updatedAt: $projects[id].updatedAt
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
</script>

{#if items.length > 0}
  <div>
    <Button
      icon={open ? Close24 : Time24}
      iconDescription={`Recent projects`}
      kind="secondary"
      size="small"
      tooltipAlignment="end"
      tooltipPosition="top"
      on:click={() => (open = !open)}
    />
    <Popover bind:open align="bottom-right" closeOnOutsideClick light relative>
      <menu>
        {#each items as { id, updatedAt }}
          {@const date = new Date(updatedAt)}
          <li>
            <a href={getImportURL(id)}
              >{id} ({date.toLocaleTimeString('en-au', {
                timeStyle: 'short'
              })}
              {date.toLocaleDateString('en-au')})</a
            >
          </li>
        {/each}
      </menu>
    </Popover>
  </div>
{/if}

<style>
  menu {
    margin: 0;
    padding: 0.25rem;
    text-align: left;
  }

  li {
    display: block;
    padding: 0;
  }

  li + li {
    margin-top: 0.25rem;
  }

  a {
    display: block;
    padding: 0.5rem;
    color: inherit;
    text-decoration: none;
  }

  a:hover {
    background-color: #eee;
  }
</style>
