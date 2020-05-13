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