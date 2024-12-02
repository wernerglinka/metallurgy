// __tests__/lib/process-list.test.js
import { processList } from '../../screens/lib/process-list.js';

describe( 'processList', () => {
  it( 'gets key from input element', () => {
    const element = document.createElement( 'div' );
    element.innerHTML = `
      <div class="object-name">
        <input value="myList" />
      </div>
      <ul>
        <li><input type="text" value="item1" /></li>
        <li><input type="text" value="item2" /></li>
      </ul>
    `;

    const result = processList( element );

    expect( result ).toEqual( {
      key: 'myList',
      value: [ 'item1', 'item2' ]
    } );
  } );

  it( 'gets key from label text element', () => {
    const element = document.createElement( 'div' );
    element.innerHTML = `
      <div class="object-name">
        <span class="label-text">myList</span>
      </div>
      <ul>
        <li><input type="text" value="item1" /></li>
        <li><input type="text" value="item2" /></li>
      </ul>
    `;

    const result = processList( element );

    expect( result ).toEqual( {
      key: 'myList',
      value: [ 'item1', 'item2' ]
    } );
  } );
} );