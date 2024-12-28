// screens/home/index.js
import { handleNewProject } from './handlers/new-project.js';
import { handleDeleteProject } from './handlers/delete-project.js';
import { handleEditProject } from './handlers/edit-project.js';
import { setupRecentProject, initializeEventListeners } from './ui/setup.js';

const SELECTORS = {
  newProject: '.js-get-project-folder',
  deleteProject: '.js-delete-project-folder',
  editProject: '.js-edit-project'
};

const initialize = () => {

  const handlers = {
    [ SELECTORS.newProject ]: handleNewProject,
    [ SELECTORS.deleteProject ]: handleDeleteProject,
    [ SELECTORS.editProject ]: handleEditProject
  };

  initializeEventListeners( handlers );
  setupRecentProject();
};

initialize();