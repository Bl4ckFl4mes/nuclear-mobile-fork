export const DEFAULT_THEME_ID = 'kracht:heavy';

export const BUILTIN_BASIC_THEME_IDS = [
  DEFAULT_THEME_ID,
  'nuclear:aurora',
  'nuclear:ember',
  'nuclear:lagoon',
  'nuclear:arctic-moss',
  'kracht:heavy',
] as const;

export type BuiltinBasicThemeId = (typeof BUILTIN_BASIC_THEME_IDS)[number];
