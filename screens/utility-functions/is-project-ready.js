import { getFromLocalStorage } from "./local-storage.js";

export const isProjectReady = () => {
  // check is all folder paths are stored in local storage
  const projectFolder = getFromLocalStorage( "projectFolder" );
  const contentFolder = getFromLocalStorage( "contentFolder" );
  const dataFolder = getFromLocalStorage( "dataFolder" );

  if ( projectFolder && contentFolder && dataFolder ) {
    return true;
  }
  return false;
};