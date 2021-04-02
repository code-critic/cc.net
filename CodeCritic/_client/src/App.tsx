import React, { Component } from 'react';
import { NotificationContainer } from 'react-notifications';
import { Route } from 'react-router-dom';

import { Container } from '@material-ui/core';

import { GroupManager } from './comp/GroupManager';
import { SolutionResultView } from './comp/solutionResultView/SolutionResultView';
import { NavMenu } from './components/NavMenu';
import { ICcDataCaseResult } from './models/DataModel';
import { ProcessStatusStatic } from './models/Enums';
import { pageLinks } from './pageLinks';
import { TimelineRenderer } from './renderers/TimelineRenderer';
import { CcFooter } from './components/CCFooter';

export default class App extends Component {
    static displayName = App.name;

    render() {
        // const subresults: Partial<ICcDataCaseResult>[] = [
        //     {
        //         case: "TEST_00",
        //         status: ProcessStatusStatic.AnswerCorrect.code
        //     },
        //     {
        //         case: "TEST_01",
        //         status: ProcessStatusStatic.AnswerCorrectTimeout.code,
        //         message: "Program ended gracefully",
        //         messages: [
        //             "Program ended gracefully",
        //             `<Route component={SingleResult} path="/r/:objectId" exact />`,
        //             `<Route component={SingleResult} path="/r/:objectId" exact />`,
        //             `<Route component={SingleResult} path="/r/:objectId" exact />`,
        //             `<Route component={SingleResult} path="/r/:objectId" exact />`,
        //         ],
        //         command: "python3 main.py  -p 10 -r 3"
        //     },
        //     {
        //         case: "TEST_02",
        //         status: ProcessStatusStatic.Running.code
        //     },
        //     {
        //         case: "TEST_00",
        //         status: ProcessStatusStatic.InQueue.code
        //     },
        // ];

        return (<>
            <NavMenu />
            <Container maxWidth={"xl"} style={{marginBottom: 50}}>
                {/* <TimelineRenderer subresults={subresults as any} /> */}
                <Route component={SolutionResultView} path="/r/:objectId" exact />
                <Route component={GroupManager} path="/manage-groups" exact />

                {pageLinks.map(i =>
                    <Route key={i.path} component={i.component} path={i.path} exact={i.exact} />
                )}
                <NotificationContainer />
            </Container>
            <CcFooter />
        </>);
    }
}