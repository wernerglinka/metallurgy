export const selectProject = async () => {
  const dialogOptions = {
    message: "Select a Project Folder",
    properties: [ "openDirectory" ],
  };
  // Show a dialog to select the project folder
  const userSelection = await electronAPI.openDialog( "showOpenDialog", dialogOptions );

  console.log( "userSelection", userSelection );

  if ( userSelection.canceled || userSelection.filePaths.length === 0 ) {
    return "abort";
  }

  return userSelection.filePaths[ 0 ];
};