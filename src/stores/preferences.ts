import { get, writable } from 'svelte/store';
import { ImportedProject } from '../constants';

export type BackgroundPreference = string | null;
export type InsetPreference = 'left' | 'center' | 'right' | null;
export type OrientationPreference = 'portrait' | 'landscape' | null;

export type Preferences = {
  background: BackgroundPreference;
  inset: InsetPreference;
  orientation: OrientationPreference;
};

export const DEFAULTS: Preferences = {
  inset: null,
  background: null,
  orientation: null
};

const createPreferencesStore = () => {
  const state = DEFAULTS;

  const store = writable(state);
  const { set, subscribe, update } = store;

  return {
    getConfigAsAlternatingCase() {
      const { background, inset } = get(store);

      return `${inset ? `INSET${inset}` : ''}${background ? `BACKGROUND${background.replace('#', '')}` : ''}`;
    },
    import(importedProject: ImportedProject) {
      set(
        Object.keys(DEFAULTS).reduce(
          (memo, key) => ({
            ...memo,
            [key]: importedProject[key] || DEFAULTS[key]
          }),
          {} as Preferences
        )
      );
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
    setOrientation(value: OrientationPreference) {
      update(state => ({ ...state, orientation: value }));
    },
    subscribe
  };
};

export default createPreferencesStore();
