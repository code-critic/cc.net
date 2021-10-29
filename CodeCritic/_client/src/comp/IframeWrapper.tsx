import { useEffect, useRef, useState } from "react";

interface IframeWrapperProps {
    width: any;
    minHeight: any;
    margin?: any;
    src: string;
}
export const IframeWrapper = (props: IframeWrapperProps) => {
    const { minHeight, width, src, margin=0 } = props;
    const [height, setHeight] = useState(minHeight);
    const iframe = useRef<HTMLIFrameElement>();

    useEffect(() => {
        // const id = setInterval(updateIframeHeight, 3000);
        // iframe.current.contentWindow.addEventListener("resize", updateIframeHeight);
        // iframe.current.contentWindow.document.addEventListener("resize", updateIframeHeight);
        // iframe.current.contentWindow.document.body.addEventListener("resize", updateIframeHeight);
        console.log(iframe);
        
        
        return () => {
            // clearInterval(id)
            // iframe.current.contentWindow.removeEventListener("resize", updateIframeHeight);
            // iframe.current.contentWindow.document.removeEventListener("resize", updateIframeHeight);
            // iframe.current.contentWindow.document.body.removeEventListener("resize", updateIframeHeight);
        }
    }, [ ]);

    const updateIframeHeight = (e: any) => {
        console.log(e);
        const height = e?.target.contentWindow?.document.body.scrollHeight
            ?? e?.target.document.body.scrollHeight
            ?? iframe.current?.contentWindow?.document.body.scrollHeight
            ?? minHeight;
            
        setHeight(Math.max(height, minHeight) + margin);
    }

    if (iframe.current) {
        iframe.current.contentWindow.document.onresize = updateIframeHeight;
    }

    return <iframe ref={iframe}
        onLoad={updateIframeHeight}
        style={{ width: width, height: height, border: "none" }}
        src={src} />
}