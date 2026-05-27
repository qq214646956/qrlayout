import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Download, Printer, Image as ImageIcon } from 'lucide-react';
import { StickerPrinter } from 'qrlayout-core';
import type { StickerLayout } from 'qrlayout-ui';
import { exportToPNG, exportToZPLFile } from '../services/exportUtils';

interface Props {
    layout: StickerLayout;
    items: Record<string, any>[];
    printer: StickerPrinter;
    onClose: () => void;
}

export function PreviewModal({ layout, items, printer, onClose }: Props) {
    const [idx, setIdx] = useState(0);
    const [previewUrl, setPreviewUrl] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const total = items.length;
    const item = items[idx];

    const renderPreview = useCallback(async () => {
        if (!canvasRef.current) return;
        try {
            const url = await printer.renderToDataURL(layout, item, { canvas: canvasRef.current, format: 'png' });
            setPreviewUrl(url);
        } catch (err) {
            console.error('预览渲染失败', err);
        }
    }, [layout, item, printer]);

    useEffect(() => { renderPreview(); }, [renderPreview]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && idx > 0) setIdx(i => i - 1);
            if (e.key === 'ArrowRight' && idx < total - 1) setIdx(i => i + 1);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose, idx, total]);

    const handleDownloadPNG = () => {
        exportToPNG({ layout, items: [item], printer, baseFilename: 'delivery-label' });
    };

    // PDF 暂不可用（中文乱码问题）
    // const handleDownloadPDF = async () => {
    //     await exportToBatchPDF({ layout, items: [item], printer, baseFilename: 'delivery-label' });
    // };

    const handleDownloadZPL = () => {
        exportToZPLFile({ layout, items: [item], printer, baseFilename: 'delivery-label' });
    };

    const handleBatchPNG = async () => {
        await exportToPNG({ layout, items, printer, baseFilename: 'delivery-label' });
    };

    // PDF 暂不可用（中文乱码问题）
    // const handleBatchPDF = async () => {
    //     await exportToBatchPDF({ layout, items, printer, baseFilename: 'delivery-labels' });
    // };

    const handleBatchZPL = () => {
        exportToZPLFile({ layout, items, printer, baseFilename: 'delivery-labels' });
    };

    const handleDirectPrint = async (single: boolean) => {
        const printItems = single ? [item] : items;
        const win = window.open('', '_blank', 'width=800,height=600');
        if (!win) return;
        win.document.write(`
            <html><head><title></title>
            <style>
                *{margin:0;padding:0;box-sizing:border-box}
                body{display:flex;flex-wrap:wrap;justify-content:center;padding:0}
                .page{page-break-after:always;display:flex;justify-content:center;align-items:center;padding:0}
                canvas{max-width:100%}
                .noprint{display:block}
                @media print{
                    .page{page-break-after:always}
                    .noprint{display:none!important}
                    @page{margin:0}
                    body{padding:0}
                }
            </style></head><body></body></html>
        `);
        win.document.close();
        for (let i = 0; i < printItems.length; i++) {
            const canvas = win.document.createElement('canvas');
            const page = win.document.createElement('div');
            page.className = 'page';
            page.appendChild(canvas);
            win.document.body.appendChild(page);
            await printer.renderToCanvas(layout, printItems[i], canvas);
        }
        const tip = Object.assign(win.document.createElement('div'), {
            className: 'noprint',
            style: 'text-align:center;padding:20px;color:#999;font-size:12px',
            textContent: `共 ${printItems.length} 张标签 — 选择打印机后点击打印`
        });
        win.document.body.appendChild(tip);
        setTimeout(() => { win.print(); }, 300);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-[640px] max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Eye size={20} className="text-indigo-500" />
                        <span className="font-semibold text-gray-900">标签打印预览</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{layout.name}</span>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>

                {/* Preview Canvas */}
                <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-6">
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <canvas ref={canvasRef} className="max-w-full" style={{ display: previewUrl ? 'none' : 'block' }} />
                        {previewUrl && (
                            <img src={previewUrl} alt="标签预览" className="max-w-full h-auto" style={{ maxHeight: '380px' }} />
                        )}
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-3 px-6 py-3 border-t border-gray-100 bg-gray-50">
                    <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
                        className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
                        第 {idx + 1} / {total} 张
                    </span>
                    <button onClick={() => setIdx(i => Math.min(total - 1, i + 1))} disabled={idx === total - 1}
                        className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 space-y-2">
                    <div className="text-xs font-medium text-gray-500 mb-1">当前（第 {idx + 1} 张）：</div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => handleDirectPrint(true)}
                            className="flex items-center gap-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer">
                            <Printer size={15} /> 直接打印
                        </button>
                        <button onClick={handleDownloadPNG}
                            className="flex items-center gap-1.5 bg-white text-gray-700 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer">
                            <ImageIcon size={15} /> PNG
                        </button>
{/* PDF 暂不可用（中文乱码问题）
                        <button onClick={handleDownloadPDF}
                            className="flex items-center gap-1.5 bg-white text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer">
                            <FileText size={15} /> PDF
                        </button>
                        */}
                        <button onClick={handleDownloadZPL}
                            className="flex items-center gap-1.5 bg-white text-gray-700 hover:text-black border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer">
                            <Printer size={15} /> ZPL
                        </button>
                    </div>
                    {total > 1 && (
                        <>
                            <div className="text-xs font-medium text-gray-500 mb-1 mt-2">全部 {total} 张：</div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <button onClick={() => handleDirectPrint(false)}
                                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer">
                                    <Printer size={15} /> 全部打印
                                </button>
                                <button onClick={handleBatchPNG}
                                    className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer">
                                    <Download size={15} /> 全部 PNG
                                </button>
{/* PDF 暂不可用（中文乱码问题）
                                <button onClick={handleBatchPDF}
                                    className="flex items-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer">
                                    <Download size={15} /> 全部 PDF
                                </button>
                                */}
                                <button onClick={handleBatchZPL}
                                    className="flex items-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer">
                                    <Download size={15} /> 全部 ZPL
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
