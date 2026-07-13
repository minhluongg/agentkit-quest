import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';

/**
 * Latin only, even though a Vietnamese rollout is planned.
 *
 * The Vietnamese subset used to be requested here, with a comment claiming "it costs nothing
 * today". It cost 15.5 KB on every page, measured: `next/font` emits a `<link rel="preload"
 * as="font">` for each subset, and a preload fetches at high priority **unconditionally**.
 * `unicode-range` gates lazy `@font-face` activation — it does not gate an explicit preload.
 *
 * So four font files were fetched eagerly on every page (87 KB total), of which two — 9,612
 * and 5,872 bytes — were glyphs an English-only site can never render, competing for
 * bandwidth with the LCP element.
 *
 * The comment's promise still holds: re-adding the subset when the VI pages exist is this
 * same one-line edit. It just should not be paid for a year in advance.
 */
export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});
