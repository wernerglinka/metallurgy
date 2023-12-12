export const getMarkdownFile = async ( filePath ) => {
  // remove the file protocal from the path
  filePath = filePath.replace( 'file://', '' );

  // get markdown file contents 
  const fileContents = await electronAPI.readMarkdownFile( filePath );

  return {
    frontmatter: fileContents.data.frontmatter,
    content: fileContents.data.content
  };
};