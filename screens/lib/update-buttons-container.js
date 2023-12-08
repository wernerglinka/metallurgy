export const updateButtonsContainer = () => {
  // Show the 'create project' button;
  const startProjectButton = document.querySelector( '.js-start' );
  if ( startProjectButton ) {
    const buttonWrapper = startProjectButton.closest( ".js-decision-buttons" );
    if ( buttonWrapper ) {
      buttonWrapper.classList.add( "ready" );
    }
  }
}

