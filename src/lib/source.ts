import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { i18n } from '@/lib/i18n';

export const source = loader({
  baseUrl: '/guides',
  source: docs.toFumadocsSource(),
  i18n,
});

export type GuidePage = ReturnType<typeof source.getPage>;
