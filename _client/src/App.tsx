import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';

import { StudentResultList } from './routes/StudentResultList';
import { ProblemStudentMatrixList } from './routes/ProblemStudentMatrixList';

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
        <Route exact path='/' component={Home} />
        <Route path='/view-results' exact={true} component={StudentResultList} />
        <Route path='/problem-student-matrix/:id?/:year?' exact={true} component={ProblemStudentMatrixList} />
      </Layout>
    );
  }
}
