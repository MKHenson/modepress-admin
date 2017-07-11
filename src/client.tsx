import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ConnectedRouter } from './utils/connectedRouter';
import { App } from './containers/app';
import { Provider } from 'react-redux';
import createStore from './utils/createStore';
import { IRootState } from './store';
import createHistory from 'history/createBrowserHistory';
import { MuiThemeProvider, getMuiTheme } from "material-ui/styles";

const props = ( window as any ).PROPS;
const history = createHistory();
const store = createStore( props as IRootState, history );
const mountNode = document.getElementById( 'application' );

const theme = getMuiTheme();

export const app = ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider muiTheme={theme}>
      <ConnectedRouter store={store} history={history}>
        <App />
      </ConnectedRouter>
    </MuiThemeProvider>
  </Provider>, mountNode
);

