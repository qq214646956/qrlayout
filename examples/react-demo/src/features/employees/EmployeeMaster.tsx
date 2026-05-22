import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, RefreshCw, AlertCircle, Download, RotateCcw, Printer, FileText, Image as ImageIcon, Info, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Settings2, Eye } from 'lucide-react';
import { SearchableSelect } from '../../components/SearchableSelect';
import { PreviewModal } from '../../components/PreviewModal';
import { StickerPrinter } from 'qrlayout-core';
import { storage } from '../../services/storage';
import { exportToPNG, exportToBatchPDF, exportToZPLFile } from '../../services/exportUtils';
import type { StickerLayout } from 'qrlayout-ui';

const API_BASE = 'http://localhost:5000';
const CACHE_KEY = 'delivery_data_cache';
const COLUMN_ORDER_KEY = 'delivery_column_order';

const WBSTK_OPTIONS = [
    { value: '', label: '全部' },
    { value: '1', label: '已过账' },
    { value: '2', label: '未过账' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const FIELD_LABELS: Record<string, string> = {
    KUNNR: '客户编码', NAME1: '客户名称', VBELN: '交货单号', POSNR: '交货单行号',
    VGBEL: '销售凭证', VGPOS: '销售凭证项目号', WADAT_IST: '过账日期',
    MATNR: '物料编码', MAKTX: '物料描述', GROES: '规格型号',
    ZBZCD: '标长(M)', ZBZKD: '标宽（MM）', ZBZHD: '标厚（MM）',
    ZBZBZ: '比重', ZBZZL: '标重', ZHYZL: '行重', ZFZDW: '辅助单位',
    KDMAT: '客户物料', ARKTX: '销售订单项目短文本',
    LFIMG: '实际已交系统重量', LFIMG_HY: '实际已交行业重量',
    MEINS: '单位', CHARG: '批次编号', ZFZSL: '辅助数量',
    ZBZCD2: '行业长度(M)', ZBZKD2: '行业宽度（MM）',
    SORTL: '客户简称', PM: '品名', ERDAT: '创建日期',
    USERNAME: '过账人',
};

type DataRow = Record<string, any>;

interface CacheData {
    data: DataRow[];
    columnKeys: string[];
    ivWbstk: string;
    ivCustName: string;
    ivWadatFrom: string;
    ivWadatTo: string;
    ivErdatFrom: string;
    ivErdatTo: string;
}

function loadCache(): CacheData | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function saveCache(c: CacheData) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
}

function clearCache() {
    localStorage.removeItem(CACHE_KEY);
}

function loadColumnOrder(): string[] {
    try {
        const raw = localStorage.getItem(COLUMN_ORDER_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveColumnOrder(keys: string[]) {
    localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(keys));
}

export function EmployeeMaster() {
    const cache = useRef(loadCache());
    const savedOrder = useRef(loadColumnOrder());

    const [ivWbstk, setIvWbstk] = useState(cache.current?.ivWbstk ?? '');
    const [ivCustName, setIvCustName] = useState(cache.current?.ivCustName ?? '');
    const [ivWadatFrom, setIvWadatFrom] = useState(cache.current?.ivWadatFrom ?? '');
    const [ivWadatTo, setIvWadatTo] = useState(cache.current?.ivWadatTo ?? '');
    const [ivErdatFrom, setIvErdatFrom] = useState(cache.current?.ivErdatFrom ?? '');
    const [ivErdatTo, setIvErdatTo] = useState(cache.current?.ivErdatTo ?? '');

    const [data, setData] = useState<DataRow[]>(cache.current?.data ?? []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(!!cache.current);

    const [labels, setLabels] = useState<StickerLayout[]>([]);
    const [selectedLayoutId, setSelectedLayoutId] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [showColumnSettings, setShowColumnSettings] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const printer = useRef(new StickerPrinter());
    const dataRef = useRef(data);
    dataRef.current = data;

    // Inline editing state
    const [editingCell, setEditingCell] = useState<{ rowIdx: number; colKey: string } | null>(null);
    const [editValue, setEditValue] = useState('');
    const [modifiedCells, setModifiedCells] = useState<Set<string>>(new Set());
    const editInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        storage.initializeDefaults();
        const loadedLabels = storage.getLabels();
        const deliveryLabels = loadedLabels.filter(l => l.targetEntity === 'delivery');
        setLabels(deliveryLabels);
        if (deliveryLabels.length > 0) {
            setSelectedLayoutId(deliveryLabels[0].id);
        }
    }, []);

    // Derived column keys from data, respecting saved order
    const allKeys = useMemo(() => {
        if (data.length === 0) return [];
        const dataKeys = Object.keys(data[0]);
        const ordered = savedOrder.current.filter(k => dataKeys.includes(k));
        const newKeys = dataKeys.filter(k => !ordered.includes(k));
        return [...ordered, ...newKeys];
    }, [data]);

    const columns = useMemo(() =>
        allKeys.map(key => ({ key, label: FIELD_LABELS[key] || key })),
    [allKeys]);

    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const pageData = useMemo(() =>
        data.slice((safePage - 1) * pageSize, safePage * pageSize),
    [data, safePage, pageSize]);

    // Ensure page in range when data changes
    useEffect(() => { setPage(p => Math.min(p, totalPages)); }, [totalPages]);

    // Persist cache whenever data + search params change
    useEffect(() => {
        if (data.length > 0) {
            saveCache({ data, columnKeys: allKeys, ivWbstk, ivCustName, ivWadatFrom, ivWadatTo, ivErdatFrom, ivErdatTo });
        }
    }, [data, allKeys, ivWbstk, ivCustName, ivWadatFrom, ivWadatTo, ivErdatFrom, ivErdatTo]);

    const moveColumn = useCallback((fromIdx: number, direction: -1 | 1) => {
        const toIdx = fromIdx + direction;
        if (toIdx < 0 || toIdx >= allKeys.length) return;
        const newOrder = [...allKeys];
        [newOrder[fromIdx], newOrder[toIdx]] = [newOrder[toIdx], newOrder[fromIdx]];
        savedOrder.current = newOrder;
        saveColumnOrder(newOrder);
        setShowColumnSettings(false);
        // Force re-render by updating data reference
        setData([...data]);
    }, [allKeys, data]);

    const toSapDate = (dateStr: string) => dateStr.replace(/-/g, '');

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        setHasSearched(true);
        setSelectedIds(new Set());
        setPage(1);
        setModifiedCells(new Set());
        setEditingCell(null);

        try {
            const params = new URLSearchParams();
            if (ivWbstk) params.set('iv_wbstk', ivWbstk);
            if (ivCustName) params.set('iv_cust_name', ivCustName);
            if (ivWadatFrom) params.set('iv_wadat_from', toSapDate(ivWadatFrom));
            if (ivWadatTo) params.set('iv_wadat_to', toSapDate(ivWadatTo));
            if (ivErdatFrom) params.set('iv_erdat_from', toSapDate(ivErdatFrom));
            if (ivErdatTo) params.set('iv_erdat_to', toSapDate(ivErdatTo));

            const res = await fetch(`${API_BASE}/api/delivery-details?${params.toString()}`);
            const json = await res.json();

            if (!json.success) {
                setError(json.message || '查询失败');
                setData([]);
                clearCache();
            } else {
                setData(json.data || []);
            }
        } catch (e) {
            setError(`无法连接到后端服务 (${API_BASE})，请确保 sap_server.py 已启动`);
            setData([]);
            clearCache();
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setIvWbstk('');
        setIvCustName('');
        setIvWadatFrom('');
        setIvWadatTo('');
        setIvErdatFrom('');
        setIvErdatTo('');
        setData([]);
        setError('');
        setHasSearched(false);
        setSelectedIds(new Set());
        setPage(1);
        setModifiedCells(new Set());
        setEditingCell(null);
        clearCache();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const formatValue = (value: any): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'number') {
            if (Number.isInteger(value)) return value.toString();
            return value.toFixed(3);
        }
        return String(value);
    };

    // --- Inline editing handlers ---
    const handleCellDoubleClick = (rowIdx: number, colKey: string, currentValue: string) => {
        setEditingCell({ rowIdx, colKey });
        setEditValue(currentValue);
        setTimeout(() => editInputRef.current?.focus(), 0);
    };

    const commitEdit = () => {
        if (!editingCell) return;
        const { rowIdx, colKey } = editingCell;
        const original = data[rowIdx][colKey];
        const trimmed = editValue.trim();

        if (String(original ?? '') !== trimmed) {
            const nextData = [...dataRef.current];
            nextData[rowIdx] = { ...nextData[rowIdx], [colKey]: trimmed };
            dataRef.current = nextData;
            setData(nextData);
            setModifiedCells(prev => {
                const next = new Set(prev);
                next.add(`${rowIdx}:${colKey}`);
                return next;
            });
        }
        setEditingCell(null);
    };

    const cancelEdit = () => {
        setEditingCell(null);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') commitEdit();
        if (e.key === 'Escape') cancelEdit();
    };    const toggleSelect = (globalIdx: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(globalIdx)) next.delete(globalIdx);
            else next.add(globalIdx);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === data.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(data.map((_, i) => i)));
        }
    };

    const getSelectedItems = () => dataRef.current.filter((_, i) => selectedIds.has(i));
    const activeLayout = labels.find(l => l.id === selectedLayoutId);
    const hasSelection = selectedIds.size > 0;
    const hasLayout = !!selectedLayoutId;

    const handleExportPNG = async () => {
        if (!activeLayout) return;
        await exportToPNG({ layout: activeLayout, items: getSelectedItems(), printer: printer.current, baseFilename: 'delivery-label' });
    };

    const handleExportPDF = async () => {
        if (!activeLayout) return;
        await exportToBatchPDF({ layout: activeLayout, items: getSelectedItems(), printer: printer.current, baseFilename: 'delivery-labels' });
    };

    const handleExportZPL = () => {
        if (!activeLayout) return;
        exportToZPLFile({ layout: activeLayout, items: getSelectedItems(), printer: printer.current, baseFilename: 'delivery-labels' });
    };

    const handleDirectPrint = async () => {
        if (!activeLayout) return;
        const items = getSelectedItems();
        if (items.length === 0) return;

        const win = window.open('', '_blank', `width=800,height=600`);
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

        for (let i = 0; i < items.length; i++) {
            const canvas = win.document.createElement('canvas');
            const page = win.document.createElement('div');
            page.className = 'page';
            page.appendChild(canvas);
            win.document.body.appendChild(page);
            await printer.current.renderToCanvas(activeLayout, items[i], canvas);
        }

        const tip = Object.assign(win.document.createElement('div'), {
            className: 'noprint',
            style: 'text-align:center;padding:20px;color:#999;font-size:12px',
            textContent: `共 ${items.length} 张标签 — 选择打印机后点击打印`
        });
        win.document.body.appendChild(tip);

        setTimeout(() => { win.print(); }, 300);
    };

    const exportToCSV = () => {
        if (columns.length === 0) return;
        const header = columns.map(c => c.label).join(',');
        const rows = dataRef.current.map(row =>
            columns.map(c => `"${formatValue(row[c.key]).replace(/"/g, '""')}"`).join(',')
        );
        const csv = '﻿' + [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `发货明细_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-500">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">地博出货数据</h2>
                <p className="text-gray-500 mt-1">发货明细查询（基于交货单 LIKP+LIPS）</p>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">过账状态</label>
                        <select className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
                            value={ivWbstk} onChange={e => setIvWbstk(e.target.value)}>
                            {WBSTK_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">客户名称</label>
                        <input type="text" className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            value={ivCustName} onChange={e => setIvCustName(e.target.value)} onKeyDown={handleKeyDown} placeholder="模糊匹配" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">发货日期从</label>
                        <input type="date" className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            value={ivWadatFrom} onChange={e => setIvWadatFrom(e.target.value)} onKeyDown={handleKeyDown} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">发货日期到</label>
                        <input type="date" className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            value={ivWadatTo} onChange={e => setIvWadatTo(e.target.value)} onKeyDown={handleKeyDown} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">创建日期从</label>
                        <input type="date" className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            value={ivErdatFrom} onChange={e => setIvErdatFrom(e.target.value)} onKeyDown={handleKeyDown} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">创建日期到</label>
                        <input type="date" className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            value={ivErdatTo} onChange={e => setIvErdatTo(e.target.value)} onKeyDown={handleKeyDown} />
                    </div>
                    <button onClick={handleSearch} disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed">
                        {loading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />} 查询
                    </button>
                    <button onClick={handleReset}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer">
                        <RotateCcw size={16} /> 重置
                    </button>
                    {data.length > 0 && (
                        <button onClick={exportToCSV}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm cursor-pointer">
                            <Download size={18} /> 导出 CSV
                        </button>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-red-800">{error}</div>
                </div>
            )}

            {/* Empty state */}
            {hasSearched && !loading && !error && data.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 flex flex-col items-center justify-center py-16 text-gray-400">
                    <Search size={48} strokeWidth={1.5} />
                    <p className="mt-4 text-lg font-medium text-gray-500">未查询到数据</p>
                    <p className="text-sm mt-1">请调整查询条件后重试</p>
                </div>
            )}

            {/* Results */}
            {data.length > 0 && (
                <>
                    {/* Print guide + batch bar */}
                    {!hasSelection ? (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                            <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
                            <div className="text-sm text-blue-900">
                                <p className="font-semibold">批量打印说明：</p>
                                <ol className="list-decimal ml-4 mt-1 space-y-0.5 text-blue-800">
                                    <li>从下方下拉菜单中<strong>选择打印布局模板</strong></li>
                                    <li>勾选表格中的行</li>
                                    <li>点击<strong>「预览」</strong>查看效果，再选择下载格式</li>
                                </ol>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold bg-indigo-100 px-2 py-0.5 rounded text-indigo-900 text-sm">{selectedIds.size} 行已选</span>
                                <SearchableSelect
                                    options={labels.map(l => ({ value: l.id, label: l.name }))}
                                    value={selectedLayoutId}
                                    onChange={setSelectedLayoutId}
                                    placeholder="搜索打印模板..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowPreview(true)} disabled={!hasLayout}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                    <Eye size={16} /> 预览
                                </button>
                                <button onClick={handleExportPNG} disabled={!hasLayout}
                                    className="flex items-center gap-2 bg-white text-gray-700 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                    <ImageIcon size={16} /> PNG
                                </button>
                                <button onClick={handleExportPDF} disabled={!hasLayout}
                                    className="flex items-center gap-2 bg-white text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                    <FileText size={16} /> PDF
                                </button>
                                <button onClick={handleExportZPL} disabled={!hasLayout}
                                    className="flex items-center gap-2 bg-white text-gray-700 hover:text-black border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                    <Printer size={16} /> ZPL
                                </button>
                                <button onClick={handleDirectPrint} disabled={!hasLayout}
                                    className="flex items-center gap-2 bg-white text-green-700 hover:text-green-800 border border-green-300 hover:border-green-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                    <Printer size={16} /> 直接打印
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table toolbar: record count + column settings + page size */}
                    <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 border-b-0">
                        <div className="flex flex-wrap items-center justify-between px-4 py-2 gap-2">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600">
                                    共 <span className="font-semibold text-gray-900">{data.length}</span> 条记录
                                </span>
                                {modifiedCells.size > 0 && (
                                    <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                                        已修改 {modifiedCells.size} 处
                                    </span>
                                )}
                                <span className="text-xs text-gray-400 hidden sm:inline">双击单元格可编辑</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Page size selector */}
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                    <span>每页</span>
                                    <select className="appearance-none bg-white border border-gray-300 text-gray-700 pl-2 pr-6 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                                        {PAGE_SIZE_OPTIONS.map(n => (<option key={n} value={n}>{n}</option>))}
                                    </select>
                                    <span>条</span>
                                </div>
                                {/* Column settings */}
                                <div className="relative">
                                    <button onClick={() => setShowColumnSettings(!showColumnSettings)}
                                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer">
                                        <Settings2 size={14} /> 列设置
                                    </button>
                                    {showColumnSettings && (
                                        <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-64 max-h-80 overflow-y-auto">
                                            <div className="px-3 py-2 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">拖拽调整列顺序</div>
                                            {allKeys.map((key, idx) => (
                                                <div key={key} className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 text-sm">
                                                    <span className="text-gray-700 truncate">{FIELD_LABELS[key] || key}</span>
                                                    <div className="flex items-center gap-0.5 shrink-0">
                                                        <button disabled={idx === 0}
                                                            onClick={() => moveColumn(idx, -1)}
                                                            className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                                                            <ChevronUp size={14} />
                                                        </button>
                                                        <button disabled={idx === allKeys.length - 1}
                                                            onClick={() => moveColumn(idx, 1)}
                                                            className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                                                            <ChevronDown size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 border-t-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="px-3 py-3 font-semibold border-b border-gray-200 sticky left-0 bg-gray-50 z-10 w-10">
                                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={data.length > 0 && selectedIds.size === data.length}
                                                ref={el => { if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < data.length; }}
                                                onChange={toggleSelectAll} />
                                        </th>
                                        <th className="px-3 py-3 font-semibold border-b border-gray-200 sticky left-10 bg-gray-50 z-10">#</th>
                                        {columns.map(col => (
                                            <th key={col.key} className="px-3 py-3 font-semibold border-b border-gray-200 whitespace-nowrap">{col.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pageData.map((row, pageIdx) => {
                                        const globalIdx = (safePage - 1) * pageSize + pageIdx;
                                        const isSelected = selectedIds.has(globalIdx);
                                        return (
                                            <tr key={globalIdx} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                                                <td className="px-3 py-2.5 sticky left-0 bg-white">
                                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        checked={isSelected} onChange={() => toggleSelect(globalIdx)} />
                                                </td>
                                                <td className="px-3 py-2.5 text-gray-400 text-xs sticky left-10 bg-white">{globalIdx + 1}</td>
                                                {columns.map(col => {
                                                    const cellKey = `${globalIdx}:${col.key}`;
                                                    const isEditing = editingCell?.rowIdx === globalIdx && editingCell?.colKey === col.key;
                                                    const isModified = modifiedCells.has(cellKey);
                                                    return (
                                                        <td
                                                            key={col.key}
                                                            className={`px-3 py-2.5 whitespace-nowrap text-gray-700 select-none ${isModified ? 'bg-yellow-100' : ''}`}
                                                            onDoubleClick={() => handleCellDoubleClick(globalIdx, col.key, formatValue(row[col.key]))}
                                                        >
                                                            {isEditing ? (
                                                                <input
                                                                    ref={editInputRef}
                                                                    type="text"
                                                                    className="w-full min-w-[80px] px-1.5 py-0.5 border border-blue-400 rounded text-sm outline-none ring-2 ring-blue-200 bg-white"
                                                                    value={editValue}
                                                                    onChange={e => setEditValue(e.target.value)}
                                                                    onKeyDown={handleEditKeyDown}
                                                                    onBlur={commitEdit}
                                                                />
                                                            ) : (
                                                                formatValue(row[col.key])
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-wrap items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <span className="text-sm text-gray-500">
                                第 {safePage} / {totalPages} 页，显示 {(safePage - 1) * pageSize + 1} - {Math.min(safePage * pageSize, data.length)} 条
                            </span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setPage(1)} disabled={safePage === 1}
                                    className="px-2 py-1.5 text-sm rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">首页</button>
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                                    className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                                    .reduce<(number | 'gap')[]>((acc, p, idx, arr) => {
                                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('gap');
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, i) => p === 'gap'
                                        ? <span key={`gap-${i}`} className="px-1 text-gray-400">...</span>
                                        : <button key={p} onClick={() => setPage(p as number)}
                                            className={`w-8 h-8 text-sm rounded cursor-pointer ${safePage === p ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 text-gray-700'}`}>
                                            {p}
                                        </button>)
                                }
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                                    className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                                    <ChevronRight size={16} />
                                </button>
                                <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}
                                    className="px-2 py-1.5 text-sm rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">末页</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Preview Modal */}
            {showPreview && activeLayout && (
                <PreviewModal
                    layout={activeLayout}
                    items={getSelectedItems()}
                    printer={printer.current}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </div>
    );
}
