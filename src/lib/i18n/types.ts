/**
 * i18n Type Definitions
 *
 * Self-implemented internationalization types for Display Lab.
 * Supports English (en) and Korean (ko).
 */

export type Locale = 'en' | 'ko';

export interface Translations {
  [key: string]: string | Translations;
}

/** Flatten nested translation object into dot-notation keys */
export type FlattenKeys<T, Prefix extends string = ''> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: FlattenKeys<
        T[K],
        Prefix extends '' ? K : `${Prefix}.${K}`
      >;
    }[keyof T & string];
