/**
 * StorageOperations.js
 * Utilities to interact with local storage
 */
export const StorageOperations = {
  saveProjectPath: ( path ) =>
    localStorage.setItem( "projectFolder", path ),

  getProjectPath: () =>
    localStorage.getItem( "projectFolder" ),

  saveProjectData: ( paths ) => {
    const { projectPath, contentPath, dataPath } = paths;
    localStorage.setItem( "projectFolder", projectPath );
    localStorage.setItem( "contentFolder", contentPath );
    localStorage.setItem( "dataFolder", dataPath );
  },

  clearProjectData: () => {
    [ "projectFolder", "contentFolder", "dataFolder" ]
      .forEach( key => localStorage.removeItem( key ) );
  },

  getProjectName: ( path ) => path.split( "/" ).pop()
};