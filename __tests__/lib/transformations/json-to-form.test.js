import { describe, it, expect } from '@jest/globals';
import { buildForm } from '../../../screens/lib/form-generation/form-builder/index.js';
import { processFrontmatter } from '../../../screens/lib/form-generation/process-frontmatter.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

const normalizeHtml = ( html ) => {
  return html
    .replace( /\s+/g, ' ' )
    .replace( /class="\s+/g, 'class="' )
    .replace( /\s+"/g, '"' )
    .trim();
};

const setupTest = async () => {
  const frontmatter = await fs.readFile( path.join( __dirname, './incoming.json' ), 'utf8' );
  const parsedFrontmatter = JSON.parse( frontmatter );

  const explicitSchema = await fs.readFile( path.join( __dirname, '../test-schema.json' ), 'utf8' );
  const parsedSchema = JSON.parse( explicitSchema );

  const schema = await processFrontmatter( parsedFrontmatter );
  const result = buildForm( schema, parsedSchema );
  const expectedContent = await fs.readFile( path.join( __dirname, './resulting.html' ), 'utf8' );

  return {
    result: normalizeHtml( result ),
    expectedContent: normalizeHtml( expectedContent )
  };
};

describe( 'Schema Processing Tests', () => {
  let testData;

  beforeAll( async () => {
    testData = await setupTest();
  } );

  // Update test to show detailed diff
  it( 'processes JSON into expected HTML', () => {
    expect( testData.result ).toEqual( testData.expectedContent );
  } );
} );