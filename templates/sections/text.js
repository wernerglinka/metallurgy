import { ctas } from './ctas.js';

/**
 * @typedef {Object} TextSection
 * @property {string} prefix - Optional prefix text
 * @property {string} title - Main title
 * @property {string} header - Header level (h1-h6)
 * @property {string} subtitle - Optional subtitle
 * @property {string} prose - Main content text
 */

/**
 * Creates text section with CTAs
 * @returns {Object} Merged text and CTAs configuration
 */
export const text = () => {
  const textBase = {
    text: {
      prefix: '',
      title: '',
      header: '',
      subtitle: '',
      prose: ''
    }
  };

  return {
    ...textBase,
    ...ctas,
    hasCtas: false
  };
};