# 合规文档 (Compliance Documentation)

本目录包含针对中国法律法规要求的合规模板和实施指南。

## 📋 文档列表

### [PRIVACY_POLICY_TEMPLATE.md](./PRIVACY_POLICY_TEMPLATE.md)
隐私政策模板，符合《个人信息保护法》(PIPL) 要求。

**适用场景**:
- 网站/应用收集用户个人信息
- 需要满足中国个人信息保护法律要求
- 需要向用户说明数据处理方式

**包含内容**:
- 个人信息收集和使用说明
- Cookie和追踪技术说明
- 个人信息共享、转让和披露规则
- 用户权利（访问、更正、删除等）
- 未成年人保护
- 跨境数据传输说明
- 联系方式和投诉渠道

**使用方法**:
1. 复制模板内容
2. 替换所有 `[占位符]` 为您的实际信息
3. 根据实际业务调整内容
4. 建议咨询法律顾问审核
5. 发布到网站并在注册页面提供链接

---

### [COOKIE_CONSENT_TEMPLATE.md](./COOKIE_CONSENT_TEMPLATE.md)
Cookie同意政策和技术实施指南。

**适用场景**:
- 网站使用Cookie或类似追踪技术
- 需要实现Cookie同意横幅
- 需要向用户说明Cookie使用情况

**包含内容**:

**第一部分：Cookie政策文档**
- Cookie定义和类型
- 使用的Cookie详细列表
- 第三方Cookie说明
- Cookie管理方法

**第二部分：Cookie横幅UI设计**
- 简单版本横幅（接受/拒绝）
- 详细版本横幅（分类选择）
- UI设计要求和最佳实践

**第三部分：技术实现指南**
- Vue 3 组件实现代码
- Composable逻辑
- 环境变量配置
- 测试清单

**使用方法**:
1. 阅读第一部分，创建Cookie政策页面
2. 根据第二部分设计Cookie横幅UI
3. 参考第三部分实现前端功能
4. 配置环境变量
5. 测试所有功能

---

## 🔗 相关文档

### 主文档
- **[COMPLIANCE_CHECKLIST_CN.md](../COMPLIANCE_CHECKLIST_CN.md)** - 中国合规检查清单（完整版）

### 部署相关
- **[DEPLOYMENT.md](../DEPLOYMENT.md)** - 部署指南
- **[PRODUCTION_CHECKLIST.md](../PRODUCTION_CHECKLIST.md)** - 生产环境检查清单

---

## 📝 快速开始

### 1. 制定隐私政策

```bash
# 1. 复制隐私政策模板
cp docs/compliance/PRIVACY_POLICY_TEMPLATE.md docs/compliance/PRIVACY_POLICY.md

# 2. 编辑文件，替换占位符
# 3. 发布到网站
```

**关键占位符**:
- `[公司/产品名称]`
- `[YYYY年MM月DD日]` - 生效日期
- `[公司全称]`
- `[客服电话]`
- `[隐私保护邮箱]`
- `[个人信息保护负责人]`

### 2. 实现Cookie同意

```bash
# 1. 创建Vue组件
# apps/frontend/components/CookieConsent.vue

# 2. 创建Composable
# apps/frontend/composables/useCookieConsent.ts

# 3. 注册插件
# apps/frontend/plugins/cookie-consent.client.ts

# 4. 在布局中使用
# layouts/default.vue or app.vue
```

参考 [COOKIE_CONSENT_TEMPLATE.md](./COOKIE_CONSENT_TEMPLATE.md) 第三部分的完整代码。

### 3. 配置环境变量

在 `.env` 文件中添加合规配置（参考 `.env.example`）：

```bash
# ICP备案
ICP_FILING_NUMBER=京ICP备12345678号-1
PUBLIC_SECURITY_FILING_NUMBER=京公网安备 11010502012345号

# 隐私保护
PRIVACY_POLICY_URL=/privacy-policy
COOKIE_POLICY_URL=/cookie-policy
COOKIE_CONSENT_ENABLED=true

# 个人信息保护负责人
PERSONAL_INFO_OFFICER_NAME=张三
PERSONAL_INFO_OFFICER_EMAIL=privacy@example.com
PERSONAL_INFO_OFFICER_PHONE=+86-10-12345678
```

### 4. 创建页面

创建以下页面来展示政策文档：

```bash
# 隐私政策页面
apps/frontend/pages/privacy-policy.vue

# Cookie政策页面
apps/frontend/pages/cookie-policy.vue

# Cookie设置页面
apps/frontend/pages/cookie-settings.vue
```

### 5. 添加Footer链接

在页脚组件中添加合规相关链接：

```vue
<footer>
  <div class="footer-links">
    <NuxtLink to="/privacy-policy">隐私政策</NuxtLink>
    <NuxtLink to="/cookie-policy">Cookie政策</NuxtLink>
    <NuxtLink to="/terms-of-service">用户协议</NuxtLink>
  </div>
  <div class="footer-filing">
    <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">
      {{ icpFilingNumber }}
    </a>
    <a href="http://www.beian.gov.cn/portal/registerSystemInfo" target="_blank">
      <img src="/images/beian-icon.png" alt="公安备案">
      {{ publicSecurityFilingNumber }}
    </a>
  </div>
</footer>
```

---

## ✅ 实施检查清单

使用以下清单确保合规实施完整：

### 文档准备
- [ ] 隐私政策已创建并替换所有占位符
- [ ] Cookie政策已创建
- [ ] 用户协议已创建（如需要）
- [ ] 所有文档使用简体中文
- [ ] 法律顾问已审核（强烈推荐）

### 技术实施
- [ ] Cookie同意横幅已实现
- [ ] Cookie分类管理已实现
- [ ] 必要Cookie始终允许
- [ ] 非必要Cookie默认禁用
- [ ] Cookie偏好可随时更改
- [ ] 第三方脚本根据同意加载
- [ ] 环境变量已配置

### 页面创建
- [ ] `/privacy-policy` 页面已创建
- [ ] `/cookie-policy` 页面已创建
- [ ] `/cookie-settings` 页面已创建
- [ ] `/terms-of-service` 页面已创建（如需要）
- [ ] Footer包含所有必要链接
- [ ] ICP备案号已在Footer展示

### 功能测试
- [ ] Cookie横幅首次访问时显示
- [ ] "接受所有"功能正常
- [ ] "仅必要Cookie"功能正常
- [ ] Cookie设置页面功能正常
- [ ] 第三方脚本正确加载/不加载
- [ ] 所有页面链接可访问
- [ ] 移动端显示正常

### 合规审查
- [ ] 隐私政策包含所有法定要求内容
- [ ] 个人信息保护负责人信息已公开
- [ ] Cookie同意机制符合要求
- [ ] 数据存储位置正确（中国境内）
- [ ] ICP备案已完成（生产环境）
- [ ] 公安备案已完成（上线后30天内）

---

## 📚 法律法规参考

### 主要法律
1. **《个人信息保护法》** (Personal Information Protection Law - PIPL)
   - 生效日期：2021年11月1日
   - [法律原文](http://www.npc.gov.cn/npc/c30834/202108/a8c4e3672c74491a80b53a172bb753fe.shtml)

2. **《网络安全法》** (Cybersecurity Law - CSL)
   - 生效日期：2017年6月1日
   - [法律原文](http://www.npc.gov.cn/npc/c30834/201611/21c65ee427fc4d2e93c2372e1b6388f3.shtml)

3. **《数据安全法》** (Data Security Law - DSL)
   - 生效日期：2021年9月1日
   - [法律原文](http://www.npc.gov.cn/npc/c30834/202106/7c9af12f51334a73b56d7938f99a788a.shtml)

4. **《互联网信息服务管理办法》**
   - [查看详情](https://beian.miit.gov.cn/)

### 技术标准
- **GB/T 35273** - 信息安全技术 个人信息安全规范
- **GB/T 22239** - 信息安全技术 网络安全等级保护基本要求

### 官方网站
- [全国ICP备案管理系统](https://beian.miit.gov.cn/)
- [全国公安机关互联网站安全管理服务平台](http://www.beian.gov.cn/)
- [国家互联网信息办公室](http://www.cac.gov.cn/)

---

## ⚠️ 免责声明

本目录中的模板和指南仅供参考，不构成法律意见。具体合规要求可能因以下因素而异：

- 业务类型和规模
- 用户群体和数量
- 数据处理方式
- 地域和行业
- 法律法规的最新变化

**强烈建议**：
1. 咨询专业的法律顾问
2. 根据实际业务情况调整
3. 持续关注法律法规变化
4. 定期审查和更新合规措施

---

## 🆘 需要帮助？

如果您在实施过程中遇到问题：

1. **查看详细文档**：阅读 [COMPLIANCE_CHECKLIST_CN.md](../COMPLIANCE_CHECKLIST_CN.md)
2. **参考示例代码**：查看模板中的代码示例
3. **咨询专业人士**：联系法律顾问或合规专家
4. **社区支持**：查找相关技术社区和论坛

---

## 📅 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| 1.0 | 2024-11-02 | 初始版本：隐私政策模板和Cookie同意模板 |

---

**文档维护**: 请定期检查并更新模板以反映最新的法律法规要求。

**最后更新**: 2024年11月
