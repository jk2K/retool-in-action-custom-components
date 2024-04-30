import * as React from "react";
import { hexToRgb } from "./utils";
import "./style.css"

export interface MaskEditorProps {
    src: string;
    maskCanvasRef?: React.MutableRefObject<HTMLCanvasElement>;
    canvasRef?: React.MutableRefObject<HTMLCanvasElement>;
    cursorSize?: number;
    onCursorSizeChange?: (size: number) => void;
    maskOpacity?: number;
    maskColor?: string;
    maskBlendMode?: "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity"
}

export const MaskEditorDefaults = {
    cursorSize: 10,
    maskOpacity: .75,
    maskColor: "#23272d",
    maskBlendMode: "normal",
}

export const MaskEditor: React.FC<MaskEditorProps> = (props: MaskEditorProps) => {
    const src = props.src;
    const cursorSize = props.cursorSize ?? MaskEditorDefaults.cursorSize;
    const maskColor = props.maskColor ?? MaskEditorDefaults.maskColor;
    const maskBlendMode = props.maskBlendMode ?? MaskEditorDefaults.maskBlendMode;
    const maskOpacity = props.maskOpacity ?? MaskEditorDefaults.maskOpacity;

    // image
    const canvas = React.useRef<HTMLCanvasElement | null>(null);
    // mask image
    const maskCanvas = React.useRef<HTMLCanvasElement | null>(null);
    const cursorCanvas = React.useRef<HTMLCanvasElement | null>(null);
    const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(null);
    const [maskContext, setMaskContext] = React.useState<CanvasRenderingContext2D | null>(null);
    const [cursorContext, setCursorContext] = React.useState<CanvasRenderingContext2D | null>(null);
    const [size, setSize] = React.useState<{ x: number, y: number }>({ x: 256, y: 256 })
    const myRef = React.useRef<HTMLDivElement | null>(null);

    React.useLayoutEffect(() => {
        if (canvas.current) {
            // initial image canvas context
            const ctx = (canvas.current as HTMLCanvasElement).getContext("2d");
            setContext(ctx);

            if (props.canvasRef && canvas.current) {
                props.canvasRef.current = canvas.current
            }
        }
    }, [canvas, size]);

    React.useLayoutEffect(() => {
        if (maskCanvas.current) {
            const ctx = (maskCanvas.current as HTMLCanvasElement).getContext("2d");
            if (ctx) {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, size.x, size.y);
            }
            setMaskContext(ctx);

            // Assign the mask to the parent component to make it easier to get the mask image
            if (props.maskCanvasRef && maskCanvas.current) {
                props.maskCanvasRef.current = maskCanvas.current;
            }
        }
    }, [maskCanvas, size]);

    React.useLayoutEffect(() => {
        if (cursorCanvas.current) {
            const ctx = (cursorCanvas.current as HTMLCanvasElement).getContext("2d");
            setCursorContext(ctx);
        }
    }, [cursorCanvas, size]);

    function calculateWidthAndHeight(imageWidth: number, imageHeight: number, containerWidth: number, containerHeight: number) {
        const widthRatio = containerWidth / imageWidth;
        const heightRatio = containerHeight / imageHeight;
        let scale = Math.min(widthRatio, heightRatio);
        const newWidth = imageWidth * scale;
        const newHeight = imageHeight * scale;
        return [newWidth, newHeight]
    }

    React.useEffect(() => {
        if (src && context) {
            const img = new Image;
            img.crossOrigin = "Anonymous"
            img.onload = evt => {
                if (myRef.current) {
                    let [scaledWidth, scaledHeight] = calculateWidthAndHeight(img.width, img.height, myRef.current.clientWidth, myRef.current.clientHeight)
                    context.drawImage(img, 0, 0, scaledWidth, scaledHeight);
                    if (size.x != scaledWidth || size.y != scaledHeight) {
                        setSize({ x: scaledWidth, y: scaledHeight });
                    }
                }
            }
            img.src = src;
        }
        // when the width of canvas changes, the context is cleared, the drawn image is gone. so we need to listen for size
    }, [src, context, size]);

    React.useEffect(() => {
        const listener = (evt: MouseEvent) => {
            if (cursorContext) {
                cursorContext.clearRect(0, 0, size.x, size.y);

                cursorContext.beginPath();
                cursorContext.fillStyle = `${maskColor}88`;
                cursorContext.strokeStyle = maskColor;
                cursorContext.arc(evt.offsetX, evt.offsetY, cursorSize, 0, 360);
                cursorContext.fill();
                cursorContext.stroke();
            }
            if (maskContext && evt.buttons > 0) {
                maskContext.beginPath();
                maskContext.fillStyle = (evt.buttons > 1 || evt.shiftKey) ? "#ffffff" : maskColor;
                maskContext.arc(evt.offsetX, evt.offsetY, cursorSize, 0, 360);
                maskContext.fill();
            }
        }
        const scrollListener = (evt: WheelEvent) => {
            if (cursorContext) {
                if (props.onCursorSizeChange) {
                    props.onCursorSizeChange(Math.max(0, cursorSize + (evt.deltaY > 0 ? 1 : -1)));
                }

                cursorContext.clearRect(0, 0, size.x, size.y);

                cursorContext.beginPath();
                cursorContext.fillStyle = `${maskColor}88`;
                cursorContext.strokeStyle = maskColor;
                cursorContext.arc(evt.offsetX, evt.offsetY, cursorSize, 0, 360);
                cursorContext.fill();
                cursorContext.stroke();

                evt.stopPropagation();
                evt.preventDefault();
            }
        }

        cursorCanvas.current?.addEventListener("mousemove", listener);
        if (props.onCursorSizeChange) {
            cursorCanvas.current?.addEventListener("wheel", scrollListener);
        }
        return () => {
            cursorCanvas.current?.removeEventListener("mousemove", listener);
            if (props.onCursorSizeChange) {
                cursorCanvas.current?.removeEventListener("wheel", scrollListener);
            }
        }
    }, [cursorContext, maskContext, cursorCanvas, cursorSize, maskColor, size]);

    const replaceMaskColor = React.useCallback((hexColor: string, invert: boolean) => {
        const imageData = maskContext?.getImageData(0, 0, size.x, size.y);
        const color = hexToRgb(hexColor);
        if (imageData) {
            for (var i = 0; i < imageData?.data.length; i += 4) {
                const pixelColor = ((imageData.data[i] === 255) != invert) ? [255, 255, 255] : color;
                imageData.data[i] = pixelColor[0];
                imageData.data[i + 1] = pixelColor[1];
                imageData.data[i + 2] = pixelColor[2];
                imageData.data[i + 3] = imageData.data[i + 3];
            }
            maskContext?.putImageData(imageData, 0, 0);
        }
    }, [maskContext]);
    React.useEffect(() => replaceMaskColor(maskColor, false), [maskColor]);

    return <div className="react-mask-editor-outer" ref={myRef}>
        <div
            className="react-mask-editor-inner"
            style={{
                width: size.x,
                height: size.y,
            }}
        >
            <canvas
                ref={canvas}
                style={{
                    width: size.x,
                    height: size.y,
                }}
                width={size.x}
                height={size.y}
                className="react-mask-editor-base-canvas"
            />
            <canvas
                ref={maskCanvas}
                width={size.x}
                height={size.y}
                style={{
                    width: size.x,
                    height: size.y,
                    opacity: maskOpacity,
                    mixBlendMode: maskBlendMode as any,
                }}
                className="react-mask-editor-mask-canvas"
            />
            <canvas
                ref={cursorCanvas}
                width={size.x}
                height={size.y}
                style={{
                    width: size.x,
                    height: size.y,
                }}
                className="react-mask-editor-cursor-canvas"
            />
        </div>
    </div>
}