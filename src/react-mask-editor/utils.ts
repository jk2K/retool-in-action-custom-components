export const toMask = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    const size = {
      x: canvas.width,
      y: canvas.height,
    }
    console.log(size)
    const imageData = ctx?.getImageData(0, 0, size.x, size.y);
    const origData = Uint8ClampedArray.from(imageData.data);
    if (imageData) {
      for (var i = 0; i < imageData?.data.length; i += 4) {
        const pixelColor = (imageData.data[i] === 255) ? [0, 0, 0] : [255, 255, 255];
        imageData.data[i] = pixelColor[0];
        imageData.data[i + 1] = pixelColor[1];
        imageData.data[i + 2] = pixelColor[2];
        imageData.data[i + 3] = 255;
      }
      ctx?.putImageData(imageData, 0, 0);
    }
  
    const dataUrl = canvas.toDataURL();
    for (var i = 0; i < imageData?.data.length; i++) {
      imageData.data[i] = origData[i];
    }
    ctx.putImageData(imageData, 0, 0);
  
    return dataUrl;
  }
  
  export const hexToRgb = (color: string) => {
    var parts = color.replace("#", "").match(/.{1,2}/g);
    return parts.map(part => parseInt(part, 16));
  }

  export function dataURLtoFile(dataUrl: string) {
    var arr = dataUrl.split(',');
    if (arr.length < 1) {
      return
    }
    let mimeMatches = arr[0].match(/:(.*?);/)
    if (mimeMatches == null || mimeMatches.length < 2) {
      return
    }

    let mime = mimeMatches[1],
      bstr = atob(arr[arr.length - 1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return JSON.stringify({
      "name": mime.replace("/", "."),
      "type": mime,
      "base64Data": arr[arr.length - 1],
      "sizeBytes": u8arr.length
    });
  }