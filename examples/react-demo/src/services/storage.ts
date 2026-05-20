import type { StickerLayout } from 'qrlayout-ui';

const STORAGE_KEY = 'qr_labels_data';
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
    getLabels: (): StickerLayout[] => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveLabels: (labels: StickerLayout[]): void => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
    },

    addLabel: (label: StickerLayout): void => {
        const labels = storage.getLabels();
        const index = labels.findIndex(l => l.id === label.id);
        if (index >= 0) {
            labels[index] = label;
        } else {
            labels.push(label);
        }
        storage.saveLabels(labels);
    },

    deleteLabel: (id: string): void => {
        const labels = storage.getLabels().filter(l => l.id !== id);
        storage.saveLabels(labels);
    },

    // Employee functions
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
        if (index >= 0) {
            employees[index] = employee;
        } else {
            employees.push(employee);
        }
        storage.saveEmployees(employees);
    },

    deleteEmployee: (id: string): void => {
        const employees = storage.getEmployees().filter(e => e.id !== id);
        storage.saveEmployees(employees);
    },

    // Machine functions
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
        if (index >= 0) {
            machines[index] = machine;
        } else {
            machines.push(machine);
        }
        storage.saveMachines(machines);
    },

    deleteMachine: (id: string): void => {
        const machines = storage.getMachines().filter(m => m.id !== id);
        storage.saveMachines(machines);
    },

    // Bin functions
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
        if (index >= 0) {
            bins[index] = bin;
        } else {
            bins.push(bin);
        }
        storage.saveBins(bins);
    },

    deleteBin: (id: string): void => {
        const bins = storage.getBins().filter(b => b.id !== id);
        storage.saveBins(bins);
    },

    initializeDefaults: (): void => {
        if (storage.getEmployees().length === 0) {
            storage.saveEmployees([
                { id: '1', fullName: '张三', employeeId: 'EMP-001', department: '运营部', joinDate: '2023-01-10' },
                { id: '2', fullName: '李四', employeeId: 'EMP-002', department: '工程部', joinDate: '2023-03-15' },
                { id: '3', fullName: '王五', employeeId: 'EMP-003', department: '物流部', joinDate: '2023-06-20' }
            ]);
        }
        if (storage.getMachines().length === 0) {
            storage.saveMachines([
                { id: 'm1', machineName: 'CNC 雕刻机 X1', machineCode: 'CNC-01', location: 'A 区', model: '2024-Pro' },
                { id: 'm2', machineName: '工业 3D 打印机', machineCode: 'PRN-01', location: '设计实验室', model: 'Gen-3' },
                { id: 'm3', machineName: '液压冲床', machineCode: 'PRS-05', location: 'B 层', model: '重型' }
            ]);
        }
        if (storage.getBins().length === 0) {
            storage.saveBins([
                { id: 'b1', binCode: 'BIN-A1-R1', storageType: '托盘货架', aisle: '货道 01', rack: 'R1' },
                { id: 'b2', binCode: 'BIN-A1-R2', storageType: '轻型货架', aisle: '货道 01', rack: 'R2' },
                { id: 'b3', binCode: 'BIN-B2-R1', storageType: '冷藏库', aisle: '货道 02', rack: 'R1' }
            ]);
        }
        if (storage.getLabels().length === 0) {
            storage.saveLabels([
                {
                    id: 'default-emp-layout',
                    name: '员工工牌',
                    targetEntity: 'employee',
                    width: 85.6,
                    height: 53.98,
                    unit: 'mm',
                    backgroundColor: '#ffffff',
                    elements: [
                        { id: 'e1', type: 'text', x: 30, y: 10, w: 50, h: 10, content: '{{fullName}}', style: { fontSize: 18, fontWeight: 'bold' } },
                        { id: 'e2', type: 'text', x: 30, y: 20, w: 50, h: 8, content: '{{employeeId}}', style: { fontSize: 12 } },
                        { id: 'e3', type: 'text', x: 30, y: 28, w: 50, h: 6, content: '{{department}}', style: { fontSize: 10, color: '#666666' } },
                        { id: 'e4', type: 'qr', x: 5, y: 10, w: 22, h: 22, content: 'emp:{{employeeId}}' }
                    ]
                },
                {
                    id: 'default-machine-layout',
                    name: '设备资产标签',
                    targetEntity: 'machine',
                    width: 60,
                    height: 30,
                    unit: 'mm',
                    backgroundColor: '#f8fafc',
                    elements: [
                        { id: 'm1', type: 'text', x: 25, y: 5, w: 32, h: 5, content: '工业公司资产', style: { fontSize: 8, fontWeight: 'bold' } },
                        { id: 'm2', type: 'text', x: 25, y: 12, w: 32, h: 8, content: '{{machineName}}', style: { fontSize: 14, fontWeight: 'bold' } },
                        { id: 'm3', type: 'text', x: 25, y: 22, w: 32, h: 6, content: '编号: {{machineCode}}', style: { fontSize: 10 } },
                        { id: 'm4', type: 'qr', x: 3, y: 5, w: 20, h: 20, content: 'asset:{{machineCode}}' }
                    ]
                },
                {
                    id: 'default-storage-layout',
                    name: '库位标签',
                    targetEntity: 'storage',
                    width: 100,
                    height: 50,
                    unit: 'mm',
                    backgroundColor: '#ffffff',
                    elements: [
                        { id: 'b1', type: 'text', x: 10, y: 10, w: 50, h: 8, content: '货道: {{aisle}}', style: { fontSize: 12 } },
                        { id: 'b2', type: 'text', x: 10, y: 25, w: 80, h: 20, content: '{{binCode}}', style: { fontSize: 32, fontWeight: 'bold' } },
                        { id: 'b4', type: 'qr', x: 65, y: 10, w: 30, h: 30, content: 'storage:{{binCode}}' }
                    ]
                }
            ]);
        }
    },

    clearAll: (): void => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(EMPLOYEE_STORAGE_KEY);
        localStorage.removeItem(MACHINE_STORAGE_KEY);
        localStorage.removeItem(BIN_STORAGE_KEY);
    }
};
