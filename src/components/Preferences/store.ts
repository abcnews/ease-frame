import { get, writable } from 'svelte/store';

export type BackgroundPreference = string | null;
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

  const store = writable(state);
  const { set, subscribe, update } = store;

  return {
    getAlternatingCase() {
      const { background, inset } = get(store);

      return `${inset ? `INSET${inset}` : ''}${background ? `BACKGROUND${background.replace('#', '')}` : ''}`;
    },
    reset() {
      set(DEFAULTS);
    },
    setBackground(value: BackgroundPreference) {
      update(state => ({ ...state, background: value }));
    },
    setInset(value: InsetPreference) {
      update(state => ({ ...state, inset: value }));
    },
    subscribe
  };
};

export default createPreferencesStore();
