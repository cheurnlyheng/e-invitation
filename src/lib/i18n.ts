export type Lang = "km" | "en";

/** A string that exists in every supported language. */
export type L10n = Readonly<Record<Lang, string>>;

export const LANGS: readonly Lang[] = ["km", "en"];
