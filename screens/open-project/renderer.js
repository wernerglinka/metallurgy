import { getFromLocalStorage, saveToLocalStorage } from "../lib/local-storage.js";
import { isProjectReady } from "../lib/is-project-ready.js";
import { selectFolder } from "../lib/select-folder.js";
import { updateFolderUI } from "../lib/update-folder-ui.js";
import { updateButtonsContainer } from "../lib/update-buttons-container.js";
const renderer = ( () => {
  const getProjectData = async () => {
  };

  const getContentFileList = async () => {

  };

  return {
    getProjectData,
    getContentFileList
  };

} )();

renderer.getProjectData();
renderer.getContentFileList();