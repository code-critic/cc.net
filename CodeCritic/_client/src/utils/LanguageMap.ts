export const mapByExtension = (extension: string) => {
    const ext = extension || "";

    switch(ext.toLowerCase()) {
        case "c":
        case "cc":
        case "cpp":
        case "h":
        case "hh":
        case "hpp":
        case "cs":
            return "clike";

        case "py":
            return "python";

        case "m":
            return "octave";

        case "js":
        case "json":
            return "javascript";

        case "java":
            return "clike";

        case "csproj":
            return "xml";

        default:
            return "text";
    }
}

export const supportedExtensions = [
    ".c", ".cc", ".cpp",
    ".h", ".hh", ".hpp",
    ".cs", ".py", ".java", ".m",
    ".txt", ".md", ".json", ".xml",
    ".js", ".csproj"
]

export const isFiletypeSupported = (filename: string) => {
    return supportedExtensions.some(i => filename.endsWith(i));
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

        case "csproj":
            return "xml";

        case "m":
            return "matlab";

        case "js":
        case "json":
            return "javascript";

        case "java":
            return "java";

        default:
            return "text";
    }
}