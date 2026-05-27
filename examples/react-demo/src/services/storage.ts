import type { StickerLayout } from 'qrlayout-ui';

const API_BASE = window.location.port === '5173' ? 'http://localhost:5000' : '';

const EMPLOYEE_STORAGE_KEY = 'employee_data';
const MACHINE_STORAGE_KEY = 'machine_data';
const BIN_STORAGE_KEY = 'bin_data';

export interface Employee {
    id: string;
    fullName: string;
    employeeId: string;
    department: string;
    joinDate: string;
}

export interface Machine {
    id: string;
    machineName: string;
    machineCode: string;
    location: string;
    model: string;
}

export interface Bin {
    id: string;
    binCode: string;
    storageType: string;
    aisle: string;
    rack: string;
}

export const storage = {
    // Template API (MySQL via Flask)
    getLabels: async (): Promise<StickerLayout[]> => {
        try {
            const res = await fetch(`${API_BASE}/api/templates`);
            const json = await res.json();
            return json.success ? json.data : [];
        } catch {
            return [];
        }
    },

    addLabel: async (label: StickerLayout): Promise<void> => {
        try {
            const user = JSON.parse(sessionStorage.getItem('user') || '{}');
            const operator = user.display_name || '';
            await fetch(`${API_BASE}/api/templates?operator=${encodeURIComponent(operator)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(label),
            });
        } catch {}
    },

    deleteLabel: async (id: string): Promise<void> => {
        try {
            const user = JSON.parse(sessionStorage.getItem('user') || '{}');
            const operator = user.display_name || '';
            await fetch(`${API_BASE}/api/templates/${id}?operator=${encodeURIComponent(operator)}`, { method: 'DELETE' });
        } catch {}
    },

    // Employee functions (localStorage)
    getEmployees: (): Employee[] => {
        const data = localStorage.getItem(EMPLOYEE_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveEmployees: (employees: Employee[]): void => {
        localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(employees));
    },

    addEmployee: (employee: Employee): void => {
        const employees = storage.getEmployees();
        const index = employees.findIndex(e => e.id === employee.id);
        if (index >= 0) { employees[index] = employee; }
        else { employees.push(employee); }
        storage.saveEmployees(employees);
    },

    deleteEmployee: (id: string): void => {
        const employees = storage.getEmployees().filter(e => e.id !== id);
        storage.saveEmployees(employees);
    },

    // Machine functions (localStorage)
    getMachines: (): Machine[] => {
        const data = localStorage.getItem(MACHINE_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveMachines: (machines: Machine[]): void => {
        localStorage.setItem(MACHINE_STORAGE_KEY, JSON.stringify(machines));
    },

    addMachine: (machine: Machine): void => {
        const machines = storage.getMachines();
        const index = machines.findIndex(m => m.id === machine.id);
        if (index >= 0) { machines[index] = machine; }
        else { machines.push(machine); }
        storage.saveMachines(machines);
    },

    deleteMachine: (id: string): void => {
        const machines = storage.getMachines().filter(m => m.id !== id);
        storage.saveMachines(machines);
    },

    // Bin functions (localStorage)
    getBins: (): Bin[] => {
        const data = localStorage.getItem(BIN_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveBins: (bins: Bin[]): void => {
        localStorage.setItem(BIN_STORAGE_KEY, JSON.stringify(bins));
    },

    addBin: (bin: Bin): void => {
        const bins = storage.getBins();
        const index = bins.findIndex(b => b.id === bin.id);
        if (index >= 0) { bins[index] = bin; }
        else { bins.push(bin); }
        storage.saveBins(bins);
    },

    deleteBin: (id: string): void => {
        const bins = storage.getBins().filter(b => b.id !== id);
        storage.saveBins(bins);
    },

    initializeDefaults: async (): Promise<void> => {
        // Migrate old localStorage templates to MySQL (one-time)
        const migrated = localStorage.getItem('templates_migrated');
        if (!migrated) {
            const oldData = localStorage.getItem('qr_labels_data');
            if (oldData) {
                try {
                    const oldLabels = JSON.parse(oldData);
                    for (const label of oldLabels) {
                        await storage.addLabel(label as any);
                    }
                    localStorage.removeItem('qr_labels_data');
                } catch {}
            }
            localStorage.setItem('templates_migrated', '1');
        }

        // Seed default template if MySQL is empty
        try {
            const labels = await storage.getLabels();
            if (labels.length === 0) {
                await storage.addLabel({
                    id: 'default-delivery-layout',
                    name: '出货标签',
                    targetEntity: 'delivery',
                    width: 100,
                    height: 70,
                    unit: 'mm',
                    backgroundColor: '#ffffff',
                    elements: [
                        { id: 'd1', type: 'text', x: 30, y: 5, w: 65, h: 6, content: '{{NAME1}}', style: { fontSize: 10, fontWeight: 'bold' } },
                        { id: 'd2', type: 'text', x: 30, y: 13, w: 65, h: 8, content: '{{MAKTX}}', style: { fontSize: 14, fontWeight: 'bold' } },
                        { id: 'd3', type: 'text', x: 30, y: 24, w: 35, h: 6, content: '单号: {{VBELN}}', style: { fontSize: 9 } },
                        { id: 'd4', type: 'text', x: 30, y: 32, w: 35, h: 6, content: '数量: {{LFIMG}} {{MEINS}}', style: { fontSize: 9 } },
                        { id: 'd5', type: 'text', x: 30, y: 40, w: 35, h: 6, content: '批次: {{CHARG}}', style: { fontSize: 9 } },
                        { id: 'd6', type: 'text', x: 30, y: 48, w: 65, h: 6, content: '规格: {{ZBZCD}}×{{ZBZKD}}×{{ZBZHD}}mm', style: { fontSize: 9 } },
                        { id: 'd7', type: 'text', x: 30, y: 56, w: 65, h: 6, content: '重量: {{ZBZZL}}kg 含油: {{ZHYZL}}%', style: { fontSize: 9 } },
                        { id: 'd8', type: 'qr', x: 5, y: 15, w: 22, h: 22, content: '{{VBELN}}' },
                        { id: 'd9', type: 'text', x: 5, y: 40, w: 22, h: 5, content: '{{PM}}', style: { fontSize: 7, textAlign: 'center' } }
                    ]
                } as any);
            }
        } catch {}
    },

    clearAll: (): void => {
        localStorage.removeItem(EMPLOYEE_STORAGE_KEY);
        localStorage.removeItem(MACHINE_STORAGE_KEY);
        localStorage.removeItem(BIN_STORAGE_KEY);
    }
};
