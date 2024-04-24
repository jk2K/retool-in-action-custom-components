import React from 'react'
import { type FC } from 'react'
import { MaskEditor, toMask } from "react-mask-editor";
import "./react-mask-editor/style.css"

import { Retool } from '@tryretool/custom-component-support'

export const ImageMaskEditor: FC = () => {
  Retool.useComponentSettings({
    defaultHeight: 50,
    defaultWidth: 5,
  });

  const canvas = React.useRef<HTMLCanvasElement>() as React.MutableRefObject<HTMLCanvasElement>;
  const [imageUrl, _setImageUrl] = Retool.useStateString({
    name: 'imageUrl'
  })
  const [cursorSize, _setCursorSize] = Retool.useStateNumber({
    name: 'cursorSize'
  })
  const [maskUrl, _setMaskUrl] = Retool.useStateString({
    name: 'maskUrl',
    inspector: "hidden"
  })
  const onClick = Retool.useEventCallback({ 
    name: "click"
  });
  function handleClick() {
    _setMaskUrl(toMask(canvas.current))
    onClick()
  }

  return <>
      <MaskEditor
        src={imageUrl}
        canvasRef={canvas}
        maskColor="#bdff05"
        cursorSize={cursorSize}
      />
      <button
        onClick={handleClick}
      >
        Get Mask
      </button>
    </>
}

export const HelloWorld: FC = () => {
  const [name, _setName] = Retool.useStateString({
    name: 'name'
  })

  return (
    <div>
      <div>Hello {name}!</div>
    </div>
  )
}
