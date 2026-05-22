import JsBarcode from "jsbarcode";

const barcodeCache = new Map<string, string>();

export async function generateBarcode(
    text: string,
    format: string = "CODE128"
): Promise<string> {
    const cacheKey = `${format}:${text}`;
    if (barcodeCache.has(cacheKey)) {
        return barcodeCache.get(cacheKey)!;
    }
    try {
        const canvas = document.createElement("canvas");
        JsBarcode(canvas, text, {
            format: format as any,
            displayValue: false,
            margin: 1,
            background: "#ffffff",
            lineColor: "#000000",
        });
        const url = canvas.toDataURL("image/png");
        barcodeCache.set(cacheKey, url);
        return url;
    } catch (err) {
        console.error("Error generating barcode", err);
        return "";
    }
}
