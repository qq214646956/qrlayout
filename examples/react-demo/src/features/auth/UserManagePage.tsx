import { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, User, Wrench, Eye } from 'lucide-react';

interface UserRecord {
    id: number;
    username: string;
    display_name: string;
    role: string;
    created_at: string;
}

const ROLE_ICONS: Record<string, any> = { admin: Shield, designer: Wrench, operator: Eye };
const ROLE_LABELS: Record<string, string> = { admin: '管理员', designer: '设计员', operator: '操作员' };

export function UserManagePage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', display_name: '', role: 'operator' });
    const [error, setError] = useState('');

    const loadUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const json = await res.json();
            if (json.success) setUsers(json.data);
        } catch {}
    };

    useEffect(() => { loadUsers(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (json.success) {
                setForm({ username: '', password: '', display_name: '', role: 'operator' });
                setShowForm(false);
                loadUsers();
            } else {
                setError(json.message);
            }
        } catch {
            setError('创建失败');
        }
    };

    const handleDelete = async (user: UserRecord) => {
        if (!confirm(`确定要删除用户「${user.display_name}」吗？`)) return;
        try {
            const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) loadUsers();
            else alert(json.message);
        } catch {
            alert('删除失败');
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 animate-in fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">用户管理</h2>
                    <p className="text-gray-500 text-sm mt-1">管理人员账号</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer">
                    <Plus size={18} /> 新增用户
                </button>
            </div>

            {/* New User Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                    <form onSubmit={handleCreate} className="space-y-3">
                        <div className="flex gap-3">
                            <input type="text" placeholder="用户名" required className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                            <input type="password" placeholder="密码" required className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        </div>
                        <div className="flex gap-3">
                            <input type="text" placeholder="显示名称" required className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} />
                            <select className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                <option value="admin">管理员</option>
                                <option value="designer">设计员</option>
                                <option value="operator">操作员</option>
                            </select>
                        </div>
                        {error && <div className="text-sm text-red-600">{error}</div>}
                        <div className="flex gap-2">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">创建</button>
                            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">取消</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">用户</th>
                            <th className="px-4 py-3 text-left">角色</th>
                            <th className="px-4 py-3 text-left">创建时间</th>
                            <th className="px-4 py-3 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(u => {
                            const Icon = ROLE_ICONS[u.role] || User;
                            return (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{u.display_name}</div>
                                        <div className="text-xs text-gray-400">@{u.username}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                                            ${u.role === 'admin' ? 'bg-red-50 text-red-700' : u.role === 'designer' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                            <Icon size={12} /> {ROLE_LABELS[u.role] || u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{u.created_at?.split(' ')[0]}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleDelete(u)}
                                            className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 cursor-pointer disabled:opacity-30"
                                            disabled={u.role === 'admin' && users.filter(x => x.role === 'admin').length <= 1}>
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {users.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">暂无用户</div>}
            </div>
        </div>
    );
}
