<script lang="ts">
  import Button from 'carbon-components-svelte/src/Button/Button.svelte';
  import Popover from 'carbon-components-svelte/src/Popover/Popover.svelte';
  import RadioButton from 'carbon-components-svelte/src/RadioButton/RadioButton.svelte';
  import RadioButtonGroup from 'carbon-components-svelte/src/RadioButtonGroup/RadioButtonGroup.svelte';
  import Toggle from 'carbon-components-svelte/src/Toggle/Toggle.svelte';
  import Settings24 from 'carbon-icons-svelte/lib/Settings24/Settings24.svelte';
  import { default as preferences } from './store';

  let windowInnerWidth: number;
  let open: boolean;
  let color: string = '#666666';

  $: shouldPopoverOpenAboveButton = windowInnerWidth <= 960;
</script>

<svelte:window bind:innerWidth={windowInnerWidth} />

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
        <input
          type="color"
          value={color}
          on:input={event => {
            const { value } = event.currentTarget;

            color = value;
            preferences.setBackground(color);
          }}
          disabled={$preferences.background === null}
        />
        <Toggle
          toggled={$preferences.background !== null}
          on:toggle={event => {
            const { toggled } = event.detail;

            preferences.setBackground(toggled ? color : null);
          }}
          labelText="Inset video background colour"
          size="sm"
        />
      </li>
    </menu>
  </Popover>
</div>

<style lang="scss">
  menu {
    margin: 0;
    padding: 0.75rem 0.75rem 1rem;
    width: 15rem;
  }

  li {
    display: block;
  }

  li + li {
    margin-top: 0.75rem;
  }

  input[type='color'] {
    transform: translate(0, 1.625rem);
    position: absolute;
    left: 6rem;
  }

  input[type='color'][disabled] {
    opacity: 0.5;
  }
</style>
