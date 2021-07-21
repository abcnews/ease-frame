import { writable } from 'svelte/store';

export type BackgroundControlValue = string;
export type BackgroundPreference = string | null;
export type InsetControlValue = 'left' | 'center' | 'right' | 'none';
export type InsetPreference = 'left' | 'center' | 'right' | null;

export type Preferences = {
  background: BackgroundPreference;
  inset: InsetPreference;
};

export const DEFAULTS: Preferences = {
  inset: null,
  background: null
};

const createPreferencesStore = () => {
  const state = DEFAULTS;

  const { subscribe, update } = writable(state);

  return {
    subscribe,
    setBackground(value: BackgroundPreference) {
      update(state => ({ ...state, background: value }));
    },
    setInset(value: InsetPreference) {
      update(state => ({ ...state, inset: value }));
    }
  };
};

export default createPreferencesStore();
