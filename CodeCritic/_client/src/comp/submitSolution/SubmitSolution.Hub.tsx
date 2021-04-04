import * as React from 'react';
import { useState, useEffect } from 'react';
import { liveConnection } from '../../init';
import { ISimpleFileDto } from '../../models/DataModel';
import { hubException } from '../../utils/utils';


// public async Task SubmitSolutionStudent
//     (string userId, string courseName, string courseYear, string problemId,
//      string langId, IList<SimpleFileDto> files)
function submitSolutionStudent(
        userId: string, courseName: string, courseYear: string, problemId: string,
        langId: string, files: ISimpleFileDto[]) {

    liveConnection
        .invoke("SubmitSolutionStudent", ...arguments)
        .catch(hubException);
}


// public async Task SubmitSolutionGroup
//     (string groupId, string courseName, string courseYear, string problemId,
//      string langId, IList<SimpleFileDto> files)
function submitSolutionGroup(
        groupId: string, courseName: string, courseYear: string, problemId: string,
        langId: string, files: ISimpleFileDto[]) {

    liveConnection
        .invoke("SubmitSolutionGroup", ...arguments)
        .catch(hubException);
}


// public async Task GenerateInput
//     (string userId, string courseName, string courseYear, string problemId)
function generateInput(
        userId: string, courseName: string, courseYear: string, problemId: string) {

    liveConnection
        .invoke("GenerateInput", ...arguments)
        .catch(hubException);
}


// public async Task GenerateOutput
//     (string userId, string courseName, string courseYear, string problemId)
// 
function generateOutput(
        userId: string, courseName: string, courseYear: string, problemId: string) {

    liveConnection
        .invoke("GenerateOutput", ...arguments)
        .catch(hubException);
}


export const hubApi = {
    submitSolutionGroup, submitSolutionStudent, generateInput, generateOutput
};