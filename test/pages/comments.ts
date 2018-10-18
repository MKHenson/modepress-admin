import Page from './page';
import Agent from '../utils/agent';
import * as assert from 'assert';
import AppModule from './modules/app';
import CommentModule from './modules/comments';

export default class CommentsPage extends Page {
  public appModule: AppModule;
  public commentModule: CommentModule;

  constructor() {
    super();
  }

  async load( agent: Agent, path = '/dashboard/comments' ) {
    await super.load();

    if ( agent )
      await this.setAgent( agent );

    await super.to( path );

    assert( await this.$( '.mt-comments-container' ) );
    await this.doneLoading();

    this.appModule = new AppModule( this.page );
    this.commentModule = new CommentModule( this.page );
  }

  /**
   * Waits for the page to be done loading
   */
  async doneLoading() {
    return this.emptySelector( '.mt-loading' );
  }

  async user( val?: string ) {
    if ( val === undefined ) {
      return this.page.$eval( '.my-user-picker-label', elm => elm.textContent )
    }
    else {
      await this.page.waitFor( '.my-user-picker-btn' );
      await this.page.click( '.my-user-picker-btn' );
      await this.page.waitFor( '.mt-user-autocomplete input' );
      await this.page.type( '.mt-user-autocomplete input', val, { delay: 50 } );
      await this.page.waitFor( '.mt-user-drop-item:first-child' );
      await this.page.click( '.mt-user-drop-item:first-child' );
      await this.emptySelector( '.mt-user-autocomplete input' )
    }
  }

  /**
   * Select the user filter
   */
  async selectUserFilter( val?: string ) {
    await this.user( val );
    await this.doneLoading();
  }

  /**
   * Filters the comments by title and content
   * @param search The filter text
   */
  async filter( search: string ) {
    await this.page.click( '#mt-comments-filter' );
    await this.page.$eval( '#mt-comments-filter', ( elm: HTMLInputElement ) => elm.value = '' );
    await this.page.type( '#mt-comments-filter', search );
    await this.page.click( '.mt-comments-search' );
    await this.doneLoading();
  }

  /**
   * Open or close the filter options
   */
  async toggleFilterOptionsPanel( open: boolean ) {
    await this.page.click( '.mt-comments-filter' );
    if ( open )
      await this.page.waitFor( '.mt-filters-panel.open' );
    else
      await this.page.waitFor( '.mt-filters-panel.closed' );
  }

  /**
   * Click the sort order toggle
   */
  async clickSortOrder() {
    await this.page.click( '.mt-sort-order' );
    await this.doneLoading();
  }

  /**
   * Select what to sort by
   */
  async selectSortType( type: 'created' | 'updated' ) {
    await this.page.click( '.mt-filter-sortby' );
    await this.page.waitFor( '.mt-filter-sortby-updated' );
    await this.page.click( `.mt-filter-sortby-${ type }` );
    await this.emptySelector( '.mt-filter-sortby-updated' );
    await this.doneLoading();
  }
}