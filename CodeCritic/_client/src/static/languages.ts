import { ILanguage } from '../models/CustomModel';

export const languages: ILanguage[] = [
    {
        "id": "PY-367",
        "name": "Python",
        "scaleFactor": 5,
        "scaleStart": 0,
        "version": "3.10.6",
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
            "--tb=line",
            "<filename>"
        ],
        "compilationNeeded": false,
        "scaleInfo": "0.00 + 5.00×"
    },
    {
        "id": "NODEJS",
        "name": "Node.js",
        "scaleFactor": 5,
        "scaleStart": 0,
        "version": "v19.0.1",
        "extension": "js",
        "disabled": false,
        "compile": ["npm", "i"],
        "unittest": [],
        "run": ["node", "<filename>"],
        "compilationNeeded": true,
        "scaleInfo": "0.50 + 5.00×"
    },
    {
        "id": "TS",
        "name": "Typescript",
        "scaleFactor": 5,
        "scaleStart": 0.5,
        "version": "v4.8.4",
        "extension": "ts",
        "disabled": false,
        "compile": ["tsc", "<filename>"],
        "unittest": [],
        "run": ["node", "<filename-no-ext>"],
        "compilationNeeded": true,
        "scaleInfo": "0.50 + 5.00×",
    },
    {
        "id": "C",
        "name": "C",
        "scaleFactor": 1,
        "scaleStart": 0,
        "version": "gcc 11.3.0",
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
        "version": "g++ 11.3.0",
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
        "id": "DOTNET",
        "name": "Dotnet C#",
        "scaleFactor": 2,
        "scaleStart": 4,
        "version": "7.0.100",
        "extension": "cs",
        "disabled": false,
        "compile": [],
        "run": [
            "dotnet",
            "run"
        ],
        "unittest": [],
        "compilationNeeded": true,
        "scaleInfo": "4.00 + 2.00×"
    },
    {
        "id": "CS",
        "name": "C#",
        "scaleFactor": 2,
        "scaleStart": 1,
        "version": "Mono 6.8.0.105",
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
        "scaleInfo": "1.00 + 2.00×"
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
    },
    {
        "id": "RUST",
        "name": "Rust",
        "scaleFactor": 1.5,
        "scaleStart": 0.2,
        "version": "1.65.0",
        "extension": "rs",
        "disabled": false,
        "compile": [
            "rustc",
            "<filename>",
            "-o",
            "main"
        ],
        "run": [
            "./main"
        ],
        "unittest": [],
        "compilationNeeded": true,
        "scaleInfo": "0.20 + 1.50×"
    }
];