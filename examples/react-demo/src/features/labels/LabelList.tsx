import React, { useState, useMemo } from 'react';
import type { StickerLayout } from 'qrlayout-ui';
import { Plus, Layout, Smartphone, Search, X } from 'lucide-react';
import { Table, type Column } from '../../components/Table';

interface LabelListProps {
    labels: StickerLayout[];
    onCreateNew: () => void;
    onEdit: (label: StickerLayout) => void;
    onDelete: (id: string) => void;
}

export const LabelList: React.FC<LabelListProps> = ({
    labels,
    onCreateNew,
    onEdit,
    onDelete
}) => {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        if (!query.trim()) return labels;
        const q = query.toLowerCase();
        return labels.filter(l => l.name.toLowerCase().includes(q));
    }, [labels, query]);

    const handleDelete = (label: StickerLayout) => {
        if (confirm(`确定要删除 "${label.name}" 吗？`)) {
            onDelete(label.id);
        }
    };

    const columns: Column<StickerLayout>[] = [
        {
            header: '模板名称',
            accessorKey: 'name',
            render: (_val, item) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <Layout size={20} />
                    </div>
                    <div className="font-semibold text-gray-900">{item.name}</div>
                </div>
            )
        },
        {
            header: '目标实体',
            accessorKey: 'targetEntity',
            render: (val: string) => (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize border border-gray-200">
                    <Smartphone size={12} />
                    {val || "无"}
                </span>
            )
        },
        {
            header: '尺寸',
            accessorKey: 'width',
            render: (_val, item) => (
                <span className="text-gray-600 text-sm font-mono">
                    {item.width}{item.unit} × {item.height}{item.unit}
                </span>
            )
        },
        {
            header: '元素',
            accessorKey: 'elements',
            render: (val: any[]) => (
                <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100 text-sm text-gray-600">
                    {val.length} 个元素
                </span>
            )
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">标签模板</h1>
                    <p className="text-gray-500 mt-1">设计和管理您的条码布局</p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                >
                    <Plus size={20} />
                    <span>新建标签</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="搜索标签模板名称..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded cursor-pointer">
                            <X size={14} className="text-gray-400" />
                        </button>
                    )}
                </div>
                {query && (
                    <p className="text-xs text-gray-400 mt-1.5 ml-1">
                        找到 {filtered.length} 个匹配
                    </p>
                )}
            </div>

            {/* Content Table */}
            <Table
                data={filtered}
                columns={columns}
                keyField="id"
                onEdit={onEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};
