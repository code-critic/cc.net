import { ILanguage } from '../models/CustomModel';

export const languages: ILanguage[] = [
    {
        "id": "PY-367",
        "name": "Python",
        "scaleFactor": 5,
        "scaleStart": 0,
        "version": "3.6.8",
        "extension": "py",
        "disabled": false,
        "compile": [],
        "run": [
            "python3",
            "<filename>"
        ],
        "unittest": [
            "python3",
            "-m",
            "pytest",
            "--json=.report.json",
            "-rA",
            "<filename>"
        ],
        "compilationNeeded": false,
        "scaleInfo": "0.00 + 5.00×"
    },
    {
        "id": "C",
        "name": "C",
        "scaleFactor": 1,
        "scaleStart": 0,
        "version": "gcc 8.2.0",
        "extension": "c",
        "disabled": false,
        "compile": [
            "gcc",
            "<filename>",
            "-o",
            "main"
        ],
        "run": [
            "./main"
        ],
        "unittest": [],
        "compilationNeeded": true,
        "scaleInfo": "0.00 + 1.00×"
    },
    {
        "id": "CPP",
        "name": "C++",
        "scaleFactor": 1,
        "scaleStart": 0,
        "version": "g++ 8.2.0",
        "extension": "cpp",
        "disabled": false,
        "compile": [
            "g++",
            "-std=c++17",
            "<filename>",
            "-o",
            "main"
        ],
        "run": [
            "./main"
        ],
        "unittest": [],
        "compilationNeeded": true,
        "scaleInfo": "0.00 + 1.00×"
    },
    {
        "id": "JAVA",
        "name": "Java",
        "scaleFactor": 2.6,
        "scaleStart": 0.2,
        "version": "1.8.0_91",
        "extension": "java",
        "disabled": false,
        "compile": [
            "javac",
            "<filename>"
        ],
        "run": [
            "java",
            "main"
        ],
        "unittest": [],
        "compilationNeeded": true,
        "scaleInfo": "0.20 + 2.60×"
    },
    {
        "id": "CS",
        "name": "C#",
        "scaleFactor": 2,
        "scaleStart": 0,
        "version": "Mono 3.0.7",
        "extension": "cs",
        "disabled": false,
        "compile": [
            "mcs",
            "<filename>",
            "-out:main"
        ],
        "run": [
            "mono",
            "main"
        ],
        "unittest": [],
        "compilationNeeded": true,
        "scaleInfo": "0.00 + 2.00×"
    },
    {
        "id": "MATLAB",
        "name": "Matlab",
        "scaleFactor": 2,
        "scaleStart": 8.5,
        "version": "R2020a",
        "extension": "m",
        "disabled": false,
        "compile": [],
        "run": [
            "matlab",
            "-nodesktop",
            "-nosplash",
            "-nodisplay",
            "-r",
            "\"<filename-no-ext>;exit;\""
        ],
        "unittest": [],
        "compilationNeeded": false,
        "scaleInfo": "8.50 + 2.00×"
    },
    {
        "id": "MARKDOWN",
        "name": "Markdown",
        "scaleFactor": 1,
        "scaleStart": 0,
        "version": "1.0.0",
        "extension": "md",
        "disabled": false,
        "compile": [],
        "run": [
            "cat",
            "<filename>"
        ],
        "unittest": [],
        "compilationNeeded": false,
        "scaleInfo": "0.00 + 1.00×"
    }
];