import type { Resource } from '~/types/resource'

/**
 * Export resources to CSV format
 */
export const exportToCSV = (resources: Resource[], filename: string = 'resources.csv') => {
  if (!resources.length) {
    return
  }

  const headers = [
    '标题',
    '描述',
    '类别',
    '媒介类型',
    '学科领域',
    '可访问性状态',
    '链接',
    '最后检查时间',
    '标签',
  ]

  const rows = resources.map((resource) => [
    escapeCsvValue(resource.title),
    escapeCsvValue(resource.description || ''),
    escapeCsvValue(getCategoryLabel(resource.category)),
    escapeCsvValue(getMediumLabel(resource.medium)),
    escapeCsvValue(resource.disciplines?.join(', ') || ''),
    escapeCsvValue(getAccessibilityLabel(resource.accessibilityStatus)),
    escapeCsvValue(resource.url || ''),
    escapeCsvValue(resource.lastChecked ? new Date(resource.lastChecked).toLocaleDateString('zh-CN') : ''),
    escapeCsvValue(resource.tags?.join(', ') || ''),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, filename)
}

/**
 * Export resources to PDF format (simple HTML-to-PDF approach)
 */
export const exportToPDF = (resources: Resource[], _filename: string = 'resources.pdf') => {
  if (!resources.length) {
    return
  }

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>资源库列表</title>
  <style>
    body {
      font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
      margin: 20px;
      font-size: 12px;
    }
    h1 {
      color: #333;
      border-bottom: 2px solid #0ea5e9;
      padding-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f3f4f6;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .status-verified {
      color: #10b981;
      font-weight: bold;
    }
    .status-needs-attention {
      color: #f59e0b;
      font-weight: bold;
    }
    .status-unknown {
      color: #6b7280;
    }
  </style>
</head>
<body>
  <h1>资源库列表</h1>
  <p>导出时间：${new Date().toLocaleString('zh-CN')}</p>
  <p>总计：${resources.length} 项资源</p>
  <table>
    <thead>
      <tr>
        <th>标题</th>
        <th>类别</th>
        <th>媒介</th>
        <th>状态</th>
        <th>学科</th>
        <th>链接</th>
      </tr>
    </thead>
    <tbody>
      ${resources.map(resource => `
        <tr>
          <td>${escapeHtml(resource.title)}</td>
          <td>${escapeHtml(getCategoryLabel(resource.category))}</td>
          <td>${escapeHtml(getMediumLabel(resource.medium))}</td>
          <td class="status-${resource.accessibilityStatus}">
            ${escapeHtml(getAccessibilityLabel(resource.accessibilityStatus))}
          </td>
          <td>${escapeHtml(resource.disciplines?.join(', ') || '-')}</td>
          <td style="word-break: break-all; font-size: 10px;">
            ${resource.url ? `<a href="${escapeHtml(resource.url)}">${escapeHtml(resource.url)}</a>` : '-'}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
  `

  // Open in new window for printing to PDF
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Trigger print dialog after content loads
    printWindow.onload = () => {
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }
}

// Helper functions
function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (char) => escapeMap[char] || char)
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'video-tutorials': '视频教程',
    'tool-links': '工具链接',
    'case-databases': '案例数据库',
    'readings': '阅读材料',
    'pbr-libraries': 'PBR 资源库',
  }
  return labels[category] || category
}

function getMediumLabel(medium: string): string {
  const labels: Record<string, string> = {
    'video': '视频',
    'link': '链接',
    'pdf': 'PDF',
    'document': '文档',
    'interactive': '互动',
    'download': '下载',
  }
  return labels[medium] || medium
}

function getAccessibilityLabel(status: string): string {
  const labels: Record<string, string> = {
    'verified': '已验证',
    'needs-attention': '需关注',
    'unknown': '未知',
  }
  return labels[status] || status
}
