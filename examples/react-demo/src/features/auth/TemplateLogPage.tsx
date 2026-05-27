import { useState, useEffect } from 'react';
import { Clock, FileEdit, Trash2, Plus } from 'lucide-react';

interface LogRecord {
    id: number;
    template_id: string;
    template_name: string;
    action: string;
    operator: string;
    created_at: string;
}

const ACTION_ICONS: Record<string, any> = { CREATE: Plus, UPDATE: FileEdit, DELETE: Trash2 };
const ACTION_LABELS: Record<string, string> = { CREATE: '新增', UPDATE: '修改', DELETE: '删除' };
const ACTION_COLORS: Record<string, string> = {
    CREATE: 'bg-green-50 text-green-700 border-green-200',
    UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
    DELETE: 'bg-red-50 text-red-700 border-red-200',
};

export function TemplateLogPage() {
    const [logs, setLogs] = useState<LogRecord[]>([]);

    const load = async () => {
        try {
            const res = await fetch('/api/template-logs');
            const json = await res.json();
            if (json.success) setLogs(json.data);
        } catch {}
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">模板操作日志</h2>
                    <p className="text-gray-500 text-sm mt-1">记录谁在什么时间新增/修改/删除了模板</p>
                </div>
                <button onClick={load} className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                    刷新
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">时间</th>
                            <th className="px-4 py-3 text-left">操作人</th>
                            <th className="px-4 py-3 text-left">操作</th>
                            <th className="px-4 py-3 text-left">模板名称</th>
                            <th className="px-4 py-3 text-left">模板ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map(l => {
                            const Icon = ACTION_ICONS[l.action] || Clock;
                            return (
                                <tr key={l.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{l.created_at}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{l.operator || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${ACTION_COLORS[l.action] || ''}`}>
                                            <Icon size={12} /> {ACTION_LABELS[l.action] || l.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">{l.template_name}</td>
                                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{l.template_id.substring(0, 8)}...</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {logs.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">暂无操作记录</div>
                )}
            </div>
        </div>
    );
}
