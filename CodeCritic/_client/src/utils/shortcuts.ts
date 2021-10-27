export const isKeySequenceNextPage = (e: KeyboardEvent) => {
    return (e.ctrlKey && e.shiftKey && e.code === 'PageDown')
        || (e.ctrlKey && e.altKey && e.code === 'PageDown')
        || (e.ctrlKey && e.shiftKey && e.code === 'ArrowDown')
        || (e.ctrlKey && e.altKey && e.code === 'ArrowDown')
}

export const isKeySequencePrevPage = (e: KeyboardEvent) => {
    return (e.ctrlKey && e.shiftKey&& e.code === 'PageUp')
        || (e.ctrlKey && e.altKey && e.code === 'PageUp')
        || (e.ctrlKey && e.shiftKey && e.code === 'ArrowUp')
        || (e.ctrlKey && e.altKey && e.code === 'ArrowUp')
}