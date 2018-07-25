
import { Action } from 'redux';
import { controllers } from 'modepress';
import { ActionCreators as UserActions } from '../store/users/actions';

export default async function( actions: Action[] ) {
  const users = await controllers.users.getUsers( 0, 10 );
  actions.push( UserActions.SetUsers.create( users ) );
}