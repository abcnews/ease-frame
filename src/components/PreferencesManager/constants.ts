export type BackgroundControlValue = string;
export type BackgroundPreference = string | null;
export type InsetControlValue = 'left' | 'center' | 'right' | 'none';
export type InsetPreference = 'left' | 'center' | 'right' | null;

export type Preferences = {
  background: BackgroundPreference;
  inset: InsetPreference;
};

export const DEFAULT_PREFERENCES: Preferences = {
  inset: null,
  background: null
};
