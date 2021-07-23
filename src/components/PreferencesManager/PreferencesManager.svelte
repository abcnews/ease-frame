<script lang="ts">
  import Button from 'carbon-components-svelte/src/Button/Button.svelte';
  import Popover from 'carbon-components-svelte/src/Popover/Popover.svelte';
  import RadioButton from 'carbon-components-svelte/src/RadioButton/RadioButton.svelte';
  import RadioButtonGroup from 'carbon-components-svelte/src/RadioButtonGroup/RadioButtonGroup.svelte';
  import Toggle from 'carbon-components-svelte/src/Toggle/Toggle.svelte';
  import Close24 from 'carbon-icons-svelte/lib/Close24/Close24.svelte';
  import Settings24 from 'carbon-icons-svelte/lib/Settings24/Settings24.svelte';
  import { get } from 'svelte/store';
  import { default as preferences } from '../../stores/preferences';
  import { resolveHexColor } from '../../utils';
  import { PopoverPosition } from './constants';

  export let popoverPosition: PopoverPosition = PopoverPosition.TOP;

  let open: boolean;
  let color: string = get(preferences).background || '393939';
</script>

<div>
  <Button
    icon={open ? Close24 : Settings24}
    iconDescription={`Change preferences`}
    kind="secondary"
    size="field"
    tooltipAlignment="end"
    tooltipPosition={popoverPosition}
    on:click={() => (open = !open)}
  />
  <Popover bind:open align={`${popoverPosition}-right`} closeOnOutsideClick light relative>
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
      <li>
        <RadioButtonGroup
          legendText="Preferred stills orientation"
          orientation="vertical"
          selected={$preferences.orientation}
          on:change={({ detail }) => preferences.setOrientation(detail)}
        >
          <RadioButton labelText="Landscape" value="landscape" />
          <RadioButton labelText="Portrait" value="portrait" />
        </RadioButtonGroup>
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
