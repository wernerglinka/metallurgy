import getFolderName from "./get-folder-name.js";
import { getFromLocalStorage } from "./local-storage.js";

export const updateFolderUI = ( folderType, contentFolder ) => {
  // we need the project folder name to generate the content folder name with getFolderName()
  const projectFolder = getFromLocalStorage( "projectFolder" );
  const projectFolderName = projectFolder.split( "/" ).pop();
  const contentFolderName = getFolderName( projectFolderName, contentFolder );

  // Update the content folder name in the UI
  const contentFolderNameElement = document.querySelector( `.js-${ folderType }-folder-name` );
  if ( contentFolderNameElement ) {
    contentFolderNameElement.innerText = contentFolderName;
  }

  // Add 'ready' class to the wrapper so we can show the content folder name
  // and hide the 'select content folder' button
  const contentField = contentFolderNameElement.closest( ".js-get-path" );
  if ( contentField ) {
    contentField.classList.add( "ready" );
  }
};