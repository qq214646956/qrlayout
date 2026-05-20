import { StickerPrinter } from 'qrlayout-core';
import { exportToPDF } from 'qrlayout-core/pdf';
import type { StickerLayout } from 'qrlayout-ui';

export interface ExportOptions {
    layout: StickerLayout;
    items: any[];
    printer: StickerPrinter;
    baseFilename: string;
}

export async function exportToPNG(options: ExportOptions): Promise<void> {
    const { layout, items, printer, baseFilename } = options;

    if (!layout || items.length === 0) {
        console.warn('无法导出 PNG：缺少布局或数据项');
        return;
    }

    for (const item of items) {
        const dataUrl = await printer.renderToDataURL(layout, item, { format: 'png' });

        const link = document.createElement('a');
        link.download = `${baseFilename}-${item.id || Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    }
}

export async function exportToBatchPDF(options: ExportOptions): Promise<void> {
    const { layout, items, baseFilename } = options;

    if (!layout || items.length === 0) {
        console.warn('无法导出 PDF：缺少布局或数据项');
        return;
    }

    const pdf = await exportToPDF(layout, items);
    pdf.save(`${baseFilename}-${Date.now()}.pdf`);
}

export function exportToZPLFile(options: ExportOptions): void {
    const { layout, items, printer, baseFilename } = options;

    if (!layout || items.length === 0) {
        console.warn('无法导出 ZPL：缺少布局或数据项');
        return;
    }

    const zplArray = printer.exportToZPL(layout, items);
    const zplContent = zplArray.join('\n');

    console.log('已生成 ZPL 代码：', zplContent);

    const blob = new Blob([zplContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseFilename}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
}
