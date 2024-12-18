import { ICONS } from '../../../icons/index.js';

/**
 * @function renderCollapsButtonsHTML
 * @returns Button HTML string with icons
 */
export function renderCollapseButtonsHTML() {
  return `<span class="collapse-icon">${ ICONS.COLLAPSE }${ ICONS.COLLAPSED }</span>`;
}