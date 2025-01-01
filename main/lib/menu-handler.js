// menu-handler.js
import { Menu, app, ipcMain } from 'electron';

const createApplicationMenu = ( window ) => {
  const template = [
    ...( process.platform === 'darwin' ? [ {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    } ] : [] ),
    {
      label: 'File',
      submenu: [
        process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'NPM',
      submenu: [
        {
          label: 'Install Dependencies',
          click: () => window.webContents.send( 'npm-install-trigger' ),
          id: 'npm-install',
          enabled: false
        },
        {
          label: 'Start Project',
          click: () => window.webContents.send( 'npm-start-trigger' ),
          id: 'npm-start',
          enabled: false
        },
        {
          label: 'Stop Project',
          click: () => window.webContents.send( 'npm-stop-trigger' ),
          id: 'npm-stop',
          enabled: false
        }
      ]
    },
    {
      label: 'Git',
      submenu: [
        {
          label: 'Clone Repository',
          click: () => {
            window.webContents.send( 'git-clone-trigger' );
          },
          id: 'git-clone'
        },
        {
          label: 'Git Commit',
          click: () => {
            window.webContents.send( 'git-commit-trigger' );
          },
          id: 'git-commit'
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate( template );
  Menu.setApplicationMenu( menu );

  // Expose methods to enable/disable items
  ipcMain.on( 'npm-state-change', ( event, { running, hasNodeModules, hasProject } ) => {
    console.log( "in the ipcMain.on function" );
    menu.getMenuItemById( 'npm-start' ).enabled = hasProject && !running;
    menu.getMenuItemById( 'npm-stop' ).enabled = hasProject && running;
    menu.getMenuItemById( 'npm-install' ).enabled = hasProject && !hasNodeModules;
  } );

  return menu;
};

export { createApplicationMenu };