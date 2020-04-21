import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { pageLinks } from './pageLinks';
import { NotificationContainer } from 'react-notifications';


export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
        {pageLinks.map(i =>
          <Route key={i.path} component={i.component} path={i.path} exact={i.exact}/>
        )}
        <NotificationContainer />
      </Layout>
    );
  }
}
