import { useState } from 'react';
import { User, Lock } from 'lucide-react';

export interface UserInfo {
    id: number;
    username: string;
    display_name: string;
    role: 'admin' | 'designer' | 'operator';
}

interface Props {
    onLogin: (user: UserInfo) => void;
}

export function LoginPage({ onLogin }: Props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const json = await res.json();
            if (json.success) {
                sessionStorage.setItem('user', JSON.stringify(json.user));
                onLogin(json.user);
            } else {
                setError(json.message || '登录失败');
            }
        } catch {
            setError('无法连接服务器');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-white">地博标签打印系统</h1>
                    <p className="text-blue-100 text-sm mt-1">请登录您的账号</p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">用户名</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="请输入用户名"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">密码</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="请输入密码"
                            />
                        </div>
                    </div>
                    {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                        {loading ? '登录中...' : '登 录'}
                    </button>
                </form>
            </div>
        </div>
    );
}
