import { dragStart } from "../lib/page-elements/event-handlers.js";

import manageSidebarVisibility from './sections/manage-sidebar-visibility.js';
import updateProjectName from './sections/update-project-name.js';
import manageSidebar from './sections/manage-sidebar.js';
import buildTemplatesSelection from './sections/build-templates-selection.js';
import renderEditSpace from "./sections/render-edit-space.js";
import managePreview from "./sections/manage-preview.js";

// upper left corner of the screen
updateProjectName();
// slide the sidebar to the left to hide it
manageSidebarVisibility();
// initialize draggable sidebar elements, fields and templates
manageSidebar( dragStart );
// build the template selection interface
buildTemplatesSelection();
// initis the file selection, 
renderEditSpace();
// manage the preview
managePreview();

