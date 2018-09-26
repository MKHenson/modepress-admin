import { ActionCreators, Action } from './actions';
import { PostsGetAllOptions } from 'modepress';
import { Page, IPost } from '../../../../../src';

// State
export type State = {
  readonly postFilters: Partial<PostsGetAllOptions>;
  readonly postPage: Page<IPost<'client'>> | null;
  readonly post: IPost<'client'> | null;
  readonly busy: boolean;
};

export const initialState: State = {
  postFilters: { index: 0 },
  postPage: null,
  post: null,
  busy: false
};

// Reducer
export default function reducer( state: State = initialState, action: Action ): State {
  let partialState: Partial<State> | undefined;

  switch ( action.type ) {
    case ActionCreators.SetPosts.type:
      partialState = {
        postPage: action.payload.page,
        postFilters: { ...state.postFilters, ...action.payload.filters },
        busy: false
      };
      break;

    case ActionCreators.SetPostsBusy.type:
      partialState = { busy: action.payload };
      break;

    case ActionCreators.SetPost.type:
      partialState = {
        post: action.payload,
        busy: false
      };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}