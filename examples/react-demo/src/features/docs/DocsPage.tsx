import { useEffect, useState } from 'react';
import { BookOpen, Terminal, Download, Github, ChevronRight, Layers, Zap, FileText } from 'lucide-react';

const SECTIONS = [
  { id: 'overview', label: '概览' },
  { id: 'packages', label: '软件包' },
  { id: 'embed-designer', label: '嵌入设计器' },
  { id: 'headless', label: '无头渲染' },
  { id: 'schema', label: '数据结构参考' },
  { id: 'export', label: '导出格式' },
];

export function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 mb-8 lg:mb-0">
          <div className="lg:sticky lg:top-28 space-y-1">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">本页目录</h2>
            {SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
              </a>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-100">
              <a
                href="https://github.com/shashi089/qr-code-layout-generate-tool"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Github size={16} />
                在 GitHub 上查看
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-9 prose prose-slate max-w-none">

          {/* Overview */}
          <section id="overview" className="mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">条码布局设计器 — 文档</h1>
            <p className="text-lg text-gray-600">
              条码布局设计器是一个用于设计和打印专业条码标签贴纸的开源工具包。它包含两个互补的 npm 包：
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-6 not-prose">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <Layers className="text-blue-600 mb-2" size={24} />
                <h3 className="font-semibold text-gray-900">qrlayout-core</h3>
                <p className="text-sm text-gray-600">无头渲染引擎。从 JSON 布局生成 PNG、PDF 和 ZPL。</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                <Zap className="text-purple-600 mb-2" size={24} />
                <h3 className="font-semibold text-gray-900">qrlayout-ui</h3>
                <p className="text-sm text-gray-600">拖拽式设计器 UI。框架无关，可嵌入任何地方。</p>
              </div>
            </div>
          </section>

          {/* Packages */}
          <section id="packages" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">软件包</h2>
            <p className="text-gray-600 mb-4">
              两个包都已发布到 npm，基于 MIT 许可证免费使用。
            </p>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6 not-prose">
              <div className="flex items-center gap-2 mb-3">
                <Terminal size={18} className="text-gray-500" />
                <code className="text-sm font-mono bg-white px-2 py-0.5 rounded border border-gray-200">npm install qrlayout-core</code>
              </div>
              <p className="text-sm text-gray-600">如果使用 PDF 导出功能，需要 <code>jspdf</code> 作为可选的对等依赖。</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6 not-prose">
              <div className="flex items-center gap-2 mb-3">
                <Terminal size={18} className="text-gray-500" />
                <code className="text-sm font-mono bg-white px-2 py-0.5 rounded border border-gray-200">npm install qrlayout-ui qrlayout-core</code>
              </div>
              <p className="text-sm text-gray-600">还需导入 CSS：<code>import 'qrlayout-ui/style.css'</code></p>
            </div>
          </section>

          {/* Embed Designer */}
          <section id="embed-designer" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">在 React 中嵌入设计器</h2>
            <p className="text-gray-600 mb-4">
              使用 <code>qrlayout-ui</code> 将完整的拖拽式标签设计器直接嵌入到您的 React 应用中。
            </p>
            <div className="bg-gray-900 rounded-xl p-5 font-mono text-sm text-gray-200 leading-relaxed overflow-x-auto not-prose">
              {`import { QRLayoutDesigner } from "qrlayout-ui";
import "qrlayout-ui/style.css";

const designer = new QRLayoutDesigner({
    element: document.getElementById("editor"),
    entitySchemas: { ... },
    onSave: (layout) => console.log("布局已保存:", layout)
});`}
            </div>
          </section>

          {/* Headless Rendering */}
          <section id="headless" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">无头渲染</h2>
            <p className="text-gray-600 mb-4">
              单独使用 <code>qrlayout-core</code> 以编程方式渲染标签 — 无需 UI。适用于浏览器和 Node.js。
            </p>
            <div className="bg-gray-900 rounded-xl p-5 font-mono text-sm text-gray-200 leading-relaxed overflow-x-auto not-prose">
              {`import { StickerPrinter } from "qrlayout-core";

const printer = new StickerPrinter();
const zpl = printer.exportToZPL(layout, [data]);`}
            </div>
          </section>

          {/* Schema Reference */}
          <section id="schema" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">数据结构参考</h2>
            <p className="text-gray-600 mb-4">
              每个标签都是一个 <code>StickerLayout</code> 类型的纯 JSON 对象。使用 <code>{`{{变量名}}`}</code> 来标记动态内容占位符。
            </p>
            <div className="bg-gray-900 rounded-xl p-5 font-mono text-sm text-gray-200 leading-relaxed overflow-x-auto not-prose">
              {`{
  id: "layout-001",
  name: "产品标签",
  width: 100,
  height: 70,
  unit: "mm",
  elements: [
    { type: "text", content: "{{productName}}" },
    { type: "qr", content: "sku:{{skuCode}}" }
  ]
}`}
            </div>
          </section>

          {/* Export Formats */}
          <section id="export" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">导出格式</h2>
            <p className="text-gray-600 mb-4">
              所有导出功能均由 <code>qrlayout-core</code> 中的 <code>StickerPrinter</code> 处理。
            </p>

            <div className="grid sm:grid-cols-3 gap-4 not-prose mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <FileText className="text-blue-600 mb-2" size={20} />
                <h4 className="font-semibold text-gray-900">PNG / JPEG</h4>
                <p className="text-sm text-gray-600 mt-1">基于 Canvas 的图片导出。每张记录一个文件。适用于浏览器。</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <Download className="text-orange-600 mb-2" size={20} />
                <h4 className="font-semibold text-gray-900">PDF</h4>
                <p className="text-sm text-gray-600 mt-1">通过 jspdf 导出的多页 PDF 批量文件。适用于浏览器。</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <PrinterIcon className="text-green-600 mb-2" size={20} />
                <h4 className="font-semibold text-gray-900">ZPL</h4>
                <p className="text-sm text-gray-600 mt-1">用于热敏打印机的 Zebra 编程语言。返回纯文本。</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 not-prose">
              <p className="text-blue-900 font-medium mb-2">发现问题或想要贡献？</p>
              <a
                href="https://github.com/shashi089/qr-code-layout-generate-tool/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Github size={16} />
                在 GitHub 上提交 Issue
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

// Custom printer icon component since lucide-react doesn't export 'Printer' as PrinterIcon
function PrinterIcon({ className, size }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 12H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}
