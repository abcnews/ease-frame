import { get } from 'svelte/store';
import { writable } from 'svelte-local-storage-store';
import { onlyStringProps } from '../utils';
import type { Preferences } from './preferences';

interface PersistedProject {
  updatedAt: number;
  timesMS: number[];
  preferences: Preferences;
}

type PersistedProjects = Record<string, PersistedProject>;

const store = writable<PersistedProjects>('ease-frame-projects', {});

export const saveProject = (id: string, timesMS: number[], preferences: Preferences) => {
  store.update(projects => ({
    ...projects,
    [id]: {
      updatedAt: Date.now(),
      timesMS,
      preferences
    }
  }));
};

export const getImportURL = (id: string) => {
  const { timesMS, preferences } = get(store)[id];

  return `${String(window.location.href).split('?')[0]}?${new URLSearchParams(
    onlyStringProps({
      v: id,
      t: timesMS.join('-'),
      b: preferences.background,
      i: preferences.inset,
      o: preferences.orientation
    })
  ).toString()}`;
};

export default store;
