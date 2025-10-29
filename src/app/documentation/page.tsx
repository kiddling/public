import { BookOpen, FileText, Users, Lightbulb, Video, Download, HelpCircle } from 'lucide-react';

export default function DocumentationPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 font-chinese">
          使用文档
        </h1>
        <p className="text-xl text-gray-600">
          教师和学生的完整使用指南
        </p>
      </div>

      <div className="space-y-12">
        <section className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-primary-600" />
            <h2 className="text-2xl font-bold font-chinese">设计日志使用指南</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">功能概述</h3>
              <p className="text-gray-600 mb-4">
                设计日志提供三种模板（P-04、P-05、P-06），帮助学生系统化记录设计思考过程。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">使用步骤</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>选择适合当前设计阶段的模板类型</li>
                <li>填写项目名称和标题</li>
                <li>根据模板提供的指导填写各个字段</li>
                <li>点击"保存"按钮，数据会自动保存到本地存储</li>
                <li>使用"导出PDF"或"打印"功能生成文档</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">教师建议</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>建议学生在项目不同阶段使用不同模板</li>
                <li>鼓励学生详细记录思考过程，而非仅记录结果</li>
                <li>定期检查学生的设计日志，提供反馈</li>
                <li>可以要求学生导出PDF提交作业</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold font-chinese">案例追踪使用指南</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">功能概述</h3>
              <p className="text-gray-600 mb-4">
                案例追踪器帮助学生管理长期项目，跨课程和卡片链接相关引用，以时间线方式展示项目进展。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">核心功能</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>项目管理：</strong>创建、编辑和删除案例研究项目</li>
                <li><strong>引用链接：</strong>添加课程、卡片和外部资源的引用</li>
                <li><strong>时间线视图：</strong>以时间顺序查看项目事件和里程碑</li>
                <li><strong>资源聚合：</strong>集中管理项目相关的所有资源文件</li>
                <li><strong>标签分类：</strong>使用标签组织和筛选项目</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">推荐使用场景</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>模块化座椅设计项目（跨多个课程模块）</li>
                <li>毕业设计项目管理</li>
                <li>长期实践项目的记录和反思</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold font-chinese">AI提示词工具使用指南</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">功能概述</h3>
              <p className="text-gray-600 mb-4">
                AI提示词工具提供预设的提示词模板，帮助学生和教师更有效地使用AI工具辅助设计工作。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">主要功能</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>一键复制：</strong>快速复制提示词到剪贴板</li>
                <li><strong>版本历史：</strong>查看提示词的演进过程</li>
                <li><strong>多格式导出：</strong>支持文本和PDF格式导出</li>
                <li><strong>分享功能：</strong>与同学和教师分享有用的提示词</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">使用技巧</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>根据设计任务类型选择合适的提示词类别</li>
                <li>复制提示词后，根据具体情况修改方括号内的内容</li>
                <li>将AI生成的内容作为灵感来源，而非直接答案</li>
                <li>记录有效的提示词版本，便于后续使用</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Video className="w-8 h-8 text-red-600" />
            <h2 className="text-2xl font-bold font-chinese">视频资源使用指南</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">支持的平台</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>哔哩哔哩（Bilibili）：</strong>国内主流视频平台</li>
                <li><strong>腾讯视频：</strong>企业级视频服务</li>
                <li><strong>YouTube：</strong>国际视频平台（需要相应网络环境）</li>
                <li><strong>Vimeo：</strong>高质量视频平台</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">特性说明</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>懒加载：</strong>视频仅在进入视口时加载，节省带宽</li>
                <li><strong>隐私模式：</strong>启用隐私保护参数，减少第三方跟踪</li>
                <li><strong>优雅降级：</strong>视频无法加载时提供友好的错误提示</li>
                <li><strong>移动优化：</strong>支持移动设备播放</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">教学建议</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>在课程中嵌入相关教学视频</li>
                <li>鼓励学生观看视频前后完成相应练习</li>
                <li>为重要视频提供时间戳和要点总结</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-8 h-8 text-orange-600" />
            <h2 className="text-2xl font-bold font-chinese">下载中心使用指南</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">资源类型</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>设计模板：</strong>P-04、P-05、P-06等工作表模板</li>
                <li><strong>研究工具：</strong>用户研究计划、案例分析框架等</li>
                <li><strong>AI工具：</strong>AI提示词指南和使用说明</li>
                <li><strong>学习资料：</strong>相关理论和案例分析文档</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">功能特性</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>智能搜索：</strong>按标题和描述搜索资源</li>
                <li><strong>分类筛选：</strong>按资源类别快速定位</li>
                <li><strong>完整性校验：</strong>提供文件校验和，确保下载完整</li>
                <li><strong>离线标识：</strong>标注支持离线使用的资源</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">教师功能</h3>
              <p className="text-gray-600 mb-2">
                教师可以通过Strapi后台管理系统上传和管理教学资源：
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>登录Strapi管理后台</li>
                <li>进入"Downloadable Resources"内容类型</li>
                <li>创建新条目并上传文件</li>
                <li>填写标题、描述、类别等信息</li>
                <li>发布后资源会自动同步到下载中心</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-teal-600" />
            <h2 className="text-2xl font-bold font-chinese">最佳实践</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">对教师</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>课程开始时向学生介绍各工具的用途</li>
                <li>提供示例和模板使用演示</li>
                <li>定期检查学生的工具使用情况</li>
                <li>收集学生反馈，持续改进工具和资源</li>
                <li>在评分标准中纳入工具使用的考量</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">对学生</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>及时记录设计过程，不要等到项目结束</li>
                <li>利用案例追踪器管理长期项目</li>
                <li>积极尝试AI工具，但保持批判性思维</li>
                <li>定期备份和导出重要的设计文档</li>
                <li>与同学分享有用的资源和技巧</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-8 h-8 text-primary-600" />
            <h2 className="text-2xl font-bold font-chinese">常见问题</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Q: 我的设计日志数据保存在哪里？</h3>
              <p className="text-gray-600">
                A: 所有数据都保存在浏览器的本地存储（localStorage）中，完全在您的设备上，不会上传到服务器。
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Q: 如果清除浏览器数据会丢失我的工作吗？</h3>
              <p className="text-gray-600">
                A: 是的。建议定期使用"导出PDF"功能备份重要的设计日志。
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Q: PDF导出的中文字体显示正常吗？</h3>
              <p className="text-gray-600">
                A: 是的，系统已针对中文字体进行优化，使用Noto Sans SC、PingFang SC等中文字体。
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Q: 视频无法播放怎么办？</h3>
              <p className="text-gray-600">
                A: 检查网络连接，确认视频平台在您的地区可访问。点击"重新加载"按钮尝试再次加载。
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Q: 如何向下载中心添加新资源？</h3>
              <p className="text-gray-600">
                A: 教师可以通过Strapi后台管理系统上传资源。学生如有需要可联系教师添加。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
