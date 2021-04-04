import '../third_party/mathjax';

import React, {useEffect, useState} from 'react';

import {Button, Container} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';

import {useOpenClose} from '../hooks/useOpenClose';
import {useUser} from '../hooks/useUser';
import {ICcData, ICourseProblem, ILanguage, ISimpleFile, ISimpleFileDto} from '../models/DataModel';
import {ProblemType} from '../models/Enums';
import {languages} from '../static/languages';
import {CodeEditor} from './codeEditor/CodeEditor';
import {CodeEditorLanguage} from './codeEditor/CodeEditor.Language';
import {ProblemPicker, ProblemPickerExportProps} from './ProblemPicker';
import {SubmitSolutionLastResults} from './SubmitSolution.LastResults';
import {SubmitSolutionGroupSelect} from './submitSolution/SubmitSolution.GroupSelect';
import {
    SubmitSolutionAssetsTag,
    SubmitSolutionDeadlineTag,
    SubmitSolutionGroupTag,
    SubmitSolutionOutputTag,
    SubmitSolutionRequiredFilesTag,
    SubmitSolutionRequiredLanguageTag
} from './submitSolution/SubmitSolution.Tags';
import {hubApi} from './submitSolution/SubmitSolution.Hub';
import {notifications} from '../utils/notifications';
import {liveConnection} from '../init';


const determineDefaultLanguage = (problem: ICourseProblem) => {
    if (problem.type === ProblemType.Unittest) {
        return languages.find(i => i.id === problem.reference.lang);
    }
    return languages[0];
}

interface SubmitSolutionProps extends ProblemPickerExportProps { }
export const SubmitSolution = (props: SubmitSolutionProps) => {
    return (<Container maxWidth="lg">
        <ProblemPicker
            component={SubmitSolutionImpl}
            baseUrl="/courses"
            tileStyle="big"
            withBreadcrumbs
        />
    </Container>)
}

export const SubmitSolutionImpl = (props: SubmitSolutionProps) => {
    const { course, problem } = props;
    const [files, setFiles] = useState<ISimpleFile[]>();
    const [liveResult, setLiveResult] = useState<ICcData>();
    const [groupMenu, openGroupMenu, closeGroupMenu] = useOpenClose();


    const { user, isRoot } = useUser();

    const [language, setLanguage] = useState<ILanguage>(
        determineDefaultLanguage(problem)
    );

    useEffect(() => {
        const MathJax = (window as any).MathJax;
        if (MathJax && MathJax.typeset) {
            MathJax.typeset();
        }
    });

    useEffect(() => {
        console.log('useEffect');
        liveConnection.on("OnProcessStart", (item: ICcData) => {
            console.log('hub update', item);
            if (item.courseName == problem.course && item.courseYear == problem.year && item.problem == problem.id) {
                setLiveResult(item);
            } else {
                console.log('ignoring', problem, item);
                
            }
        });
        return () => {
            console.log('removing');
            liveConnection.off("OnProcessStart");
        }
    }, [ ]);

    const resetLiveResult = () => {
        setLiveResult(undefined);
    }

    const handleChange = (files: ISimpleFile[]) => {
        setFiles(files);
    }

    const onLanguageChange = (languageId: string) => {
        setLanguage(languages.find(i => i.id === languageId));
    }

    const grabFiles = () => {
        return files.map(i => {
            return { name: i.filename, path: i.relPath, content: i.content } as ISimpleFileDto;
        })
    }

    const submitSolution = () => {
        // show menu
        if (problem.groupsAllowed) {
            openGroupMenu();
        } else {
            hubApi.submitSolutionStudent(user.id, problem.course, problem.year, problem.id, language.id, grabFiles());
            notifications.info("Job submitted");
            resetLiveResult();
        }
    }

    const handleGroupSelect = (groupId?: string) => {
        closeGroupMenu();

        if (groupId) {
            hubApi.submitSolutionGroup(groupId, problem.course, problem.year, problem.id, language.id, grabFiles());
            notifications.info("Job submitted");
            resetLiveResult();
        }
    }

    const generateFiles = (type: 'input' | 'output') => {
        if (type === 'input') {
            hubApi.generateInput(user.id, problem.course, problem.year, problem.id);
            notifications.info("Job submitted");
            resetLiveResult();
        } else if (type === 'output') {
            hubApi.generateOutput(user.id, problem.course, problem.year, problem.id);
            notifications.info("Job submitted");
            resetLiveResult();
        }
    }

    const isUnittest = problem.type === ProblemType.Unittest;
    const groupMenuIsOpen = problem.groupsAllowed && groupMenu;
    const showGenerateBtns = isRoot && problem.type === ProblemType.LineByLine && problem.reference != null;

    return (<div className="solution-submit">
        <div className="last-results">
            <SubmitSolutionLastResults liveResult={liveResult} course={course} problem={problem} />
        </div>
        <div className="problem-tags">
            <SubmitSolutionDeadlineTag problem={problem} />
            <SubmitSolutionRequiredLanguageTag problem={problem} />
            <SubmitSolutionRequiredFilesTag problem={problem} language={language} />
            {problem.assets?.length > 0 && <SubmitSolutionAssetsTag problem={problem} />}
            {problem.export?.length > 0 && <SubmitSolutionOutputTag problem={problem} />}
            {problem.groupsAllowed && <SubmitSolutionGroupTag problem={problem} />}
        </div>
        <div className="description">
            <div dangerouslySetInnerHTML={{ __html: problem.description }} />
        </div>
        <div className="info">
            <CodeEditorLanguage language={language} onChange={onLanguageChange} fixed={isUnittest} />
        </div>
        <div className="code">
            <CodeEditor language={language} problem={problem} onChange={handleChange} />
            <div style={{ display: 'flex', gap: 10 }}>
                {showGenerateBtns && <>
                    <Button variant="outlined" color="secondary" onClick={() => generateFiles("input")}>
                        Generate Input
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={() => generateFiles("output")}>
                        Generate Output
                    </Button>
                </>}
                <Button variant="contained" color="primary" disabled={!files || files.length == 0} onClick={submitSolution}>
                    Submit Solution&nbsp;<SendIcon />
                </Button>
            </div>

            {groupMenuIsOpen && <>
                <SubmitSolutionGroupSelect
                    user={user} problem={problem}
                    onClose={closeGroupMenu}
                    onClick={handleGroupSelect} />
            </>}
        </div>
    </div>)
}
