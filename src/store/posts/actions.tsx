import { ActionCreator } from '../actions-creator';
import { Page, IPost, IDraftElement } from '../../../../../src';
import * as posts from '../../../../../src/lib-frontend/posts';
import * as documents from '../../../../../src/lib-frontend/documents';
import { PostsGetAllOptions } from 'modepress';
import { IRootState } from '..';
import { ActionCreators as AppActions } from '../app/actions';
import { push } from 'react-router-redux';

// Action Creators
export const ActionCreators = {
  SetPostsBusy: new ActionCreator<'posts-busy', boolean>( 'posts-busy' ),
  AddElement: new ActionCreator<'posts-add-elm', IDraftElement<'client'>>( 'posts-add-elm' ),
  UpdateElement: new ActionCreator<'posts-update-elm', IDraftElement<'client'>>( 'posts-update-elm' ),
  RemoveElements: new ActionCreator<'posts-remove-elms', string[]>( 'posts-remove-elms' ),
  SetPosts: new ActionCreator<'posts-set-posts', { page: Page<IPost<'client'>>, filters: Partial<PostsGetAllOptions> }>( 'posts-set-posts' ),
  SetPost: new ActionCreator<'posts-set-post', IPost<'client'>>( 'posts-set-post' ),
  SetElmSelection: new ActionCreator<'posts-elm-set-selection', string[]>( 'posts-elm-set-selection' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

/**
 * Refreshes the user state
 */
export function getPosts( options: Partial<PostsGetAllOptions> ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    const state = getState();
    const newFilters = { ...state.posts.postFilters, ...options };

    dispatch( ActionCreators.SetPostsBusy.create( true ) );
    const resp = await posts.getAll( newFilters );
    dispatch( ActionCreators.SetPosts.create( { page: resp, filters: newFilters } ) );
  }
}

export function getPost( id: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetPostsBusy.create( true ) );
    const resp = await posts.getOne( { id } );
    dispatch( ActionCreators.SetPost.create( resp ) );
  }
}

export function createPost( post: Partial<IPost<'client'>> ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetPostsBusy.create( true ) );
      const resp = await posts.create( post );
      dispatch( AppActions.serverResponse.create( `New Post '${ resp.title }' created` ) );
      dispatch( ActionCreators.SetPostsBusy.create( false ) );
      dispatch( push( `/dashboard/posts/edit/${ resp._id }` ) );
    }
    catch ( err ) {
      dispatch( AppActions.serverResponse.create( `Error: ${ err.message }` ) );
      dispatch( ActionCreators.SetPostsBusy.create( false ) );
    }
  }
}

export function deletePosts( toDelete: Partial<IPost<'client'>>[] ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetPostsBusy.create( true ) );
      const promises = toDelete.map( p => posts.remove( p._id! ) );
      await Promise.all( promises );

      dispatch( AppActions.serverResponse.create( toDelete.length > 1 ? `Deleted [${ toDelete.length }] posts` : `Post '${ toDelete[ 0 ].title }' deleted` ) );
      const state = getState();
      const filters = { ...state.posts.postFilters, ...{ index: 0, keyword: '' } };
      const resp = await posts.getAll( filters );
      dispatch( ActionCreators.SetPosts.create( { page: resp, filters: filters } ) );
    }
    catch ( err ) {
      dispatch( AppActions.serverResponse.create( `Error: ${ err.message }` ) );
      dispatch( ActionCreators.SetPostsBusy.create( false ) );
    }
  }
}

export function editPost( post: Partial<IPost<'client'>> ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetPostsBusy.create( true ) );
      const resp = await posts.update( post._id as string, post );
      dispatch( AppActions.serverResponse.create( `Post '${ resp.title }' updated` ) );
      dispatch( ActionCreators.SetPostsBusy.create( false ) );
    }
    catch ( err ) {
      dispatch( AppActions.serverResponse.create( `Error: ${ err.message }` ) );
      dispatch( ActionCreators.SetPostsBusy.create( false ) );
    }
  }
}

export function addElement( docId: string, element: Partial<IDraftElement<'client'>> ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetPostsBusy.create( true ) );
      const resp = await documents.addElement( docId, element );
      dispatch( ActionCreators.AddElement.create( resp ) );
    }
    catch ( err ) {
      dispatch( AppActions.serverResponse.create( `Error: ${ err.message }` ) );
      dispatch( ActionCreators.SetPostsBusy.create( false ) );
    }
  }
}

export function updateElement( docId: string, elementId: string, html: string, createParagraph: boolean ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetPostsBusy.create( true ) );
      const resp = await documents.editElement( docId, elementId, { html } );
      dispatch( ActionCreators.UpdateElement.create( resp ) );
    }
    catch ( err ) {
      dispatch( AppActions.serverResponse.create( `Error: ${ err.message }` ) );
      dispatch( ActionCreators.SetPostsBusy.create( false ) );
    }
  }
}

export function deleteElements( docId: string, ids: string[] ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetPostsBusy.create( true ) );
      await Promise.all( ids.map( id => documents.removeElement( docId, id ) ) );
      dispatch( ActionCreators.RemoveElements.create( ids ) );
    }
    catch ( err ) {
      dispatch( AppActions.serverResponse.create( `Error: ${ err.message }` ) );
      dispatch( ActionCreators.SetPostsBusy.create( false ) );
    }
  }
}