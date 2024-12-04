// icons/index.js

/**
 * @module icons
 * @description Centralized storage for SVG icons used throughout the application
 * Icons are stored as template strings for easy insertion into HTML/DOM
 */

/**
 * @constant {Object} ICONS
 * @description Collection of SVG icons indexed by descriptive names
 * @property {string} DRAG_HANDLE - Icon for drag and drop functionality
 * @property {string} ADD - Plus icon for adding new elements
 * @property {string} DELETE - X icon for deletion actions
 * @property {string} CLOSE - Close icon for modals/overlays
 * @property {string} HIDESIDEBAR - Hide sidebar icon
 * @property {string} VIEWSIDEBAR - View sidebar icon
 */
export const ICONS = {
  DRAG_HANDLE: `<svg viewBox="0 0 14 22" xmlns="http://www.w3.org/2000/svg">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="#FFFFFF" stroke-width="2">
        <circle cx="4" cy="11" r="1"></circle>
        <circle cx="4" cy="4" r="1"></circle>
        <circle cx="4" cy="18" r="1"></circle>
        <circle cx="10" cy="11" r="1"></circle>
        <circle cx="10" cy="4" r="1"></circle>
        <circle cx="10" cy="18" r="1"></circle>
      </g>
    </g>
  </svg>`,

  ADD: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="#000000" stroke-width="2">
        <g transform="translate(2, 2)">
          <circle cx="10" cy="10" r="10"></circle>
          <line x1="6" y1="10" x2="14" y2="10"></line>
          <line x1="10" y1="6" x2="10" y2="14"></line>
        </g>
      </g>
    </g>
  </svg>`,

  DELETE: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="#000000" stroke-width="2">
        <g transform="translate(2, 2)">
          <circle cx="10" cy="10" r="10"></circle>
          <line x1="13" y1="7" x2="7" y2="13"></line>
          <line x1="7" y1="7" x2="13" y2="13"></line>
        </g>
      </g>
    </g>
  </svg>`,

  CLOSE: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#ffffff" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"> 
      <circle cx="11" cy="11" r="10"></circle>
      <line x1="14" y1="8" x2="8" y2="14"></line>
      <line x1="8" y1="8" x2="14" y2="14"></line>
    </g>
  </svg>`,

  HIDESIDEBAR: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Hide Sidebar</title>
    <rect width="18" height="18" x="3" y="3" rx="2"/>
    <path d="M9 3v18"/>
    <path d="m16 15-3-3 3-3"/>
  </svg>`,

  VIEWSIDEBAR: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Show Sidebar</title>
    <rect width="18" height="18" x="3" y="3" rx="2"/>
    <path d="M9 3v18"/>
    <path d="m14 9 3 3-3 3"/>
  </svg>`,

  COLLAPSE: `<svg class="open" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
      <g transform="translate(-2, 0)" stroke="#FFFFFF" stroke-width="2">
        <g stroke="#FFFFFF" stroke-width="2">
          <line x1="12" y1="22" x2="12" y2="16" id="Path"></line>
          <line x1="12" y1="8" x2="12" y2="2" id="Path"></line>
          <line x1="4" y1="12" x2="2" y2="12" id="Path"></line>
          <line x1="10" y1="12" x2="8" y2="12" id="Path"></line>
          <line x1="16" y1="12" x2="14" y2="12" id="Path"></line>
          <line x1="22" y1="12" x2="20" y2="12" id="Path"></line>
          <polyline id="Path" points="15 19 12 16 9 19"></polyline>
          <polyline id="Path" points="15 5 12 8 9 5"></polyline>
        </g>
      </g>
    </g>
  </svg>`,

  COLLAPSED: `<svg class="collapsed" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
      <g transform="translate(-2, 0)" stroke="#FFFFFF" stroke-width="2">
          <g transform="translate(2, 2)">
              <line x1="10" y1="20" x2="10" y2="14" id="Path"></line>
              <line x1="10" y1="6" x2="10" y2="0" id="Path"></line>
              <line x1="2" y1="10" x2="0" y2="10" id="Path"></line>
              <line x1="8" y1="10" x2="6" y2="10" id="Path"></line>
              <line x1="14" y1="10" x2="12" y2="10" id="Path"></line>
              <line x1="20" y1="10" x2="18" y2="10" id="Path"></line>
              <polyline id="Path" points="13 17 10 20 7 17"></polyline>
              <polyline id="Path" points="13 3 10 0 7 3"></polyline>
          </g>
      </g>
    </g>
  </svg>`,
};