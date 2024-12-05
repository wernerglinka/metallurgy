// __tests__/lib/utilities/date-formatter.test.js
import { formatDate } from '../../../screens/lib/utilities/date-formatter.js';

describe( 'date formatter', () => {
  it( 'formats yyyy-MM-dd strings correctly', () => {
    expect( formatDate( '2024-02-15' ) ).toBe( '2024-02-15' );
    expect( formatDate( '2024-2-5' ) ).toBe( '2024-02-05' );
    expect( formatDate( '2024-12-31' ) ).toBe( '2024-12-31' );
  } );

  it( 'handles invalid inputs', () => {
    expect( formatDate( null ) ).toBe( 'Invalid Date' );
    expect( formatDate( undefined ) ).toBe( 'Invalid Date' );
    expect( formatDate( '' ) ).toBe( 'Invalid Date' );
    expect( formatDate( 'invalid' ) ).toBe( 'Invalid Date' );
    expect( formatDate( '2024-13-45' ) ).toBe( 'Invalid Date' ); // invalid month/day
  } );

  it( 'validates date values', () => {
    expect( formatDate( '2024-00-01' ) ).toBe( 'Invalid Date' ); // month 0
    expect( formatDate( '2024-13-01' ) ).toBe( 'Invalid Date' ); // month 13
    expect( formatDate( '2024-01-00' ) ).toBe( 'Invalid Date' ); // day 0
    expect( formatDate( '2024-01-32' ) ).toBe( 'Invalid Date' ); // day 32
  } );

  it( 'handles timezone edge cases', () => {
    const localDate = new Date( '2024-02-15' );
    expect( formatDate( localDate ) ).toBe( '2024-02-15' );
  } );
} );