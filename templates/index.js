import { page } from './page.js';
import { commonSectionFields } from './common-fields.js';
import * as sections from './sections/index.js';

export const templates = {
  'page': page,
  'audio': { ...commonSectionFields, ...sections.audio },
  'video': { ...commonSectionFields, ...sections.video },
  // ... other templates
};