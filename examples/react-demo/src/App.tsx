// App.tsx
import { useEffect, useRef, useState } from 'react';
import { QRLayoutDesigner, type EntitySchema, type StickerLayout } from 'qrlayout-ui';
import 'qrlayout-ui/style.css';
import './App.css';
import { LabelList } from './features/labels/LabelList';
import { storage } from './services/storage';
import { ArrowLeft, Tag, Users, Home } from 'lucide-react'; // Cpu, Package, Github, BookOpen - 已移除：设备/库位/源代码/文档
import { EmployeeMaster } from './features/employees/EmployeeMaster';
// import { MachineMaster } from './features/machines/MachineMaster'; // 已移除：设备
// import { BinMaster } from './features/storage/BinMaster'; // 已移除：库位
import { LandingPage } from './features/home/LandingPage';
// import { DocsPage } from './features/docs/DocsPage'; // 已移除：文档

// Sample Schema
const SAMPLE_SCHEMAS: Record<string, EntitySchema> = {
  employee: {
    label: "员工主数据",
    fields: [
      { name: "fullName", label: "姓名" },
      { name: "employeeId", label: "工号" },
      { name: "department", label: "部门" },
      { name: "joinDate", label: "入职日期" },
    ],
    sampleData: {
      fullName: "张三",
      employeeId: "EMP-2024-889",
      department: "工程部",
      joinDate: "2024-01-15"
    }
  },
  machine: {
    label: "设备主数据",
    fields: [
      { name: "machineName", label: "设备名称" },
      { name: "machineCode", label: "设备编号" },
      { name: "location", label: "位置" },
      { name: "model", label: "型号" },
    ],
    sampleData: {
      machineName: "CNC 铣床",
      machineCode: "MC-2024-V1",
      location: "车间 A 区",
      model: "XYZ-2000"
    }
  },
  storage: {
    label: "库位主数据",
    fields: [
      { name: "binCode", label: "库位编号" },
      { name: "storageType", label: "存储类型" },
      { name: "aisle", label: "货道" },
      { name: "rack", label: "货架号" },
    ],
    sampleData: {
      binCode: "BIN-A1-R4",
      storageType: "托盘货架",
      aisle: "货道 01",
      rack: "R-44"
    }
  }
};

// Initial Default Layout for New Labels
const DEFAULT_NEW_LAYOUT: Omit<StickerLayout, 'id'> = {
  name: "新建标签",
  targetEntity: "employee",
  width: 100,
  height: 60,
  unit: "mm",
  backgroundColor: "#ffffff",
  elements: []
};

type MainView = 'home' | 'docs' | 'labels' | 'employees' | 'machines' | 'storage';
type SubView = 'list' | 'designer';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const designerRef = useRef<QRLayoutDesigner | null>(null);

  const [mainView, setMainView] = useState<MainView>('home');
  const [subView, setSubView] = useState<SubView>('list');
  const [labels, setLabels] = useState<StickerLayout[]>([]);
  const [editingLayout, setEditingLayout] = useState<StickerLayout | null>(null);

  // Load data on mount
  useEffect(() => {
    storage.initializeDefaults();
    setLabels(storage.getLabels());
  }, []);

  // Initialize Designer when switching to designer view
  useEffect(() => {
    if (subView !== 'designer' || !containerRef.current) return;

    const initialLayout = editingLayout || {
      ...DEFAULT_NEW_LAYOUT,
      id: crypto.randomUUID()
    };

    designerRef.current = new QRLayoutDesigner({
      element: containerRef.current,
      entitySchemas: SAMPLE_SCHEMAS,
      initialLayout: initialLayout as StickerLayout,
      onSave: (layout) => {
        console.log(layout, "layout")
        storage.addLabel(layout);
        setLabels(storage.getLabels());
        setSubView('list');
        setEditingLayout(null);
      }
    });

    return () => {
      if (designerRef.current) {
        designerRef.current.destroy();
        designerRef.current = null;
      }
    };
  }, [subView, editingLayout]);

  const handleCreateNew = () => {
    setEditingLayout(null);
    setSubView('designer');
  };

  const handleEdit = (layout: StickerLayout) => {
    setEditingLayout(layout);
    setSubView('designer');
  };

  const handleDelete = (id: string) => {
    storage.deleteLabel(id);
    setLabels(storage.getLabels());
  };

  const handleBackToList = () => {
    setSubView('list');
    setEditingLayout(null);
  };

  const handleMainViewChange = (view: MainView) => {
    setMainView(view);
    setSubView('list'); // Reset subview when switching main tabs
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}

      {/* If acting as Designer, cover full screen (or manage as modal) */}
      {subView === 'designer' ? (
        <div className="relative">
          <button
            onClick={handleBackToList}
            className="fixed top-4 left-4 z-[9999] flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium shadow-md transition-all border border-gray-200 cursor-pointer"
          >
            <ArrowLeft size={18} />
            返回标签列表
          </button>
          <div
            className="designer-container"
            ref={containerRef}
          />
        </div>
      ) : (
        <>
          {/* Navigation Bar */}
          <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40 backdrop-blur-lg bg-white/95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center justify-between py-4 gap-4">
                {/* Logo/Brand and Mobile Actions */}
                <div className="flex items-center justify-between w-full lg:w-auto gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate max-w-[150px] sm:max-w-full">
                        条码布局设计器
                      </h1>
                      {/* 已移除：作者 @shashi089
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">作者</p>
                        <a
                          href="https://github.com/shashi089"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] sm:text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          @shashi089
                        </a>
                      </div>
                      */}
                    </div>
                  </div>

                  {/* Mobile Clear Data Action */}
                  <button
                    onClick={() => {
                      if (confirm('确定要清空所有数据吗？这将删除所有标签和员工数据。')) {
                        storage.clearAll();
                        setLabels([]);
                        window.location.reload();
                      }
                    }}
                    className="lg:hidden text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-red-100 whitespace-nowrap"
                  >
                    清空数据
                  </button>
                </div>

                {/* Navigation Tabs - Scrollable on mobile */}
                <div className="w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                  <nav className="flex gap-1.5 sm:gap-2 bg-gray-100 p-1 sm:p-1.5 rounded-xl w-max mx-auto lg:mx-0">
                    <button
                      onClick={() => handleMainViewChange('home')}
                      className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all duration-200 rounded-lg cursor-pointer ${mainView === 'home'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                    >
                      <Home size={18} />
                      <span className="hidden md:inline">首页</span>
                    </button>
                    {/* 已移除：文档按钮
                    <button
                      onClick={() => handleMainViewChange('docs')}
                      className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all duration-200 rounded-lg cursor-pointer ${mainView === 'docs'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                    >
                      <BookOpen size={18} />
                      <span className="hidden sm:inline">文档</span>
                    </button>
                    */}
                    <button
                      onClick={() => handleMainViewChange('labels')}
                      className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all duration-200 rounded-lg cursor-pointer ${mainView === 'labels'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                    >
                      <Tag size={18} />
                      <span>标签</span>
                    </button>
                    <button
                      onClick={() => handleMainViewChange('employees')}
                      className={`flex items-center gap-2 px-5 py-2.5 font-semibold transition-all duration-200 rounded-lg cursor-pointer ${mainView === 'employees'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                    >
                      <Users size={18} />
                      <span>员工</span>
                    </button>
                    {/* 已移除：设备按钮
                    <button
                      onClick={() => handleMainViewChange('machines')}
                      className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all duration-200 rounded-lg cursor-pointer ${mainView === 'machines'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                    >
                      <Cpu size={18} />
                      <span className="hidden md:inline">设备</span>
                    </button>
                    */}
                    {/* 已移除：库位按钮
                    <button
                      onClick={() => handleMainViewChange('storage')}
                      className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all duration-200 rounded-lg cursor-pointer ${mainView === 'storage'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                    >
                      <Package size={18} />
                      <span className="hidden sm:inline">库位</span>
                    </button>
                    */}

                  </nav>
                </div>

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-3">
                  {/* 已移除：源代码按钮
                  <a
                    href="https://github.com/shashi089/qr-code-layout-generate-tool"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                  >
                    <Github size={18} />
                    <span>源代码</span>
                  </a>
                  */}
                  <button
                    onClick={() => {
                      if (confirm('确定要清空所有数据吗？这将删除所有标签和员工数据。')) {
                        storage.clearAll();
                        setLabels([]);
                        window.location.reload();
                      }
                    }}
                    className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-red-100 whitespace-nowrap"
                  >
                    清空数据
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Based on Tab */}
          {mainView === 'home' ? (
            <LandingPage onNavigate={handleMainViewChange} />
          ) : mainView === 'labels' ? (
            <LabelList
              labels={labels}
              onCreateNew={handleCreateNew}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : mainView === 'employees' ? (
            <EmployeeMaster />
          ) : null /* 已移除：machines → <MachineMaster />, docs → <DocsPage />, storage → <BinMaster /> */}
        </>
      )}
    </div>
  )
}

export default App
