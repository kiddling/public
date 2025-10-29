import Link from 'next/link';
import { FileText, FolderOpen, Sparkles, Video, Download, BookOpen } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <FileText className="w-12 h-12" />,
      title: '设计日志',
      description: 'P-04至P-06模板，交互式表单，支持本地保存和PDF导出',
      href: '/design-logs',
      color: 'bg-blue-500',
    },
    {
      icon: <FolderOpen className="w-12 h-12" />,
      title: '案例追踪',
      description: '跨课程项目引用管理，时间线视图和资源聚合',
      href: '/case-studies',
      color: 'bg-green-500',
    },
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: 'AI提示词',
      description: '复制、分享和导出AI提示词，支持版本历史',
      href: '/ai-prompts',
      color: 'bg-purple-500',
    },
    {
      icon: <Video className="w-12 h-12" />,
      title: '视频资源',
      description: '支持B站和腾讯视频，懒加载和隐私保护',
      href: '/videos',
      color: 'bg-red-500',
    },
    {
      icon: <Download className="w-12 h-12" />,
      title: '下载中心',
      description: '模板、工作表和资源文件，支持离线使用',
      href: '/downloads',
      color: 'bg-orange-500',
    },
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: '使用文档',
      description: '教师和学生使用指南，工具使用说明',
      href: '/documentation',
      color: 'bg-teal-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4 font-chinese">
          交互式教育工具套件
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          为设计教育打造的综合工具平台，包含设计日志、案例追踪、AI辅助、视频学习和资源管理
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <Link
            key={index}
            href={feature.href}
            className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className="p-8">
              <div className={`${feature.color} text-white w-20 h-20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 font-chinese">
                {feature.title}
              </h2>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
              <span className="text-primary-600 font-medium group-hover:underline">
                了解更多 →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-4 font-chinese">开始使用</h2>
        <p className="text-xl mb-8 opacity-90">
          选择上面的任一工具开始您的设计教育之旅
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/design-logs"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            创建设计日志
          </Link>
          <Link
            href="/downloads"
            className="bg-primary-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-900 transition-colors"
          >
            浏览资源
          </Link>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary-600 mb-2">6+</div>
          <div className="text-gray-600">核心功能模块</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
          <div className="text-gray-600">本地数据保护</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary-600 mb-2">∞</div>
          <div className="text-gray-600">无限创作可能</div>
        </div>
      </div>
    </div>
  );
}
