import {
  ArrowRight,
  // Cpu, // 已移除：设备
  // Package, // 已移除：库位
  // Users, // 已移除：员工（工业用例区）
  Shield,
  Zap,
  Layout,
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (
    view: "home" | "labels" | "employees" | "machines" | "storage",
  ) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pb-12 pt-16 sm:pb-24 sm:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="text-center lg:text-left lg:col-span-6 flex flex-col justify-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                专业{" "}
                <span className="text-blue-600">条码布局设计</span> &
                标签生成工具
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-gray-600 max-w-2xl mx-auto lg:mx-0">
                面向工业资产的终极条码标签生成器。创建专业的文本 + 二维码设计，直接导出到任何 ZPL 打印机或热敏标签打印机。
              </p>
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-x-6 justify-center lg:justify-start">
                <button
                  onClick={() => onNavigate("labels")}
                  className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  进入设计器 <ArrowRight size={18} />
                </button>
{/* 已移除：查看设备主数据按钮
                <button
                  onClick={() => onNavigate("machines")}
                  className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-1 hover:text-blue-600 transition-all cursor-pointer"
                >
                  查看设备主数据 <span aria-hidden="true">→</span>
                </button>
                */}
              </div>
            </div>
            <div className="mt-16 sm:mt-24 lg:col-span-6 lg:mt-0 flex items-center justify-center">
              <div className="relative rounded-2xl bg-white p-4 shadow-2xl border border-gray-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-200">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      <Layout size={24} />
                    </div>
                    <div>
                      <div className="h-2 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-2 w-16 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-32 w-full bg-white rounded border border-gray-200 flex items-center justify-center">
                      <div className="p-2 border-2 border-gray-900 rounded">
                        <div className="grid grid-cols-3 gap-1">
                          {[1, 1, 1, 1, 0, 1, 1, 1, 1].map((v, i) => (
                            <div
                              key={i}
                              className={`h-2 w-2 ${v ? "bg-gray-900" : "bg-transparent"}`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

{/* 已移除：现代工厂车间的解决方案（工业用例区）
      <div className="py-24 sm:py-32 bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">
              为工业而生
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              现代工厂车间的解决方案
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Package className="h-6 w-6 flex-none text-blue-600" />
                  库位标签
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto italic font-medium">
                    应用场景：库存管理
                  </p>
                  <p className="mt-2">
                    为储物箱、托盘和货架打印高耐久性二维码。扫描即可查看库存数量或仓库位置信息。
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Cpu className="h-6 w-6 flex-none text-blue-600" />
                  资产与设备追踪
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto italic font-medium">
                    应用场景：维护与规格
                  </p>
                  <p className="mt-2">
                    为工业机械设备生成标签。将二维码直接链接到设备手册、维护计划或技术规格，实现快速查阅。
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Users className="h-6 w-6 flex-none text-blue-600" />
                  员工身份识别
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto italic font-medium">
                    应用场景：员工工牌
                  </p>
                  <p className="mt-2">
                    创建带有集成二维码的安全员工工牌，用于考勤追踪、门禁控制和数字档案验证。
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
*/}

      {/* Benefits */}
      <div className="py-16 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center lg:text-left">
                为什么选择条码布局设计器？
              </h3>
              <div className="space-y-6 max-w-xl mx-auto lg:mx-0">
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      ZPL 打印机支持
                    </h4>
                    <p className="text-gray-600 text-sm">
                      一次设计，直接导出为 **ZPL 代码**，适用于 Zebra 等高速热敏打印机。完美适配工业级条码标签贴纸。
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      无需后端
                    </h4>
                    <p className="text-gray-600 text-sm">
                      数据完全保留在您的浏览器中。基于现代 Web 标准的全功能离线工具。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-600 rounded-2xl p-6 sm:p-8 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="relative z-10 text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                  准备开始了吗？
                </h3>
                <p className="text-blue-100 mb-8 max-w-sm mx-auto lg:mx-0">
                  几秒钟内开始设计您的第一张专业工业标签。
                </p>
                <button
                  onClick={() => onNavigate("labels")}
                  className="w-full sm:w-auto bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all cursor-pointer shadow-lg"
                >
                  启动设计器
                </button>
              </div>
              <div className="absolute -right-20 -bottom-20 opacity-10">
                <Layout size={300} />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
