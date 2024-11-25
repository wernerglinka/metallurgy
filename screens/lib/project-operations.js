// lib/project-operations.js
export const ProjectOperations = {
  validateProject: async ( projectFolder ) => {
    const configFilePath = `${ projectFolder }/.metallurgy/projectData.json`;
    return await window.electronAPI.files.exists( configFilePath );
  },

  loadProjectConfig: async ( projectFolder ) => {
    const configFilePath = `${ projectFolder }/.metallurgy/projectData.json`;
    const result = await window.electronAPI.files.read( configFilePath );
    if ( result.status === 'failure' ) {
      throw new Error( `Failed to read project config: ${ result.error }` );
    }
    return result.data;
  },

  deleteProject: async ( projectFolder ) => {
    const configFilePath = `${ projectFolder }/.metallurgy/projectData.json`;
    const result = await window.electronAPI.files.delete( configFilePath );
    if ( result.status === 'failure' ) {
      throw new Error( `Failed to delete project: ${ result.error }` );
    }
    return true;
  },

  confirmDeletion: async ( projectName ) => {
    const confirmMessage = `Are you sure you want to remove the ${ projectName } project?`;
    return await window.electronAPI.dialog.showConfirmation( confirmMessage );
  }
};