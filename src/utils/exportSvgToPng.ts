export function exportSvgToPng(svgElement: SVGSVGElement, fileName: string) {
  const svgData = new XMLSerializer().serializeToString(svgElement);

  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob!);
      a.download = `${fileName}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  img.src = url;
}
