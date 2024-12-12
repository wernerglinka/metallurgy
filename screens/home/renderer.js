// screens/home/index.js
import { handleNewProject } from './handlers/new-project.js';
import { handleDeleteProject } from './handlers/delete-project.js';
import { handleOpenProject } from './handlers/open-project.js';
import { setupRecentProject, initializeEventListeners } from './ui/setup.js';

const SELECTORS = {
  newProject: '.js-get-project-folder',
  deleteProject: '.js-delete-project-folder',
  openProject: '.js-open-project'
};

const initialize = () => {

  const handlers = {
    [ SELECTORS.newProject ]: handleNewProject,
    [ SELECTORS.deleteProject ]: handleDeleteProject,
    [ SELECTORS.openProject ]: handleOpenProject
  };

  initializeEventListeners( handlers );
  setupRecentProject();
};

initialize();