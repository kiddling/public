# Cookie同意和政策模板 (Cookie Consent & Policy Template)

> **使用说明**: 本模板提供Cookie横幅、Cookie政策文档和技术实现指引，符合《个人信息保护法》(PIPL) 和相关法规要求。使用前请替换所有 `[占位符]` 为您的实际信息。

---

# 第一部分：Cookie政策文档

## [公司/产品名称] Cookie政策

**最后更新日期**: [YYYY年MM月DD日]  
**生效日期**: [YYYY年MM月DD日]

---

## 1. 什么是Cookie

Cookie是网站或应用程序发送到您的计算机、手机或其他访问设备上的小型文本文件，用于存储和检索信息。Cookie可以帮助网站识别您的设备，记住您的偏好设置，并提供更好的用户体验。

### Cookie的工作原理

当您访问使用Cookie的网站时：
1. 网站向您的浏览器发送Cookie
2. 浏览器将Cookie存储在您的设备上
3. 下次访问该网站时，浏览器会将Cookie发送回网站
4. 网站读取Cookie信息，识别您的设备并恢复您的设置

### Cookie的类型

**按持续时间分类**:

- **会话Cookie（Session Cookies）**: 临时Cookie，关闭浏览器后自动删除
- **持久Cookie（Persistent Cookies）**: 存储在设备上直到过期或被手动删除

**按设置方**:

- **第一方Cookie**: 由我们的网站直接设置的Cookie
- **第三方Cookie**: 由第三方服务提供商（如分析工具、广告网络）设置的Cookie

---

## 2. 我们为什么使用Cookie

我们使用Cookie来：

- ✅ 维持网站正常运行和提供基本功能
- ✅ 记住您的登录状态和偏好设置
- ✅ 分析网站使用情况，改善用户体验
- ✅ 提供个性化内容和推荐
- ✅ 衡量广告效果（如果适用）
- ✅ 保障网站安全，防止欺诈

---

## 3. 我们使用的Cookie类型

### 3.1 必要Cookie（无需您的同意）

这些Cookie对于网站的基本功能是必需的。没有这些Cookie，网站的某些功能将无法正常工作。**您不能拒绝这些Cookie。**

| Cookie名称 | 目的 | 有效期 | 类型 |
|-----------|------|--------|------|
| session_id | 维持用户会话 | 会话 | 第一方 |
| csrf_token | 防止跨站请求伪造（CSRF）攻击 | 会话 | 第一方 |
| auth_token | 身份验证 | [X小时/天] | 第一方 |
| cookie_consent | 记录您的Cookie同意选项 | 1年 | 第一方 |
| [其他必要Cookie] | [目的] | [期限] | [类型] |

**使用目的**:
- 维持您的登录状态
- 保存购物车内容
- 确保网站安全
- 记住您的Cookie偏好设置

### 3.2 功能性Cookie（需要您的同意）

这些Cookie使网站能够记住您的选择和偏好，提供更个性化的体验。

| Cookie名称 | 目的 | 有效期 | 类型 |
|-----------|------|--------|------|
| lang | 记住语言选择 | 1年 | 第一方 |
| theme | 记住主题偏好（亮色/暗色） | 1年 | 第一方 |
| font_size | 记住字体大小设置 | 1年 | 第一方 |
| layout_pref | 记住布局偏好 | 1年 | 第一方 |
| [其他功能Cookie] | [目的] | [期限] | [类型] |

**使用目的**:
- 记住您的语言选择
- 保存您的界面布局偏好
- 记住您的视频播放设置

**如果您拒绝这些Cookie**: 网站将使用默认设置，每次访问可能需要重新设置您的偏好。

### 3.3 分析/性能Cookie（需要您的同意）

这些Cookie帮助我们了解访问者如何使用网站，以便我们改善网站性能和用户体验。收集的信息是聚合和匿名的。

| Cookie名称 | 提供商 | 目的 | 有效期 | 隐私政策 |
|-----------|--------|------|--------|---------|
| _ga | Google Analytics | 区分用户 | 2年 | [链接] |
| _gid | Google Analytics | 区分用户 | 24小时 | [链接] |
| _gat | Google Analytics | 限制请求率 | 1分钟 | [链接] |
| HMACCOUNT | 百度统计 | 识别用户 | 1年 | [链接] |
| [其他分析Cookie] | [提供商] | [目的] | [期限] | [链接] |

**使用目的**:
- 统计网站访问量和流量来源
- 了解哪些页面最受欢迎
- 识别技术问题和错误
- 优化网站性能
- 改善用户体验

**收集的信息**:
- 页面访问量
- 访问时长和跳出率
- 设备类型和屏幕分辨率
- 地理位置（城市级别）
- 浏览器类型和版本

**如果您拒绝这些Cookie**: 不会影响您使用网站，但我们将无法了解您的使用偏好，可能影响我们改进服务的能力。

### 3.4 广告/营销Cookie（需要您的单独同意）

[如果不使用广告Cookie，可删除此部分]

这些Cookie用于向您展示与您相关的广告，限制广告展示次数，并衡量广告活动的效果。

| Cookie名称 | 提供商 | 目的 | 有效期 | 隐私政策 |
|-----------|--------|------|--------|---------|
| [Cookie名称] | [广告平台] | 广告定向 | [期限] | [链接] |
| [Cookie名称] | [广告平台] | 再营销 | [期限] | [链接] |

**使用目的**:
- 展示与您兴趣相关的广告
- 防止您多次看到相同广告
- 衡量广告活动的效果
- 了解您对广告的互动

**如果您拒绝这些Cookie**: 您仍会看到广告，但这些广告将不会根据您的兴趣进行个性化定制。

---

## 4. 第三方Cookie

我们的网站可能包含来自第三方服务提供商的Cookie。这些第三方有自己的隐私政策，我们无法控制它们的Cookie设置。

### 4.1 分析服务

**Google Analytics** / **百度统计** / **友盟统计**
- **目的**: 网站流量分析和用户行为分析
- **收集的信息**: 页面浏览量、访问时长、设备信息、地理位置（概略）
- **隐私政策**: [链接]
- **退出方式**: [退出链接]

### 4.2 社交媒体插件

[如适用]

**微信分享** / **微博分享** / **QQ分享**
- **目的**: 允许您在社交媒体上分享内容
- **收集的信息**: 您分享的内容、社交媒体ID
- **隐私政策**: [链接]

### 4.3 广告网络

[如适用]

**[广告平台名称]**
- **目的**: 广告投放和效果追踪
- **收集的信息**: 浏览行为、广告互动、设备信息
- **隐私政策**: [链接]
- **退出方式**: [退出链接]

### 4.4 其他第三方服务

| 服务名称 | 提供商 | 目的 | 隐私政策 |
|---------|--------|------|---------|
| [服务名称] | [提供商] | [目的] | [链接] |

---

## 5. 其他跟踪技术

除Cookie外，我们还可能使用以下技术：

### 5.1 本地存储（LocalStorage / SessionStorage）

**用途**: 存储应用程序数据和用户偏好设置

**存储内容**:
- 用户界面设置
- 草稿内容
- 离线数据缓存

**管理方式**: 可通过浏览器开发者工具清除

### 5.2 Web Beacons（像素标签）

**用途**: 统计页面访问量和邮件打开率

**工作原理**: 在页面或邮件中嵌入1x1像素的透明图片

**收集信息**: 页面浏览次数、邮件打开时间

### 5.3 设备指纹

[如果使用]

**用途**: 识别设备以防止欺诈

**收集信息**: 设备配置、浏览器设置、字体列表等

**注意**: 我们不会使用设备指纹来追踪您在其他网站的活动

---

## 6. 如何管理Cookie

您可以通过多种方式控制和管理Cookie。

### 6.1 我们的Cookie设置工具

**最简便的方式**: 使用我们的Cookie设置工具来管理您的偏好。

访问方式:
- 点击网站底部的"Cookie设置"链接
- 或访问: [Cookie设置页面URL]

在设置页面，您可以:
- ✅ 接受或拒绝不同类别的Cookie
- ✅ 查看详细的Cookie列表
- ✅ 随时更改您的选择

### 6.2 浏览器设置

大多数浏览器允许您通过设置管理Cookie。

**Chrome浏览器**:
1. 点击右上角三点菜单 → 设置
2. 隐私和安全 → Cookie及其他网站数据
3. 选择Cookie设置选项

**Firefox浏览器**:
1. 点击右上角三线菜单 → 设置
2. 隐私与安全 → Cookie和网站数据
3. 选择Cookie设置选项

**Safari浏览器**:
1. 偏好设置 → 隐私
2. 管理网站数据
3. 阻止Cookie设置

**Edge浏览器**:
1. 设置 → Cookie和网站权限
2. Cookie和站点数据
3. 选择Cookie设置选项

### 6.3 移动设备设置

**iOS设备**:
1. 设置 → Safari → 隐私与安全性
2. 阻止所有Cookie

**Android设备**:
1. Chrome设置 → 网站设置 → Cookie
2. 选择Cookie设置选项

### 6.4 退出第三方Cookie

**Google Analytics退出**:
- 安装 [Google Analytics退出浏览器插件](https://tools.google.com/dlpage/gaoptout)

**广告Cookie退出**:
- 访问 [中国互联网广告协会](http://www.iaa-china.org/)（如适用）
- 或各广告平台的退出页面

### 6.5 禁用Cookie的后果

请注意，如果您选择禁用Cookie:

- ❌ 某些网站功能可能无法正常工作
- ❌ 您可能需要在每次访问时重新登录
- ❌ 您的偏好设置不会被记住
- ❌ 网站性能和用户体验可能下降

**必要Cookie始终启用，因为它们对于网站运行是必不可少的。**

---

## 7. Cookie同意的记录

我们会记录您的Cookie同意选择，包括：

- 同意的时间和日期
- 您选择的Cookie类别
- 同意版本号

**记录保存期限**: 至少6个月

**您可以随时查看和更改您的Cookie同意设置。**

---

## 8. Cookie政策的更新

我们可能会不时更新本Cookie政策，以反映Cookie使用方式的变化或法律要求的变化。

**当我们进行重大变更时，我们会**:
- 更新本页面顶部的"最后更新日期"
- 通过Cookie横幅通知您
- 在某些情况下，通过电子邮件通知您

**继续使用我们的网站即表示您接受更新后的Cookie政策。**

---

## 9. 联系我们

如果您对我们的Cookie使用有任何疑问，请联系我们：

- **电子邮箱**: [隐私保护邮箱]
- **客服电话**: [电话号码]
- **在线客服**: [客服链接]
- **邮寄地址**: [地址]

您也可以查看我们的 [隐私政策](./PRIVACY_POLICY_TEMPLATE.md) 了解更多关于个人信息保护的信息。

---

# 第二部分：Cookie横幅实现

## Cookie同意横幅

### UI设计要求

1. **显著性**: 横幅应显眼但不妨碍浏览
2. **清晰性**: 语言简洁明了，易于理解
3. **可操作性**: 提供明确的接受/拒绝按钮
4. **可访问性**: 符合WCAG 2.1 AA标准

### 横幅显示时机

- ✅ 首次访问网站时
- ✅ Cookie同意过期后
- ✅ Cookie政策重大更新后
- ❌ 不应在每次访问时都显示（如已同意）

### 横幅内容示例

#### 简单版本（仅接受/拒绝）

```html
<div class="cookie-banner" role="dialog" aria-label="Cookie同意横幅" aria-describedby="cookie-desc">
  <div class="cookie-banner__content">
    <h3>Cookie使用提示</h3>
    <p id="cookie-desc">
      我们使用Cookie来提升您的浏览体验、提供个性化内容和分析网站流量。
      点击"接受所有"即表示您同意我们使用Cookie。
      <a href="/cookie-policy" target="_blank">了解更多</a>
    </p>
    <div class="cookie-banner__actions">
      <button type="button" class="btn-primary" onclick="acceptAllCookies()">
        接受所有
      </button>
      <button type="button" class="btn-secondary" onclick="rejectNonEssential()">
        仅接受必要Cookie
      </button>
      <button type="button" class="btn-link" onclick="showCookieSettings()">
        Cookie设置
      </button>
    </div>
  </div>
</div>
```

#### 详细版本（分类选择）

```html
<div class="cookie-banner cookie-banner--detailed" role="dialog" aria-label="Cookie同意设置">
  <div class="cookie-banner__header">
    <h2>我们重视您的隐私</h2>
    <button type="button" class="close-btn" onclick="closeBanner()" aria-label="关闭">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  
  <div class="cookie-banner__body">
    <p>
      我们使用Cookie来改善您的体验。您可以选择接受所有Cookie，
      或者自定义您的Cookie偏好。
    </p>
    
    <div class="cookie-categories">
      <!-- 必要Cookie -->
      <div class="cookie-category">
        <div class="cookie-category__header">
          <label>
            <input type="checkbox" checked disabled>
            <strong>必要Cookie</strong>
            <span class="required-badge">必需</span>
          </label>
        </div>
        <p class="cookie-category__desc">
          这些Cookie对于网站正常运行是必需的，无法禁用。
        </p>
      </div>
      
      <!-- 功能性Cookie -->
      <div class="cookie-category">
        <div class="cookie-category__header">
          <label>
            <input type="checkbox" id="cookie-functional" checked>
            <strong>功能性Cookie</strong>
          </label>
          <button type="button" class="toggle-details" onclick="toggleDetails('functional')">
            详情 <span class="arrow">▼</span>
          </button>
        </div>
        <div id="functional-details" class="cookie-category__details" hidden>
          <p>这些Cookie使网站能够记住您的选择和偏好。</p>
          <p><strong>用途</strong>: 语言选择、主题设置、布局偏好</p>
          <p><strong>有效期</strong>: 最长1年</p>
        </div>
      </div>
      
      <!-- 分析Cookie -->
      <div class="cookie-category">
        <div class="cookie-category__header">
          <label>
            <input type="checkbox" id="cookie-analytics" checked>
            <strong>分析Cookie</strong>
          </label>
          <button type="button" class="toggle-details" onclick="toggleDetails('analytics')">
            详情 <span class="arrow">▼</span>
          </button>
        </div>
        <div id="analytics-details" class="cookie-category__details" hidden>
          <p>这些Cookie帮助我们了解访问者如何使用网站。</p>
          <p><strong>用途</strong>: 流量统计、用户行为分析</p>
          <p><strong>第三方</strong>: Google Analytics、百度统计</p>
          <p><strong>有效期</strong>: 最长2年</p>
        </div>
      </div>
      
      <!-- 广告Cookie -->
      <div class="cookie-category">
        <div class="cookie-category__header">
          <label>
            <input type="checkbox" id="cookie-advertising">
            <strong>广告Cookie</strong>
          </label>
          <button type="button" class="toggle-details" onclick="toggleDetails('advertising')">
            详情 <span class="arrow">▼</span>
          </button>
        </div>
        <div id="advertising-details" class="cookie-category__details" hidden>
          <p>这些Cookie用于向您展示相关的广告。</p>
          <p><strong>用途</strong>: 广告定向、再营销</p>
          <p><strong>有效期</strong>: 最长1年</p>
        </div>
      </div>
    </div>
  </div>
  
  <div class="cookie-banner__footer">
    <button type="button" class="btn-primary" onclick="savePreferences()">
      保存设置
    </button>
    <button type="button" class="btn-secondary" onclick="acceptAll()">
      接受所有
    </button>
    <button type="button" class="btn-text" onclick="rejectAll()">
      拒绝非必要Cookie
    </button>
  </div>
  
  <div class="cookie-banner__links">
    <a href="/privacy-policy">隐私政策</a> | 
    <a href="/cookie-policy">Cookie政策</a>
  </div>
</div>
```

---

# 第三部分：技术实现指引

## 前端实现

### 1. Vue 3 组件实现

创建文件: `apps/frontend/components/CookieConsent.vue`

```vue
<template>
  <Teleport to="body">
    <div
      v-if="showBanner"
      class="cookie-consent-overlay"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div class="cookie-consent-banner" @click.stop>
        <div class="cookie-consent-header">
          <h2 id="cookie-consent-title">Cookie使用提示</h2>
          <button
            type="button"
            class="close-button"
            @click="showBanner = false"
            aria-label="关闭"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div class="cookie-consent-body">
          <p id="cookie-consent-desc">
            我们使用Cookie来提升您的浏览体验、提供个性化内容和分析网站流量。
            <a href="/cookie-policy" target="_blank" rel="noopener">了解更多</a>
          </p>

          <div v-if="showDetails" class="cookie-categories">
            <div v-for="category in categories" :key="category.id" class="cookie-category">
              <label class="cookie-category-label">
                <input
                  type="checkbox"
                  :checked="category.enabled"
                  :disabled="category.required"
                  @change="toggleCategory(category.id)"
                />
                <div class="cookie-category-info">
                  <strong>{{ category.name }}</strong>
                  <span v-if="category.required" class="badge-required">必需</span>
                  <p class="cookie-category-desc">{{ category.description }}</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="cookie-consent-footer">
          <button type="button" class="btn btn-primary" @click="acceptAll">
            接受所有Cookie
          </button>
          <button type="button" class="btn btn-secondary" @click="rejectNonEssential">
            仅接受必要Cookie
          </button>
          <button type="button" class="btn btn-link" @click="showDetails = !showDetails">
            {{ showDetails ? '隐藏' : '显示' }}详细设置
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCookieConsent } from '~/composables/useCookieConsent';

const { 
  hasConsent, 
  getConsent, 
  setConsent, 
  categories 
} = useCookieConsent();

const showBanner = ref(false);
const showDetails = ref(false);

onMounted(() => {
  // 检查是否已有Cookie同意记录
  if (!hasConsent()) {
    showBanner.value = true;
    
    // 焦点陷阱
    trapFocus();
  }
});

function acceptAll() {
  setConsent({
    necessary: true,
    functional: true,
    analytics: true,
    advertising: true,
  });
  showBanner.value = false;
  
  // 加载第三方脚本
  loadThirdPartyScripts();
}

function rejectNonEssential() {
  setConsent({
    necessary: true,
    functional: false,
    analytics: false,
    advertising: false,
  });
  showBanner.value = false;
}

function toggleCategory(categoryId: string) {
  // 实现类别切换逻辑
  const category = categories.value.find(c => c.id === categoryId);
  if (category && !category.required) {
    category.enabled = !category.enabled;
  }
}

function trapFocus() {
  // 实现焦点陷阱，确保键盘用户只能在弹窗内导航
  // TODO: 添加焦点陷阱逻辑
}

function loadThirdPartyScripts() {
  // 根据用户同意加载第三方脚本
  const consent = getConsent();
  
  if (consent.analytics) {
    // 加载分析脚本（Google Analytics、百度统计等）
    loadAnalyticsScripts();
  }
  
  if (consent.advertising) {
    // 加载广告脚本
    loadAdvertisingScripts();
  }
}

function loadAnalyticsScripts() {
  // TODO: 实现分析脚本加载
  // 示例: Google Analytics
  // window.gtag('consent', 'update', {
  //   'analytics_storage': 'granted'
  // });
}

function loadAdvertisingScripts() {
  // TODO: 实现广告脚本加载
}
</script>

<style scoped>
/* TODO: 添加样式 */
.cookie-consent-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.cookie-consent-banner {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 更多样式... */
</style>
```

### 2. Composable实现

创建文件: `apps/frontend/composables/useCookieConsent.ts`

```typescript
// apps/frontend/composables/useCookieConsent.ts
import { ref, computed } from 'vue';

export enum CookieCategory {
  NECESSARY = 'necessary',
  FUNCTIONAL = 'functional',
  ANALYTICS = 'analytics',
  ADVERTISING = 'advertising',
}

export interface CookieConsent {
  timestamp: Date;
  version: string;
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
}

const CONSENT_COOKIE_NAME = 'cookie_consent';
const CONSENT_VERSION = '1.0';
const CONSENT_EXPIRY_DAYS = 365;

export function useCookieConsent() {
  const categories = ref([
    {
      id: CookieCategory.NECESSARY,
      name: '必要Cookie',
      description: '这些Cookie对于网站正常运行是必需的，无法禁用。',
      required: true,
      enabled: true,
    },
    {
      id: CookieCategory.FUNCTIONAL,
      name: '功能性Cookie',
      description: '这些Cookie使网站能够记住您的选择和偏好。',
      required: false,
      enabled: true,
    },
    {
      id: CookieCategory.ANALYTICS,
      name: '分析Cookie',
      description: '这些Cookie帮助我们了解访问者如何使用网站。',
      required: false,
      enabled: true,
    },
    {
      id: CookieCategory.ADVERTISING,
      name: '广告Cookie',
      description: '这些Cookie用于向您展示相关的广告。',
      required: false,
      enabled: false,
    },
  ]);

  /**
   * 检查是否已有Cookie同意记录
   */
  function hasConsent(): boolean {
    const consent = getCookie(CONSENT_COOKIE_NAME);
    return consent !== null;
  }

  /**
   * 获取Cookie同意记录
   */
  function getConsent(): CookieConsent | null {
    const consentStr = getCookie(CONSENT_COOKIE_NAME);
    if (!consentStr) return null;

    try {
      const consent = JSON.parse(decodeURIComponent(consentStr));
      return {
        ...consent,
        timestamp: new Date(consent.timestamp),
      };
    } catch (error) {
      console.error('Failed to parse cookie consent:', error);
      return null;
    }
  }

  /**
   * 设置Cookie同意记录
   */
  function setConsent(consent: Omit<CookieConsent, 'timestamp' | 'version'>) {
    const fullConsent: CookieConsent = {
      ...consent,
      timestamp: new Date(),
      version: CONSENT_VERSION,
    };

    const consentStr = encodeURIComponent(JSON.stringify(fullConsent));
    setCookie(CONSENT_COOKIE_NAME, consentStr, CONSENT_EXPIRY_DAYS);

    // 清除未同意类别的Cookie
    clearNonConsentedCookies(fullConsent);

    // 触发事件，通知其他组件
    emitConsentChange(fullConsent);
  }

  /**
   * 检查特定类别是否已同意
   */
  function hasConsentForCategory(category: CookieCategory): boolean {
    const consent = getConsent();
    if (!consent) return false;

    return consent[category] === true;
  }

  /**
   * 撤回Cookie同意
   */
  function revokeConsent() {
    deleteCookie(CONSENT_COOKIE_NAME);
    clearNonConsentedCookies({
      necessary: true,
      functional: false,
      analytics: false,
      advertising: false,
    });
  }

  /**
   * 清除未同意类别的Cookie
   */
  function clearNonConsentedCookies(consent: Omit<CookieConsent, 'timestamp' | 'version'>) {
    // 功能性Cookie
    if (!consent.functional) {
      deleteCookie('lang');
      deleteCookie('theme');
      deleteCookie('font_size');
      // 添加其他功能性Cookie
    }

    // 分析Cookie
    if (!consent.analytics) {
      // 清除Google Analytics Cookie
      deleteCookie('_ga');
      deleteCookie('_gid');
      deleteCookie('_gat');
      // 清除百度统计Cookie
      deleteCookie('HMACCOUNT');
      // 添加其他分析Cookie
    }

    // 广告Cookie
    if (!consent.advertising) {
      // 清除广告Cookie
      // deleteCookie('ad_cookie_name');
    }
  }

  /**
   * 触发Cookie同意变更事件
   */
  function emitConsentChange(consent: CookieConsent) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cookie-consent-change', { detail: consent })
      );
    }
  }

  // Cookie工具函数
  function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  function setCookie(name: string, value: string, days: number) {
    if (typeof document === 'undefined') return;

    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`;
  }

  function deleteCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  return {
    categories,
    hasConsent,
    getConsent,
    setConsent,
    hasConsentForCategory,
    revokeConsent,
  };
}
```

### 3. 插件注册

创建文件: `apps/frontend/plugins/cookie-consent.client.ts`

```typescript
// apps/frontend/plugins/cookie-consent.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  // 在应用启动时检查Cookie同意
  if (process.client) {
    const { hasConsent, getConsent, hasConsentForCategory } = useCookieConsent();

    // 如果已有同意记录，根据同意情况加载第三方脚本
    if (hasConsent()) {
      const consent = getConsent();
      
      if (consent?.analytics) {
        // 加载分析脚本
        loadAnalytics();
      }
      
      if (consent?.advertising) {
        // 加载广告脚本
        loadAdvertising();
      }
    }

    // 监听Cookie同意变更事件
    window.addEventListener('cookie-consent-change', (event: any) => {
      const consent = event.detail;
      
      if (consent.analytics) {
        loadAnalytics();
      }
      
      if (consent.advertising) {
        loadAdvertising();
      }
    });
  }
});

function loadAnalytics() {
  // TODO: 加载Google Analytics或百度统计
  // 示例:
  // useHead({
  //   script: [
  //     {
  //       src: 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID',
  //       async: true,
  //     },
  //   ],
  // });
}

function loadAdvertising() {
  // TODO: 加载广告脚本
}
```

### 4. 在布局中使用

在 `apps/frontend/layouts/default.vue` 或 `app.vue` 中添加:

```vue
<template>
  <div>
    <slot />
    <CookieConsent />
  </div>
</template>
```

### 5. Cookie设置页面

创建文件: `apps/frontend/pages/cookie-settings.vue`

```vue
<template>
  <div class="container cookie-settings-page">
    <h1>Cookie设置</h1>
    
    <p>您可以随时更改您的Cookie偏好设置。</p>
    
    <div class="cookie-categories">
      <div v-for="category in categories" :key="category.id" class="cookie-category-card">
        <div class="cookie-category-header">
          <div>
            <h3>{{ category.name }}</h3>
            <span v-if="category.required" class="badge-required">必需</span>
          </div>
          <label class="toggle-switch">
            <input
              type="checkbox"
              :checked="category.enabled"
              :disabled="category.required"
              @change="toggleCategory(category.id)"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <p class="cookie-category-description">{{ category.description }}</p>
      </div>
    </div>
    
    <div class="actions">
      <button type="button" class="btn btn-primary" @click="saveSettings">
        保存设置
      </button>
      <button type="button" class="btn btn-secondary" @click="resetSettings">
        重置为默认
      </button>
    </div>
    
    <div class="info-section">
      <h2>更多信息</h2>
      <p>
        如需了解更多关于我们如何使用Cookie的信息，请查看我们的
        <NuxtLink to="/cookie-policy">Cookie政策</NuxtLink> 和
        <NuxtLink to="/privacy-policy">隐私政策</NuxtLink>。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: 实现Cookie设置页面逻辑
</script>
```

---

## 后端实现（Strapi CMS）

### Cookie同意记录（可选）

如果需要在服务器端记录用户的Cookie同意情况（用于审计），可以创建Strapi内容类型：

创建文件: `apps/cms/src/api/cookie-consent-log/content-types/cookie-consent-log/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "cookie_consent_logs",
  "info": {
    "singularName": "cookie-consent-log",
    "pluralName": "cookie-consent-logs",
    "displayName": "Cookie Consent Log"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "userId": {
      "type": "string",
      "required": false
    },
    "ipAddress": {
      "type": "string",
      "required": true
    },
    "userAgent": {
      "type": "text",
      "required": false
    },
    "consentVersion": {
      "type": "string",
      "required": true
    },
    "necessary": {
      "type": "boolean",
      "default": true,
      "required": true
    },
    "functional": {
      "type": "boolean",
      "default": false
    },
    "analytics": {
      "type": "boolean",
      "default": false
    },
    "advertising": {
      "type": "boolean",
      "default": false
    },
    "timestamp": {
      "type": "datetime",
      "required": true
    }
  }
}
```

---

## 环境变量配置

在 `.env` 文件中添加Cookie相关配置：

```bash
# Cookie和跟踪合规配置
NUXT_PUBLIC_COOKIE_CONSENT_ENABLED=true
NUXT_PUBLIC_COOKIE_CONSENT_VERSION=1.0

# 分析工具（默认禁用，用户同意后启用）
NUXT_PUBLIC_ANALYTICS_ENABLED=false
NUXT_PUBLIC_GA_MEASUREMENT_ID=
NUXT_PUBLIC_BAIDU_ANALYTICS_ID=

# 广告（默认禁用）
NUXT_PUBLIC_ADVERTISING_ENABLED=false
```

---

## 测试清单

- [ ] Cookie横幅在首次访问时显示
- [ ] 点击"接受所有"后横幅消失且不再显示
- [ ] 点击"仅接受必要"后非必要Cookie被清除
- [ ] Cookie设置页面可以正确更改偏好
- [ ] 撤回同意后第三方脚本停止加载
- [ ] 必要Cookie无法禁用
- [ ] Cookie同意记录正确保存
- [ ] 横幅符合无障碍标准（键盘导航、屏幕阅读器）
- [ ] 在不同浏览器中测试（Chrome、Firefox、Safari、Edge）
- [ ] 移动设备测试

---

## 合规检查清单

- [ ] Cookie横幅在用户同意前显示
- [ ] 提供清晰的接受/拒绝选项
- [ ] 不使用"继续浏览即同意"的方式
- [ ] 提供详细的Cookie分类说明
- [ ] 链接到完整的Cookie政策
- [ ] 允许用户随时更改Cookie偏好
- [ ] 非必要Cookie在用户同意前不加载
- [ ] 第三方Cookie已在政策中说明
- [ ] Cookie政策使用简体中文
- [ ] 记录Cookie同意历史（至少6个月）

---

**本模板定期更新以反映最新的法律要求和最佳实践。最后更新: 2024年11月**
