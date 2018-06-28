import AuthPage from '../../pages/auth';
import * as assert from 'assert';
import { } from 'mocha';
import { IUserEntry } from 'modepress/src';
let auth = new AuthPage();

describe( 'Register failures: ', function() {

  before( async () => {
    await auth.load( false );
  } )

  it( 'it should show the register widget', async () => {
    assert( await auth.$( '.register-form' ) );
  } );


  it( 'it should not allow non-alphanumeric usernames', async () => {
    await auth.username( 'MRIDONTEXISTEVER123!' );
    await auth.email( 'bademail!' );
    await auth.password( 'THISISFAKE' );
    await auth.password2( 'THISISFAKE' );
    await auth.clickRegister();
    await auth.doneLoading();
    assert.equal( await auth.error(), 'Please only use alpha numeric characters for your username' );
  } );

  it( 'it should not allow bad emails', async () => {
    await auth.username( 'MRIDONTEXISTEVER123' );
    await auth.email( 'bademail!' );
    await auth.clickRegister();
    await auth.doneLoading();
    assert.equal( await auth.error(), 'Please use a valid email address' );
  } );

  it( 'it should not allow a username that already exists', async () => {
    await auth.username( ( auth.config.adminUser as IUserEntry<'client'> ).username );
    await auth.email( 'bademail@bademail.com' );
    await auth.clickRegister();
    await auth.doneLoading();
    assert.equal( await auth.error(), 'That username or email is already in use; please choose another or login.' );
  } );

  it( 'it should not allow an existing email', async () => {
    await auth.username( 'MRIDONTEXISTEVER123' );
    await auth.email( ( auth.config.adminUser as IUserEntry<'client'> ).email );
    await auth.clickRegister();
    await auth.doneLoading();
    assert.equal( await auth.error(), 'That username or email is already in use; please choose another or login.' );
  } );
} );