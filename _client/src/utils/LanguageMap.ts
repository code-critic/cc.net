export const mapLanguage = (id: string) => {
    return {
        CS: "csharp",
        C: "c_cpp",
        CC: "c_cpp",
        CPP: "c_cpp",
        JAVA: "java",
        "PY-267": "python",
        "PY-367": "python",
    }[id] || "java";
}

export const mapByExtension = (extension: string) => {
    const ext = extension || "";

    switch(ext.toLowerCase()) {
        case "c":
        case "cc":
        case "cpp":
        case "h":
        case "hh":
        case "hpp":
            return "clike";

        case "py":
            return "python";

        case "m":
            return "octave";

        case "json":
            return "javascript";

        case "java":
            return "clike";

        default:
            return "text";
    }
}

export const mapByExtensionPrism = (extension: string) => {
    const ext = extension || "";

    switch(ext.toLowerCase()) {
        case "c":
        case "cc":
        case "cpp":
        case "h":
        case "hh":
        case "hpp":
            return "clike";

        case "py":
            return "python";

        case "cs":
            return "csharp";

        case "m":
            return "matlab";

        case "json":
            return "javascript";

        case "java":
            return "java";

        default:
            return "text";
    }
}