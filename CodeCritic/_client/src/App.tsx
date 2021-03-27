import React, { Component } from 'react';

import { Container } from '@material-ui/core';
import { GroupManager } from './comp/GroupManager';
import { NotificationContainer } from 'react-notifications';
import { Route } from 'react-router-dom'
import { SingleResult } from './comp/SingleResult';
import { pageLinks } from './pageLinks';

export default class App extends Component {
  static displayName = App.name;

  render() {
    return (
      <Container>
          <Route component={SingleResult} path="/r/:objectId" exact />
          <Route component={GroupManager} path="/manage-groups" exact />

          {pageLinks.map(i =>
            <Route key={i.path} component={i.component} path={i.path} exact={i.exact} />
          )}
        <NotificationContainer />
      </Container>
    );
  }
}

// export default function Body() {
//   return (
//     <BrowserRouter>
//       <Switch>
//         <Route path="/" exact component={ProblemPicker} />
//       </Switch>
//     </BrowserRouter>
//   );
// }