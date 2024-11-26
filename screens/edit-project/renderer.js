import { dragStart } from "../lib/page-elements/event-handlers.js";

import manageSidebarVisibility from '../lib/edit-project/manage-sidebar-visibility.js';
import updateProjectName from '../lib/edit-project/update-project-name.js';
import manageSidebar from '../lib/edit-project/manage-sidebar.js';
import buildTemplatesSelection from '../lib/edit-project/build-templates-selection.js';
import renderEditSpace from "../lib/edit-project/render-edit-space.js";
import managePreview from "../lib/edit-project/manage-preview.js";

updateProjectName();
manageSidebarVisibility();
manageSidebar( dragStart );
buildTemplatesSelection();
renderEditSpace();
managePreview();

