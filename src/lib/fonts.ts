import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';

// Vietnamese subset is loaded now even though the site ships EN-only.
// It costs nothing today and means the VI rollout needs no font change.
export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});
