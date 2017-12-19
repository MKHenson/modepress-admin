const Page = require( './page' );

class UsersPage extends Page {
  constructor() {
    super();
    this.$filter = '.users-filter';
    this.$filterSearch = 'button[name=users-search-button]';
  }

  async load( agent ) {
    await super.load();
    if ( agent )
      await this.setAgent( agent );
    return super.to( '/dashboard/users' );
  }

  async selectUser( email ) {
    await this.filter( email );
    await this.clickFilterBtn();
    await this.doneLoading();
    const user = await this.getUserByEmail( email );
    await user.click();
    await this.page.waitFor( '.mt-user-properties' );
  }

  /**
   * Gets or sets the user filter value
   * @param {string} val
   * @returns {Promise<string>}
   */
  filter( val ) {
    return super.textfield( this.$filter, val )
  }

  async clickDrawer( headerName ) {
    const headers = await this.page.$$( '.mt-user-properties .mt-drawer-header' );
    for ( const header of headers ) {
      const text = await header.evaluate( elm => elm.querySelector( 'h3' ).textContent );
      if ( text === headerName )
        return header.click();
    }

    return null;
  }

  /**
   * Waits for the auth page to not be in a busy state
   */
  doneLoading() {
    return this.page.waitForFunction( 'document.querySelector(".mt-loading") == null' );
  }

  /**
   * Gets a user element by email
   * @param {string} email The email of the user to select
   */
  async getUserByEmail( email ) {
    const users = await this.page.$$( `.mt-user-list > div` );
    for ( const user of users ) {
      const text = await user.evaluate( elm => elm.querySelector( '.mt-user-email' ).textContent );
      if ( text === email )
        return user;
    }

    return null;
  }

  getSnackMessage() {
    return this.$eval( '.mt-response-message > div > div > span', elm => elm.textContent );
  }

  closeSnackMessage() {
    return this.page.click( '.mt-response-message button' );
  }

  /**
   * Gets a user object { username: string; email: string; } from the user list by index
   * @param {number} index The index of the user to examine
   */
  getUserFromList( index ) {
    return this.page.$eval( `.mt-user-list > div:nth-child(${ index + 1 })`, elm => {
      return {
        username: elm.querySelector( '.mt-user-name' ).textContent,
        email: elm.querySelector( '.mt-user-email' ).textContent
      }
    } );
  }

  /**
   * Gets an array of user objects of visible the visible users { username: string; email: string; }
   */
  getUsersFromList() {
    return this.page.$eval( `.mt-user-list`, elm => {
      return Array.from( elm.children ).map( child => {
        return {
          username: child.querySelector( '.mt-user-name' ).textContent,
          email: child.querySelector( '.mt-user-email' ).textContent
        }
      } )
    } );
  }

  clickFilterBtn() { return this.page.click( this.$filterSearch ); }
}

module.exports = UsersPage;