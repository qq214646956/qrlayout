import jsPDF from "jspdf";
import { StickerLayout, StickerData } from "./layout/schema";
import { generateQR } from "./qr/generator";
import { generateBarcode } from "./barcode/generator";

export type PdfDoc = InstanceType<typeof jsPDF>;

function parseContent(content: string, data: StickerData, separator?: string): string {
  let processed = content;
  if (separator) {
    processed = processed.replace(/\}\}\s*\{\{/g, `}}${separator}{{`);
  }
  return processed.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const trimmedKey = String(key).trim();
    return data[trimmedKey] !== undefined ? String(data[trimmedKey]) : "";
  });
}

async function resolveDataUrl(src: string): Promise<string | undefined> {
  if (!src) return undefined;
  if (src.startsWith("data:")) return src;
  if (typeof fetch === "undefined" || typeof FileReader === "undefined") return undefined;
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Could not resolve data URL", err);
    return undefined;
  }
}

function renderTextImage(
  text: string,
  fontSize: number,
  color: string,
  fontFamily: string,
  fontWeight: string | number,
  scale: number = 2,
): { url: string; w: number; h: number } {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const size = fontSize * scale;
  ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  const m = ctx.measureText(text);
  const tw = Math.ceil(m.width) + 4;
  const th = Math.ceil(size * 1.4);
  canvas.width = tw;
  canvas.height = th;
  ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.fillText(text, 2, 0);
  return { url: canvas.toDataURL("image/png"), w: tw / scale, h: th / scale };
}

export async function exportToPDF(
  layout: StickerLayout,
  dataList: Record<string, any>[]
): Promise<PdfDoc> {
  const validUnits = ["pt", "px", "in", "mm", "cm"];
  const pdfUnit = validUnits.includes(layout.unit) ? (layout.unit as any) : "mm";

  const doc = new jsPDF({
    orientation: layout.width > layout.height ? "l" : "p",
    unit: pdfUnit,
    format: [layout.width, layout.height]
  });

  // Unit conversion factor: px (at 96dpi) → layout unit
  const pxPerUnit = (() => {
    switch (pdfUnit) {
      case "mm": return 96 / 25.4;
      case "cm": return 96 / 2.54;
      case "in": return 96;
      case "pt": return 96 / 72;
      default: return 1;
    }
  })();

  for (let i = 0; i < dataList.length; i++) {
    if (i > 0) doc.addPage([layout.width, layout.height], layout.width > layout.height ? "l" : "p");

    const data = dataList[i];

    if (layout.backgroundColor) {
      doc.setFillColor(layout.backgroundColor);
      doc.rect(0, 0, layout.width, layout.height, "F");
    }
    if (layout.backgroundImage) {
      const dataUrl = await resolveDataUrl(layout.backgroundImage);
      if (dataUrl) {
        doc.addImage(dataUrl, "PNG", 0, 0, layout.width, layout.height);
      }
    }

    for (const element of layout.elements) {
      const filledContent = parseContent(
        element.content,
        data,
        element.type === "qr" ? element.qrSeparator : undefined
      );
      const { x, y, w, h } = element;

      if (element.type === "qr") {
        if (filledContent) {
          const qrUrl = await generateQR(filledContent);
          doc.addImage(qrUrl, "PNG", x, y, w, h);
        }
      } else if (element.type === "barcode") {
        if (filledContent) {
          const barcodeUrl = await generateBarcode(filledContent, element.barcodeFormat || "CODE128");
          doc.addImage(barcodeUrl, "PNG", x, y, w, h);
        }
      } else if (element.type === "image") {
        if (element.content) {
          doc.addImage(element.content, "PNG", x, y, w, h);
        }
      } else if (element.type === "text") {
        const style = element.style || {};
        const fontSize = style.fontSize || 12;
        const color = style.color || "#000000";
        const fontFamily = style.fontFamily || "sans-serif";
        const fontWeight = style.fontWeight || "normal";
        const align = style.textAlign || "left";
        const vAlign = style.verticalAlign || "top";

        // Always use canvas rendering to avoid CJK font issues in PDF
        const img = renderTextImage(filledContent, fontSize, color, fontFamily, fontWeight);
        const imgW = img.w / pxPerUnit;
        const imgH = img.h / pxPerUnit;

        let drawX = x;
        if (align === "center") drawX = x + (w - imgW) / 2;
        if (align === "right") drawX = x + w - imgW;

        let drawY = y;
        if (vAlign === "middle") drawY = y + (h - imgH) / 2;
        if (vAlign === "bottom") drawY = y + h - imgH;

        doc.addImage(img.url, "PNG", drawX, drawY, imgW, imgH);
      }
    }
  }

  return doc;
}
