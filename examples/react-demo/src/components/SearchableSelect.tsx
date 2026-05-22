import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface Props {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function SearchableSelect({ options, value, onChange, placeholder = '请选择...', disabled }: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIdx, setActiveIdx] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selectedOption = options.find(o => o.value === value);

    const filtered = useMemo(() => {
        if (!query.trim()) return options;
        const q = query.toLowerCase();
        return options.filter(o => o.label.toLowerCase().includes(q));
    }, [options, query]);

    // Click outside to close
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Sync activeIdx with filtered results
    useEffect(() => {
        setActiveIdx(-1);
    }, [filtered.length]);

    const selectOption = (opt: Option) => {
        onChange(opt.value);
        setQuery('');
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                e.preventDefault();
                setOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIdx(i => Math.max(i - 1, -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIdx >= 0 && activeIdx < filtered.length) {
                    selectOption(filtered[activeIdx]);
                }
                break;
            case 'Escape':
                setOpen(false);
                setQuery('');
                break;
        }
    };

    // Scroll active item into view
    useEffect(() => {
        if (activeIdx >= 0 && listRef.current) {
            const items = listRef.current.children;
            if (items[activeIdx]) {
                items[activeIdx].scrollIntoView({ block: 'nearest' });
            }
        }
    }, [activeIdx]);

    return (
        <div ref={containerRef} className="relative" style={{ minWidth: 180 }}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    className={`w-full bg-white border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder={selectedOption ? selectedOption.label : placeholder}
                    value={open ? query : (selectedOption?.label ?? '')}
                    disabled={disabled}
                    onFocus={() => { setOpen(true); setQuery(''); }}
                    onChange={e => { setQuery(e.target.value); setOpen(true); }}
                    onKeyDown={handleKeyDown}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <ChevronDown size={14} />
                </div>
            </div>

            {open && (
                <ul
                    ref={listRef}
                    className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                    {filtered.length === 0 ? (
                        <li className="px-3 py-4 text-sm text-gray-400 text-center">
                            <Search size={14} className="inline mr-1" /> 无匹配模板
                        </li>
                    ) : (
                        filtered.map((opt, idx) => (
                            <li
                                key={opt.value}
                                className={`px-3 py-2 text-sm cursor-pointer truncate transition-colors ${
                                    idx === activeIdx
                                        ? 'bg-blue-50 text-blue-700'
                                        : opt.value === value
                                            ? 'bg-blue-50/50 text-blue-600'
                                            : 'text-gray-700 hover:bg-gray-50'
                                }`}
                                onMouseEnter={() => setActiveIdx(idx)}
                                onMouseDown={e => { e.preventDefault(); selectOption(opt); }}
                            >
                                {opt.label}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}
