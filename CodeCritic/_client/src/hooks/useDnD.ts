import { useEffect, useState } from "react";
import { useOpenClose } from "./useOpenClose";

function traverseDirectory(entry) {
    const reader = entry.createReader();
    // Resolved when the entire directory is traversed
    return new Promise((resolve, reject) => {
        const iterationAttempts = [];
        function readEntries() {
            // According to the FileSystem API spec, readEntries() must be called until
            // it calls the callback with an empty array.  Seriously??
            reader.readEntries((entries) => {
                if (!entries.length) {
                    // Done iterating this particular directory
                    resolve(Promise.all(iterationAttempts));
                } else {
                    // Add a list of promises for each directory entry.  If the entry is itself
                    // a directory, then that promise won't resolve until it is fully traversed.
                    iterationAttempts.push(Promise.all(entries.map((ientry) => {
                        if (ientry.isFile) {
                            // DO SOMETHING WITH FILES
                            return ientry;
                        }
                        // DO SOMETHING WITH DIRECTORIES
                        return traverseDirectory(ientry);
                    })));
                    // Try calling readEntries() again for the same dir, according to spec
                    readEntries();
                }
            }, error => reject(error));
        }
        readEntries();
    });
}

function toFile(entry: FileEntry): Promise<File> {
    return new Promise((resolve, reject) => {
        entry.file(resolve, reject);
    });
}

const flatten = (f: FileEntry | FileEntry[], result: FileEntry[]) => {
    if (Array.isArray(f)) {
        f.forEach(ff => {
            flatten(ff, result);
        })
    } else {
        result.push(f);
    }
}

interface FileEntry {
    file(succ: (file: File) => void, err?: (e: any) => void): void;
    name: string;
}

export const useDnD = (dropzone: HTMLElement | Document, onDropHandle: (files: File[]) => void) => {
    const target: HTMLElement | Document = dropzone;
    const [isDragging, startDragging, stopDragging] = useOpenClose();

    const preventDefault = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }

    const onDragEnter = (e: DragEvent) => {
        preventDefault(e);
        startDragging();
    }

    const onDragLeave = (e: DragEvent) => {
        preventDefault(e);
        stopDragging();
    }

    const onDragOver = (e: DragEvent) => {
        preventDefault(e);
        startDragging();
    }

    const onDrop = async (e: DragEvent) => {
        preventDefault(e);
        stopDragging();

        let items = [...e.dataTransfer.items];
        const result: any[] = [];
        let entries: FileEntry[] = [];
        try {
            for (let i = 0; i < items.length; i++) {
                // scanFiles(items[i].webkitGetAsEntry(), result);
                const data = await traverseDirectory(items[i].webkitGetAsEntry()) as FileEntry[];
                entries = [...entries, ...data];
            }
            flatten(entries, result);
            const promises = result.map(i => toFile(i));
            const data = await Promise.all(promises);
            onDropHandle(data);
        } catch (error) {
            const files = [...e.dataTransfer.files];
            onDropHandle(files);
        }
    }

    useEffect(() => {
        (async () => {
            target.addEventListener("dragenter", onDragEnter, false);
            target.addEventListener("dragleave", onDragLeave, false);
            target.addEventListener("dragover", onDragOver, false);
            target.addEventListener("drop", onDrop, false);

            return () => {
                target.removeEventListener("dragenter", onDragEnter);
                target.removeEventListener("dragleave", onDragLeave);
                target.removeEventListener("dragover", onDragOver);
                target.removeEventListener("drop", onDrop);
            }
        })()
    }, []);

    return { isDragging };
}