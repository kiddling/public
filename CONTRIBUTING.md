# 贡献指南 (Contributing Guide)

感谢您对本项目的关注！我们欢迎所有形式的贡献。

## 🤝 如何贡献

### 报告问题 (Issues)

如果您发现了 bug 或有功能建议：

1. 检查 [Issues](https://github.com/yourusername/china-optimized-nuxt-app/issues) 是否已有类似问题
2. 如果没有，创建新 Issue
3. 提供详细的描述、复现步骤和环境信息

### 提交代码 (Pull Requests)

1. **Fork 项目**
   ```bash
   # 在 GitHub 上 fork 项目
   git clone https://github.com/your-username/china-optimized-nuxt-app.git
   cd china-optimized-nuxt-app
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **开发和测试**
   ```bash
   npm install
   npm run dev
   # 进行修改
   npm run typecheck
   npm run build
   ```

4. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   # 遵循 Conventional Commits 规范
   ```

5. **推送和创建 PR**
   ```bash
   git push origin feature/your-feature-name
   # 在 GitHub 上创建 Pull Request
   ```

## 📝 代码规范

### 提交信息格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建或辅助工具变更

示例：
```
feat: add Baidu Analytics integration
fix: resolve image loading issue on mobile
docs: update deployment guide for Aliyun
```

### TypeScript

- 使用严格模式
- 为函数参数和返回值添加类型
- 避免使用 `any`，优先使用具体类型
- 使用接口 (interface) 定义对象结构

### Vue/Nuxt

- 使用 Composition API (`<script setup>`)
- 组件文件名使用 PascalCase (如 `CookieConsent.vue`)
- Props 使用 TypeScript 类型定义
- 使用 `ref` 和 `computed` 而不是 Options API

### CSS

- 使用 scoped 样式
- 使用 CSS 变量（在 `main.css` 中定义）
- 移动优先的响应式设计
- 使用语义化的类名

### 性能

- 避免阻塞渲染的操作
- 图片使用 `<NuxtImg>` 组件
- 大组件考虑懒加载
- 保持页面包大小 < 200KB (压缩后)

## 🧪 测试

在提交 PR 前，确保：

1. ✅ 代码通过 TypeScript 类型检查
   ```bash
   npm run typecheck
   ```

2. ✅ 应用可以正常构建
   ```bash
   npm run build
   ```

3. ✅ 性能测试通过（可选但推荐）
   ```bash
   npm run lighthouse
   ```

4. ✅ 在本地测试所有受影响的功能

## 📋 PR 检查清单

提交 PR 前，请确认：

- [ ] 代码遵循项目风格指南
- [ ] 提交信息遵循 Conventional Commits
- [ ] 已添加/更新相关文档
- [ ] 已测试所有修改
- [ ] TypeScript 类型检查通过
- [ ] 构建成功
- [ ] 没有引入新的警告或错误
- [ ] 性能测试通过（如适用）
- [ ] 更新了 CHANGELOG（如适用）

## 🎯 开发重点

当前优先级：

1. **性能优化**: 持续改进加载速度和性能指标
2. **SEO 增强**: 优化百度和其他中文搜索引擎的收录
3. **中国市场适配**: 改进国内网络环境的用户体验
4. **文档完善**: 补充部署和使用文档
5. **测试覆盖**: 增加自动化测试

## 🐛 Bug 修复流程

1. 在 Issue 中确认 bug
2. 复现问题
3. 创建修复分支
4. 编写修复代码
5. 测试验证
6. 提交 PR 并关联 Issue

## 💡 功能建议

欢迎提出新功能建议！请在 Issue 中说明：

- 功能描述
- 使用场景
- 预期收益
- 实现难度估计

## 📚 学习资源

- [Nuxt 3 文档](https://nuxt.com/)
- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Web 性能优化](https://web.dev/performance/)
- [百度搜索资源平台](https://ziyuan.baidu.com/)

## 🙏 行为准则

- 尊重所有贡献者
- 建设性地讨论问题
- 保持专业和友善
- 遵循开源社区规范

## 📞 联系方式

- GitHub Issues: 技术问题和 bug 报告
- Email: dev@example.com
- 讨论区: GitHub Discussions

感谢您的贡献！🎉
