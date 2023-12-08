import { getFromLocalStorage } from "./local-storage.js";

export const selectFolder = async ( folderType ) => {
  console.log( folderType );
  const projectFolder = getFromLocalStorage( "projectFolder" );
  const dialogOptions = {
    message: `Select the ${ folderType } Folder`,
    defaultPath: projectFolder,
    properties: [ "openDirectory" ],
  };

  return await electronAPI.openDialog( "showOpenDialog", dialogOptions );
};