import '../third_party/mathjax';

import React, { useEffect, useRef, useState } from 'react';

import { Button, Container } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';

import { ICcData, ICourseProblem, ISimpleFile } from '../cc-api';
import { useOpenClose } from '../hooks/useOpenClose';
import { useUser } from '../hooks/useUser';
import { liveConnection } from '../init';
import { ILanguage, ISimpleFileDto } from '../models/CustomModel';
import { ProblemStatus, ProblemType } from '../models/Enums';
import { languages } from '../static/languages';
import { notifications } from '../utils/notifications';
import { CodeEditor } from './codeEditor/CodeEditor';
import { CodeEditorLanguage } from './codeEditor/CodeEditor.Language';
import { ProblemPicker, ProblemPickerExportProps } from './ProblemPicker';
import { SubmitSolutionLastResults } from './SubmitSolution.LastResults';
import { PseudoUserGroupName, SubmitSolutionGroupSelect } from './submitSolution/SubmitSolution.GroupSelect';
import { hubApi } from './submitSolution/SubmitSolution.Hub';
import {
    ChangeLayoutTag,
    SubmitSolutionAssetsTag, SubmitSolutionDeadlineTag, SubmitSolutionGroupTag,
    SubmitSolutionOutputTag, SubmitSolutionRequiredFilesTag, SubmitSolutionRequiredLanguageTag,
    SubmitSolutionTimeTag,
} from './submitSolution/SubmitSolution.Tags';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { IframeWrapper } from './IframeWrapper';

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

const layouts = [
    'split',
    'max-desc',
    'max-code',
]

export const SubmitSolutionImpl = (props: SubmitSolutionProps) => {
    const { course, problem } = props;
    const [files, setFiles] = useState<ISimpleFile[]>();
    const [liveResult, setLiveResult] = useState<ICcData>();
    const [groupMenu, openGroupMenu, closeGroupMenu] = useOpenClose();
    const [iframeHeight, setIframeHeight] = useState(800);
    const [layoutIndex, setLayoutIndex] = useLocalStorage("cc.layout.index", 0);
    const layout = layouts[layoutIndex];
    const nextLayout = () => {
        setLayoutIndex(
            (layoutIndex + 1) % layouts.length
        );
    }


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
    }, []);

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
        });
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
            if (groupId === PseudoUserGroupName) {
                hubApi.submitSolutionStudent(user.id, problem.course, problem.year, problem.id, language.id, grabFiles());
                notifications.info("Job submitted");
                resetLiveResult();
            } else {
                hubApi.submitSolutionGroup(groupId, problem.course, problem.year, problem.id, language.id, grabFiles());
                notifications.info("Job submitted");
                resetLiveResult();
            }
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
    const problemIsActive = problem.isActive === true;
    const codeHidden = !problemIsActive && !isRoot;
    const canSubmitSolution = user.serverStatus === "running" &&
        (isRoot || (files != null && files.length > 0 && problemIsActive));

    return (<div className={`solution-submit ${codeHidden ? "inactive" : ""} layout-${layout}`}>
        <div className="last-results">
            <SubmitSolutionLastResults liveResult={liveResult} course={course} problem={problem} />
        </div>
        <div className="problem-tags">
            <SubmitSolutionDeadlineTag problem={problem} />
            <SubmitSolutionRequiredLanguageTag problem={problem} />
            <SubmitSolutionRequiredFilesTag problem={problem} language={language} />
            <SubmitSolutionTimeTag problem={problem} language={language} />
            {problem.assets?.length > 0 && <SubmitSolutionAssetsTag problem={problem} />}
            {problem.export?.length > 0 && <SubmitSolutionOutputTag problem={problem} />}
            {problem.groupsAllowed && <SubmitSolutionGroupTag problem={problem} />}

            <ChangeLayoutTag onChange={nextLayout} />
        </div>
        <div className="description">
            {problem.complexDescriptionPage
                ? <IframeWrapper width="100%" minHeight="600" src={`/S/${problem.complexDescriptionPage}`} margin={150} />
                : <div dangerouslySetInnerHTML={{ __html: problem.description }} />}
        </div>
        {!codeHidden && <div className="info">
            <CodeEditorLanguage language={language} onChange={onLanguageChange} fixed={isUnittest} />
        </div>}
        {!codeHidden && <div className="code">
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
                <Button variant="contained" color="primary" disabled={!canSubmitSolution} onClick={submitSolution}>
                    Submit Solution&nbsp;<SendIcon />
                </Button>
            </div>

            {groupMenuIsOpen && <>
                <SubmitSolutionGroupSelect
                    user={user} problem={problem}
                    onClose={closeGroupMenu}
                    onClick={handleGroupSelect} />
            </>}
        </div>}
    </div>)
}

