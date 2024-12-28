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

    /*
    console.log( 'Result length:', testData.result.length );
    console.log( 'Expected length:', testData.expectedContent.length );

    console.log( 'First 100 chars of result:', testData.result.substring( 0, 100 ) );
    console.log( 'First 100 chars of expected:', testData.expectedContent.substring( 0, 100 ) );

    // Find first difference
    const len = Math.min( testData.result.length, testData.expectedContent.length );
    for ( let i = 0; i < len; i++ ) {
      if ( testData.result[ i ] !== testData.expectedContent[ i ] ) {
        console.log( `First difference at position ${ i }:` );
        console.log( 'Expected:', testData.expectedContent.slice( i - 20, i + 20 ) );
        console.log( 'Result:  ', testData.result.slice( i - 20, i + 20 ) );
        break;
      }
    }
    */

    expect( testData.result ).toEqual( testData.expectedContent );
  } );
} );