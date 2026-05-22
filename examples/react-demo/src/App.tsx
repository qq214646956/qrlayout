// App.tsx
import { useEffect, useRef, useState } from 'react';
import { QRLayoutDesigner, type EntitySchema, type StickerLayout } from 'qrlayout-ui';
import 'qrlayout-ui/style.css';
import './App.css';
import { LabelList } from './features/labels/LabelList';
import { storage } from './services/storage';
import { ArrowLeft, Tag, Truck, Home } from 'lucide-react';
import { EmployeeMaster } from './features/employees/EmployeeMaster';
// import { MachineMaster } from './features/machines/MachineMaster'; // 已移除：设备
// import { BinMaster } from './features/storage/BinMaster'; // 已移除：库位
import { LandingPage } from './features/home/LandingPage';
// import { DocsPage } from './features/docs/DocsPage'; // 已移除：文档

// Sample Schema - 出货主数据（字段来源：SAP RFC ZFM_ZSDELIVERY_DETAILS）
const SAMPLE_SCHEMAS: Record<string, EntitySchema> = {
  delivery: {
    label: "出货主数据",
    fields: [
      { name: "VBELN", label: "交货单号" },
      { name: "POSNR", label: "交货单行号" },
      { name: "VGBEL", label: "销售凭证" },
      { name: "VGPOS", label: "销售凭证项目号" },
      { name: "WADAT_IST", label: "过账日期" },
      { name: "ERDAT", label: "创建日期" },
      { name: "MATNR", label: "物料编码" },
      { name: "MAKTX", label: "物料描述" },
      { name: "PM", label: "品名" },
      { name: "GROES", label: "规格型号" },
      { name: "KDMAT", label: "客户物料" },
      { name: "ARKTX", label: "销售订单项目短文本" },
      { name: "LFIMG", label: "实际已交系统重量" },
      { name: "LFIMG_HY", label: "实际已交行业重量" },
      { name: "MEINS", label: "单位" },
      { name: "CHARG", label: "批次编号" },
      { name: "ZFZSL", label: "辅助数量" },
      { name: "ZFZDW", label: "辅助单位" },
      { name: "ZBZCD", label: "标长(M)" },
      { name: "ZBZKD", label: "标宽（MM）" },
      { name: "ZBZHD", label: "标厚（MM）" },
      { name: "ZBZBZ", label: "比重" },
      { name: "ZBZZL", label: "标重" },
      { name: "ZHYZL", label: "行重" },
      { name: "ZBZCD2", label: "行业长度(M)" },
      { name: "ZBZKD2", label: "行业宽度（MM）" },
      { name: "KUNNR", label: "客户编码" },
      { name: "NAME1", label: "客户名称" },
      { name: "SORTL", label: "客户简称" },
      { name: "USERNAME", label: "过账人" },
    ],
    sampleData: {
      VBELN: "0080000123",
      POSNR: "000010",
      VGBEL: "0001000123",
      VGPOS: "000010",
      WADAT_IST: "2026-05-21",
      ERDAT: "2026-05-20",
      MATNR: "3001-00001-00003",
      MAKTX: "铜带&0.5×200×C1100",
      PM: "铜带",
      GROES: "0.5×200",
      KDMAT: "CUST-MAT-001",
      ARKTX: "铜带 C1100",
      LFIMG: "1250.000",
      LFIMG_HY: "1000.000",
      MEINS: "KG",
      CHARG: "20260501",
      ZFZSL: "4",
      ZFZDW: "ROL",
      ZBZCD: "200",
      ZBZKD: "0.5",
      ZBZHD: "0.01",
      ZBZBZ: "8.9",
      ZBZZL: "250",
      ZHYZL: "0.8",
      ZBZCD2: "200",
      ZBZKD2: "0.5",
      KUNNR: "0000100001",
      NAME1: "地博铜业有限公司",
      SORTL: "地博铜业",
      USERNAME: "IT01",
    }
  }
};

// Initial Default Layout for New Labels
const DEFAULT_NEW_LAYOUT: Omit<StickerLayout, 'id'> = {
  name: "新建标签",
  targetEntity: "delivery",
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

                  {/* Mobile Clear Cache */}
                  <button
                    onClick={() => {
                      localStorage.removeItem('delivery_data_cache');
                      window.location.reload();
                    }}
                    className="lg:hidden text-xs sm:text-sm text-gray-500 hover:text-gray-700 font-medium px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-gray-200 whitespace-nowrap"
                  >
                    清空查询
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
                      <Truck size={18} />
                      <span>出货数据</span>
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
                      localStorage.removeItem('delivery_data_cache');
                      window.location.reload();
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-gray-200 whitespace-nowrap"
                  >
                    清空查询
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
