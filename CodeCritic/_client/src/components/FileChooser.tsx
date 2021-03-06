import React from 'react';
import { useDropzone } from 'react-dropzone';


export interface IFile {
    name: string;
    path: string;
    
    content?: string;
    isManual?: boolean;
}
interface FileChooserProps {
    onFileDrop(files: IFile[]): void;
    component: JSX.Element;
}

export const FileChooser = (props: FileChooserProps) => {
    const { onFileDrop, component } = props;

    const dropzone = useDropzone({
        onDropAccepted: (files) => onFileDrop ? onFileDrop(files as any) : null,
        noClick: true,
    });
    const { acceptedFiles, getRootProps, getInputProps } = dropzone;
    const { isDragActive, isDragAccept, isDragReject } = dropzone;

    const files = acceptedFiles.map((file: any) => (
        <li key={file.path}>
            {file.path} - {file.size} bytes
        </li>
    ));
    const isDragActiveClass = isDragActive ? "dropzone-active" : "";
    const isDragAcceptClass = isDragAccept ? "dropzone-accept" : "";
    const isDragRejectClass = isDragReject ? "dropzone-reject" : "";
    const className = `dropzone ${isDragActiveClass} ${isDragAcceptClass} ${isDragRejectClass}`;

    return (
        <div {...getRootProps({ className: className })}>
            {component}
        </div>
    );
}