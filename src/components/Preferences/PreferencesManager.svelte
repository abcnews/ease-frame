<script lang="ts">
  import Breakpoint from 'carbon-components-svelte/src/Breakpoint/Breakpoint.svelte';
  import type { BreakpointSize } from 'carbon-components-svelte/types/Breakpoint/Breakpoint';
  import Button from 'carbon-components-svelte/src/Button/Button.svelte';
  import Popover from 'carbon-components-svelte/src/Popover/Popover.svelte';
  import RadioButton from 'carbon-components-svelte/src/RadioButton/RadioButton.svelte';
  import RadioButtonGroup from 'carbon-components-svelte/src/RadioButtonGroup/RadioButtonGroup.svelte';
  import Toggle from 'carbon-components-svelte/src/Toggle/Toggle.svelte';
  import Settings24 from 'carbon-icons-svelte/lib/Settings24/Settings24.svelte';
  import { get } from 'svelte/store';
  import { default as preferences } from '../../stores/preferences';
  import { resolveHexColor } from '../../utils';

  let size: BreakpointSize;
  let open: boolean;
  let color: string = get(preferences).background || '393939';

  $: shouldPopoverOpenAboveButton = size === 'sm' || size === 'md';
  $: console.log({ shouldPopoverOpenAboveButton });
</script>

<Breakpoint bind:size />

<div>
  <Button
    icon={Settings24}
    iconDescription={`Change preferences`}
    kind="secondary"
    size="field"
    tooltipAlignment="end"
    tooltipPosition={shouldPopoverOpenAboveButton ? 'top' : 'bottom'}
    on:click={() => (open = !open)}
  />
  <Popover
    bind:open
    align={shouldPopoverOpenAboveButton ? 'top-right' : 'bottom-right'}
    closeOnOutsideClick
    light
    relative
  >
    <menu on:contextmenu|preventDefault={preferences.reset}>
      <li>
        <RadioButtonGroup
          selected={$preferences.inset === null ? 'none' : $preferences.inset}
          on:change={({ detail }) => preferences.setInset(detail === 'none' ? null : detail)}
          legendText="Video position"
          orientation="vertical"
        >
          <RadioButton labelText="Full cover" value="none" />
          <RadioButton labelText="Inset left" value="left" />
          <RadioButton labelText="Inset center" value="center" />
          <RadioButton labelText="Inset right" value="right" />
        </RadioButtonGroup>
      </li>
      <li>
        <Toggle
          toggled={$preferences.background !== null}
          on:toggle={event => {
            const { toggled } = event.detail;

            preferences.setBackground(toggled ? color : null);
          }}
          labelText="Inset video background colour"
          size="sm"
        />
        <input
          type="color"
          value={resolveHexColor(color)}
          on:input={event => {
            const { value } = event.currentTarget;

            color = value.replace('#', '');
            preferences.setBackground(color);
          }}
          disabled={$preferences.background === null}
        />
      </li>
    </menu>
  </Popover>
</div>

<style>
  menu {
    margin: 0;
    padding: 0.75rem 0.75rem 1rem;
  }

  li {
    display: block;
  }

  li + li {
    margin-top: 0.75rem;
  }

  input[type='color'] {
    transform: translate(0, -85%);
    position: absolute;
    right: 0.75rem;
    width: calc(100% - 6rem);
  }

  input[type='color'][disabled] {
    opacity: 0.5;
  }
</style>
