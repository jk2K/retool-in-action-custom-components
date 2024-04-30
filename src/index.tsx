import React from 'react'
import { type FC } from 'react'
import { MaskEditor, toMask, dataURLtoFile } from "./react-mask-editor/index";

import { Retool } from '@tryretool/custom-component-support'

export const ImageMaskEditor: FC = () => {
  Retool.useComponentSettings({
    defaultHeight: 50,
    defaultWidth: 5,
  });

  const maskCanvas = React.useRef<HTMLCanvasElement>() as React.MutableRefObject<HTMLCanvasElement>;
  const originCanvas = React.useRef<HTMLCanvasElement>() as React.MutableRefObject<HTMLCanvasElement>;
  const [imageUrl, _setImageUrl] = Retool.useStateString({
    name: 'imageUrl'
  })
  const [cursorSize, _setCursorSize] = Retool.useStateNumber({
    name: 'cursorSize'
  })
  const [maskFile, _setMaskFile] = Retool.useStateString({
    name: 'maskFile',
    inspector: "hidden"
  })
  const [imageFile, _setImageFile] = Retool.useStateString({
    name: 'imageFile',
    inspector: "hidden"
  })
  const onClick = Retool.useEventCallback({
    name: "click"
  });


  function handleClick() {
    let tmpMaskDataUrl = toMask(maskCanvas.current)
    let tmpMaskFile = dataURLtoFile(tmpMaskDataUrl)
    if (tmpMaskFile != null) {
      _setMaskFile(tmpMaskFile)
    }

    let tmpOriginDataUrl = originCanvas.current.toDataURL()
    let tmpOriginFile = dataURLtoFile(tmpOriginDataUrl)
    if (tmpOriginFile != null) {
      _setImageFile(tmpOriginFile)
    }
    onClick()
  }

  return <>
    <button
      onClick={handleClick}
      style={{
        marginBottom: "8px"
      }}
    >
      Get Mask
    </button>
    <MaskEditor
      src={imageUrl}
      maskCanvasRef={maskCanvas}
      canvasRef={originCanvas}
      maskColor="#bdff05"
      maskOpacity={0.75}
      cursorSize={cursorSize}
    />
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
