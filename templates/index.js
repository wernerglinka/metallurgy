
import { commonSectionFields } from './common-fields.js';
import * as pages from './pages/index.js';
import * as sections from './sections/index.js';
import * as blocks from './blocks/index.js';

export const templates = {
  'pageSimple': pages.pageSimple,
  'pageSections': pages.pageSections,
  'flexSection': { ...commonSectionFields, ...sections.flexSection },
  'audioSection': { ...commonSectionFields, ...sections.audioSection },
  'videoSection': { ...commonSectionFields, ...sections.videoSection },
  'audioBlock': blocks.audioBlock,
  'ctasBlock': blocks.ctasBlock,
  'iconBlock': blocks.iconBlock,
  'imageBlock': blocks.imageBlock,
  'textBlock': blocks.textBlock,
  'videoBlock': blocks.videoBlock

  // ... other templates
};