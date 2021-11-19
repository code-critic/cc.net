import { Button, Checkbox, FormControlLabel } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { CodeCritic } from '../api';
import { ICcDataDto, ICourseGradeStudentDto } from '../cc-api';
import { SimpleLoader } from '../components/SimpleLoader';
import { useRefresh } from '../hooks/useRefresh';
import { useUser } from '../hooks/useUser';
import { groupBy } from '../utils/arrayUtils';
import { cssVar } from '../utils/cssVar';
import { FilterContext, IGradeStatFilterContext } from './GradeResults';
import { ProblemPickerExportProps } from "./ProblemPicker";


import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { humanizeName } from '../utils/utils';

type Order = 'asc' | 'desc';

const applyOrderBy = (data: ICourseGradeStudentDto[], orderBy: string, order: Order) => {
    const applyOrderByOnly = (data: ICourseGradeStudentDto[], orderBy: string) => {
        switch (orderBy) {
            case 'name':
                return data.sort((a, b) => a.user!.localeCompare(b.user!))
            case 'points':
                return data.sort((a, b) => a.totalPoints - b.totalPoints)
            default:
                const problemId = orderBy;
                return data.sort((a, b) => {
                    const aPoints = a.problems.find(p => p.problemId === problemId).points ?? 0;
                    const bPoints = b.problems.find(p => p.problemId === problemId)!.points ?? 0;
                    return aPoints - bPoints;
                });
        }
    }

    // reverse if desc
    return order === 'desc'
        ? applyOrderByOnly(data, orderBy).reverse()
        : applyOrderByOnly(data, orderBy);
};

const applyTagsFilter = (data: ICourseGradeStudentDto[], tags: string[]) => {
    if (tags.length === 0) {
        return data;
    }

    return data.filter(d => {
        const intersection = d.tags!.filter(t => tags.includes(t));
        return intersection.length > 0;
    });
}

export interface GradeResultsCourseImplProps extends ProblemPickerExportProps { }
export const GradeResultsCourseImpl = (props: GradeResultsCourseImplProps) => {
    const { course } = props;

    // order by state
    const [orderBy, setOrderBy] = useState('name');
    const [order, setOrder] = useState<Order>('asc');

    // tags state
    const [tags, setTags] = useState<string[]>([]);

    const [data, setData] = useState<ICourseGradeStudentDto[]>();
    const { context } = useContext(FilterContext) as IGradeStatFilterContext;
    const { isRoot } = useUser();
    const { counter, refresh } = useRefresh();

    const updateOrderAndOrderBy = (newOrderBy: string) => {
        if (orderBy === newOrderBy) {
            setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
            setOrderBy(newOrderBy);
            setOrder(newOrderBy == 'name' ? 'asc' : 'desc');
        }
    };


    useEffect(() => {
        (async () => {
            const axiosResponse = await CodeCritic.api.gradeStatsCourseCreate(course.course, course.year, context);
            const data = axiosResponse.data;
            setData(data);
        })();
    }, [counter, context.showMissingGradeOnly]);



    if (data == null) {
        return <SimpleLoader title="loading stats" />;
    }
    const problems = data?.[0].problems ?? [];
    const sortedData = applyOrderBy(
        applyTagsFilter(data, tags),
        orderBy,
        order
    );

    const renderSortIcon = (name: string) => {
        if (orderBy === name) {
            return order === 'asc' ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowUpIcon fontSize="small" />;
        }
        return <></>;
    }


    const renderHeader = () => {
        return <>

            <Button className="header user" size="small"
                onClick={() => updateOrderAndOrderBy('name')}>
                Student{renderSortIcon("name")}
            </Button>
            <Button className="header total" size="small"
                onClick={() => updateOrderAndOrderBy('points')}>
                Total{renderSortIcon("points")}
            </Button>

            {problems.map(i => <Button className="header problem" size="small" key={i.problemId}
                onClick={() => updateOrderAndOrderBy(i.problemId)}>
                {i.problemName}{renderSortIcon(i.problemId)}
            </Button>
            )}
        </>
    }

    const renderTags = () => {
        const allTags = [...new Set(data.map(i => i.tags).flat())].sort();
        return <>{allTags.map(i => <FormControlLabel
            control={<Checkbox
                checked={tags.includes(i)}
                onChange={(e) => {
                    setTags(e.target.checked ? [...tags, i] : tags.filter(t => t !== i));
                }}
            />
            }
            label={i}
            key={i}
            className="tag" />)}</>
    }

    const renderRows = () => {
        return <>
            {sortedData.map(i => <>
                <div className="data user">{humanizeName(i.user)}</div>
                <div className="data total">{i.totalPoints} / {i.averagePercentage.toFixed(0)} / {i.averagePercentageSolved.toFixed(0)}</div>

                {i.problems.map(j =>
                    <div key={`${i.user}-${j.problemId}`} className="data problem">{j.points}</div>)}
            </>)}
        </>
    }


    const totalCols = problems.length + 1 + 1;

    return <div>
        {renderTags()}
        <div className="grade-results-course-impl foo" style={cssVar("cols", totalCols)}>
            {renderHeader()}
            {renderRows()}
        </div>
    </div>

    // const allResults =
    //     data.filter((i, index, self) => index === self.findIndex(j => j.objectId === i.objectId));

    // const problems = [...groupBy(allResults, i => i.problem).entries()];
    // const students = applyOrderBy(
    //         [...groupBy(allResults, i => i.users[0]).entries()],
    //         orderBy,
    //         order
    //     );

    // const totalCols = problems.length + 1 + 1;

    // // // get all results from user 'jakub.kindermann' and deselect duplicates
    // // const foo = data
    // //     .filter(i => i.users[0] === 'jakub.kindermann')
    // //     .filter((i, index, self) => index === self.findIndex(j => j.problem === i.problem))

    // // const sum = foo.reduce((p, c) => p + c.points ?? 0, 0);
    // // const bar = foo.map(i => { return { problem: i.problem, points: i.points}});


    // return <div className="grade-results-course-impl foo" style={cssVar("cols", totalCols)}>
    //     {/* <div style={{ gridColumn: `1 / ${problems_and_total}` }}>
    //         aa
    //     </div> */}
    //     {/* top row */}
    //     <div className="header user" onClick={() => updateOrderAndOrderBy('name')}>Student</div>
    //     <div className="header total" onClick={() => updateOrderAndOrderBy('points')}>Total</div>
    //     {problems.map(([problem, results]) => {
    //         return (<div className="header problem" key={problem} onClick={() => updateOrderAndOrderBy(problem)}>{problem}</div>);
    //     })}



    //     {/* results */}
    //     {students.map(([student, results]) => {
    //         const total = results.reduce((acc, cur) => acc + cur?.points ?? 0, 0);
    //         const average = (total / (results.length * 100)) * 100;

    //         return (<>
    //             <div className="user">{student}</div>
    //             <div className="total">{total} / {average.toFixed(2)}%</div>
    //             <>
    //                 {problems.map(([problem, results]) => {
    //                     const result = results.find(i => i.users[0] === student);

    //                     return (<div className="data problem" key={problem}>{result?.points}</div>);
    //                 })}
    //             </>
    //         </>)
    //     })}
    // </div>
}