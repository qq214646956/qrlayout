import { useState, useEffect, useRef } from 'react';
import { Plus, X, Printer, FileText, Image as ImageIcon, Info } from 'lucide-react';
import { storage, type Machine } from '../../services/storage';
import { Table, type Column } from '../../components/Table';
import { StickerPrinter } from 'qrlayout-core';
import { exportToPNG, exportToBatchPDF, exportToZPLFile } from '../../services/exportUtils';
import type { StickerLayout } from 'qrlayout-ui';

export function MachineMaster() {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [labels, setLabels] = useState<StickerLayout[]>([]);
    const [selectedLayoutId, setSelectedLayoutId] = useState<string>('');

    const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
    const printer = useRef(new StickerPrinter());

    const [formData, setFormData] = useState<Partial<Machine>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setMachines(storage.getMachines());
        const loadedLabels = storage.getLabels();
        const machineLabels = loadedLabels.filter(l => l.targetEntity === 'machine');
        setLabels(machineLabels);
        if (machineLabels.length > 0 && !selectedLayoutId) {
            setSelectedLayoutId(machineLabels[0].id);
        }
    };

    const handleOpenModal = (machine?: Machine) => {
        if (machine) {
            setEditingMachine(machine);
            setFormData(machine);
        } else {
            setEditingMachine(null);
            setFormData({});
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMachine(null);
        setFormData({});
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.machineName || !formData.machineCode) return;

        const machine: Machine = {
            id: editingMachine?.id || crypto.randomUUID(),
            machineName: formData.machineName,
            machineCode: formData.machineCode,
            location: formData.location || '',
            model: formData.model || ''
        };

        storage.addMachine(machine);
        loadData();
        handleCloseModal();
    };

    const handleDelete = (machine: Machine) => {
        if (window.confirm(`确定要删除 ${machine.machineName} 吗？`)) {
            storage.deleteMachine(machine.id);
            loadData();
            setSelectedMachineIds(prev => prev.filter(id => id !== machine.id));
        }
    };

    const getSelectedMachines = () => {
        return machines.filter(m => selectedMachineIds.includes(m.id));
    };

    const getActiveLayout = () => {
        return labels.find(l => l.id === selectedLayoutId);
    };

    const handleExportPNG = async () => {
        const layout = getActiveLayout();
        const selected = getSelectedMachines();
        if (!layout) return;
        await exportToPNG({ layout, items: selected, printer: printer.current, baseFilename: 'machine-label' });
    };

    const handleExportPDF = async () => {
        const layout = getActiveLayout();
        const selected = getSelectedMachines();
        if (!layout) return;
        await exportToBatchPDF({ layout, items: selected, printer: printer.current, baseFilename: 'batch-machine-labels' });
    };

    const handleExportZPL = () => {
        const layout = getActiveLayout();
        const selected = getSelectedMachines();
        if (!layout) return;
        exportToZPLFile({ layout, items: selected, printer: printer.current, baseFilename: 'batch-machine-labels' });
    };

    const columns: Column<Machine>[] = [
        { header: '设备编号', accessorKey: 'machineCode' },
        { header: '设备名称', accessorKey: 'machineName' },
        { header: '位置', accessorKey: 'location' },
        { header: '型号', accessorKey: 'model' },
    ];

    const hasSelection = selectedMachineIds.length > 0;
    const hasLayout = !!selectedLayoutId;

    return (
        <div className="max-w-7xl mx-auto px-8 py-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">设备主数据</h2>
                    <p className="text-gray-500">管理设备信息并打印资产标签</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm cursor-pointer"
                            value={selectedLayoutId}
                            onChange={(e) => setSelectedLayoutId(e.target.value)}
                        >
                            <option value="" disabled>选择布局模板</option>
                            {labels.map(label => (
                                <option key={label.id} value={label.id}>{label.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>

                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm cursor-pointer"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">添加设备</span>
                    </button>
                </div>
            </div>

            {!hasSelection && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3 animate-in fade-in">
                    <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-blue-900">
                        <p className="font-semibold">批量导出说明：</p>
                        <ol className="list-decimal ml-4 mt-1 space-y-0.5 text-blue-800">
                            <li>从上方下拉菜单中<strong>选择布局模板</strong>。</li>
                            <li>勾选表格中的一个或多个设备。</li>
                            <li>点击出现的<strong>导出</strong>按钮（PNG、PDF 或 ZPL）生成标签。</li>
                        </ol>
                    </div>
                </div>
            )}

            {hasSelection && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-indigo-900">
                        <span className="font-semibold bg-indigo-100 px-2 py-0.5 rounded text-sm">{selectedMachineIds.length}</span>
                        <span className="font-medium">已选中</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleExportPNG} disabled={!hasLayout} className="flex items-center gap-2 bg-white text-gray-700 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" title="下载为 PNG 图片"><ImageIcon size={16} />PNG</button>
                        <button onClick={handleExportPDF} disabled={!hasLayout} className="flex items-center gap-2 bg-white text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" title="下载为 PDF"><FileText size={16} />PDF</button>
                        <button onClick={handleExportZPL} disabled={!hasLayout} className="flex items-center gap-2 bg-white text-gray-700 hover:text-black border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" title="生成 ZPL 代码"><Printer size={16} />ZPL</button>
                    </div>
                </div>
            )}

            <Table data={machines} columns={columns} keyField="id" onEdit={handleOpenModal} onDelete={handleDelete} selectedIds={selectedMachineIds} onSelectionChange={setSelectedMachineIds} />

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingMachine ? '编辑设备' : '添加新设备'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">设备名称</label>
                                <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" value={formData.machineName || ''} onChange={e => setFormData({ ...formData, machineName: e.target.value })} placeholder="例如：CNC 铣床" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">设备编号</label>
                                <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" value={formData.machineCode || ''} onChange={e => setFormData({ ...formData, machineCode: e.target.value })} placeholder="例如：MC-101" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">位置</label>
                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="例如：车间 A 区" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">型号</label>
                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" value={formData.model || ''} onChange={e => setFormData({ ...formData, model: e.target.value })} placeholder="例如：XYZ-2000" />
                            </div>
                            <div className="flex gap-3 pt-4 mt-2">
                                <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors cursor-pointer">取消</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors cursor-pointer">保存更改</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
