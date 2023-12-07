import { getFromLocalStorage, saveToLocalStorage } from "../utility-functions/local-storage.js";
import getFolderName from "../utility-functions/get-folder-name.js";
import { isProjectReady } from "../utility-functions/is-project-ready.js";
const renderer = ( () => {
  const showProjectFolderName = () => {
    const projectFolder = getFromLocalStorage( "projectFolder" );
    const projectFolderName = document.querySelector( '.js-project-folder-name' );
    if ( projectFolderName ) {
      const folderName = `/${ projectFolder.split( "/" ).pop() }/`;
      projectFolderName.innerText = folderName;
    }
  };

  const getContentFolder = () => {
    const trigger = document.querySelector( '.js-get-content-folder' );

    if ( trigger ) {
      trigger.addEventListener( 'click', async ( e ) => {
        e.preventDefault();

        try {
          // get the project folder from local storage so we can open a
          // dialog box to select the content folder in the project folder
          const projectFolder = getFromLocalStorage( "projectFolder" );

          // Dialog options for selecting the content folder in the project folder
          const dialogOptions = {
            message: "Select the Content Folder",
            defaultPath: projectFolder,
            properties: [ "openDirectory" ],
          };

          // Show a dialog to select the project folder
          const userSelection = await electronAPI.openDialog( "showOpenDialog", dialogOptions );

          if ( userSelection.canceled ) {
            return false;
          }

          // Save the content folder to local storage and show the content folder name
          if ( userSelection.filePaths.length > 0 ) {
            const contentFolder = userSelection.filePaths[ 0 ];
            saveToLocalStorage( "contentFolder", contentFolder );

            // Show the content folder name

            // we need the project folder name to generate the content folder name with getFolderName()
            const projectFolderName = projectFolder.split( "/" ).pop();
            const contentFolderName = getFolderName( projectFolderName, contentFolder );

            // Update the content folder name in the UI
            const contentFolderNameElement = document.querySelector( '.js-content-folder-name' );
            if ( contentFolderNameElement ) {
              contentFolderNameElement.innerText = contentFolderName;
            }

            // Add 'ready' class to the wrapper so we can show the content folder name
            // and hide the 'select content folder' button
            const contentField = contentFolderNameElement.closest( ".js-get-path" );
            if ( contentField ) {
              contentField.classList.add( "ready" );
            }

            // Check if the project is ready to be created
            if ( isProjectReady() ) {
              // Show the 'create project' button
              const startProjectButton = document.querySelector( '.js-start' );
              if ( startProjectButton ) {
                const buttonWrapper = startProjectButton.closest( ".js-decision-buttons" );
                if ( buttonWrapper ) {
                  buttonWrapper.classList.add( "ready" );
                }
              }
            }
          }
        } catch ( error ) {
          console.error( "Error in getContentFolder", error );
          alert( "Error selecting content folder" );
          return false;
        }
      } );
    } else {
      console.warn( "Trigger element not found for getProjectFolder" );
      return false;
    }
  };

  const getDataFolder = () => {
    const trigger = document.querySelector( '.js-get-data-folder' );

    if ( trigger ) {
      trigger.addEventListener( 'click', async ( e ) => {
        e.preventDefault();

        try {
          // get the project folder from local storage so we can open a
          // dialog box to select the content folder in the project folder
          const projectFolder = getFromLocalStorage( "projectFolder" );

          // Dialog options for selecting the content folder in the project folder
          const dialogOptions = {
            message: "Select the Data Folder",
            defaultPath: projectFolder,
            properties: [ "openDirectory" ],
          };

          // Show a dialog to select the project folder
          const userSelection = await electronAPI.openDialog( "showOpenDialog", dialogOptions );

          if ( userSelection.canceled ) {
            return false;
          }

          // Save the content folder to local storage and show the content folder name
          if ( userSelection.filePaths.length > 0 ) {
            const dataFolder = userSelection.filePaths[ 0 ];
            saveToLocalStorage( "dataFolder", dataFolder );

            // Show the data folder name

            // we need the project folder name to generate the content folder name with getFolderName()
            const projectFolderName = projectFolder.split( "/" ).pop();
            const dataFolderName = getFolderName( projectFolderName, dataFolder );

            // Update the content folder name in the UI
            const dataFolderNameElement = document.querySelector( '.js-data-folder-name' );
            if ( dataFolderNameElement ) {
              dataFolderNameElement.innerText = dataFolderName;
            }

            // Add 'ready' class to the wrapper so we can show the content folder name
            // and hide the 'select content folder' button
            const dataField = dataFolderNameElement.closest( ".js-get-path" );
            if ( dataField ) {
              dataField.classList.add( "ready" );
            }

            // Check if the project is ready to be created
            if ( isProjectReady() ) {
              // Show the 'create project' button
              const startProjectButton = document.querySelector( '.js-start' );
              if ( startProjectButton ) {
                const buttonWrapper = startProjectButton.closest( ".js-decision-buttons" );
                if ( buttonWrapper ) {
                  buttonWrapper.classList.add( "ready" );
                }
              }
            }
          }
        } catch ( error ) {
          console.error( "Error in getDataFolder", error );
          alert( "Error selecting data folder" );
          return false;
        }
      } );
    } else {
      console.warn( "Trigger element not found for getDataFolder" );
      return false;
    }
  };

  const storeProjectConfig = () => {
    const trigger = document.querySelector( '.js-start' );

    if ( trigger ) {
      trigger.addEventListener( 'click', async ( e ) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        // Get the target and home screen
        const targetScreen = e.target.href;
        const homeScreen = document.location.href;

        // Create the project config file
        const projectData = {
          projectPath: getFromLocalStorage( "projectFolder" ),
          contentPath: getFromLocalStorage( "contentFolder" ),
          dataPath: getFromLocalStorage( "dataFolder" ),
        };

        // Send the project data to the main process to create the project config file
        const response = await electronAPI.writeFile( projectData );

        if ( response.status === "success" ) {
          // Redirect to open project screen
          window.location.href = targetScreen;
        } else {
          console.error( `Error creating project config file`, response.error );
          window.location.href = homeScreen;
        }
      } );
    }
  };

  return {
    showProjectFolderName,
    getContentFolder,
    getDataFolder,
    storeProjectConfig,
  };

} )();

renderer.showProjectFolderName();
renderer.getContentFolder();
renderer.getDataFolder();
renderer.storeProjectConfig();