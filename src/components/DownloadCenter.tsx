'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText, Image, Video, Link as LinkIcon, Search, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import type { DownloadableResource } from '@/types';
import { formatFileSize } from '@/lib/utils';
import { fetchDownloadableResources, getStrapiMediaUrl } from '@/lib/strapi';

export default function DownloadCenter() {
  const [resources, setResources] = useState<DownloadableResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [downloadStatus, setDownloadStatus] = useState<Record<string, 'idle' | 'downloading' | 'success' | 'error'>>({});

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await fetchDownloadableResources();
      
      if (data.length === 0) {
        const sampleResources: DownloadableResource[] = [
          {
            id: '1',
            title: 'P-04 问题定义模板',
            description: '用于定义设计问题和分析背景的工作表',
            category: '设计模板',
            fileType: 'PDF',
            fileSize: 524288,
            downloadUrl: '/templates/p04-template.pdf',
            checksum: 'sha256:abc123...',
            offlineAvailable: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'P-05 创意发散工作表',
            description: '帮助记录和组织创意想法的模板',
            category: '设计模板',
            fileType: 'PDF',
            fileSize: 614400,
            downloadUrl: '/templates/p05-template.pdf',
            checksum: 'sha256:def456...',
            offlineAvailable: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '3',
            title: 'P-06 方案评估表',
            description: '用于评估和反思设计方案的工具',
            category: '设计模板',
            fileType: 'PDF',
            fileSize: 491520,
            downloadUrl: '/templates/p06-template.pdf',
            checksum: 'sha256:ghi789...',
            offlineAvailable: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '4',
            title: '用户研究计划模板',
            description: '系统化规划用户研究活动的模板',
            category: '研究工具',
            fileType: 'DOCX',
            fileSize: 102400,
            downloadUrl: '/templates/user-research-plan.docx',
            offlineAvailable: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '5',
            title: '案例研究分析框架',
            description: '分析和记录设计案例的结构化框架',
            category: '研究工具',
            fileType: 'PDF',
            fileSize: 716800,
            downloadUrl: '/templates/case-study-framework.pdf',
            offlineAvailable: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '6',
            title: 'AI 提示词指南',
            description: '如何有效使用AI工具辅助设计工作',
            category: 'AI工具',
            fileType: 'PDF',
            fileSize: 1048576,
            downloadUrl: '/guides/ai-prompts-guide.pdf',
            offlineAvailable: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setResources(sampleResources);
      } else {
        const mappedResources: DownloadableResource[] = data.map((item: any) => ({
          id: item.id.toString(),
          title: item.attributes.title,
          description: item.attributes.description || '',
          category: item.attributes.category || '未分类',
          fileType: item.attributes.fileType || 'PDF',
          fileSize: item.attributes.fileSize || 0,
          downloadUrl: getStrapiMediaUrl(item.attributes.file?.data?.attributes?.url || ''),
          checksum: item.attributes.checksum,
          offlineAvailable: item.attributes.offlineAvailable || false,
          strapiId: item.id,
          createdAt: item.attributes.createdAt,
          updatedAt: item.attributes.updatedAt,
        }));
        setResources(mappedResources);
      }
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource: DownloadableResource) => {
    setDownloadStatus({ ...downloadStatus, [resource.id]: 'downloading' });

    try {
      const response = await fetch(resource.downloadUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resource.title}.${resource.fileType.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadStatus({ ...downloadStatus, [resource.id]: 'success' });
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, [resource.id]: 'idle' }));
      }, 3000);
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus({ ...downloadStatus, [resource.id]: 'error' });
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, [resource.id]: 'idle' }));
      }, 3000);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toUpperCase()) {
      case 'PDF':
      case 'DOC':
      case 'DOCX':
        return <FileText className="w-8 h-8" />;
      case 'JPG':
      case 'PNG':
      case 'SVG':
        return <Image className="w-8 h-8" />;
      case 'MP4':
      case 'AVI':
        return <Video className="w-8 h-8" />;
      default:
        return <LinkIcon className="w-8 h-8" />;
    }
  };

  const categories = ['all', ...Array.from(new Set(resources.map(r => r.category)))];
  
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载资源中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-chinese mb-2">下载中心</h1>
        <p className="text-gray-600">模板、工作表和学习资源</p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索资源..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className="flex items-center gap-2 text-gray-600">
            <Filter className="w-4 h-4" />
            分类:
          </span>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                categoryFilter === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category === 'all' ? '全部' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <div key={resource.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-primary-100 text-primary-600 rounded-lg">
                  {getFileIcon(resource.fileType)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold font-chinese text-lg mb-1">{resource.title}</h3>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {resource.fileType}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>

              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>{formatFileSize(resource.fileSize)}</span>
                {resource.offlineAvailable && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    离线可用
                  </span>
                )}
              </div>

              {resource.checksum && (
                <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-500 font-mono truncate">
                  {resource.checksum}
                </div>
              )}

              <button
                onClick={() => handleDownload(resource)}
                disabled={downloadStatus[resource.id] === 'downloading'}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  downloadStatus[resource.id] === 'success'
                    ? 'bg-green-600 text-white'
                    : downloadStatus[resource.id] === 'error'
                    ? 'bg-red-600 text-white'
                    : downloadStatus[resource.id] === 'downloading'
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {downloadStatus[resource.id] === 'downloading' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    下载中...
                  </>
                ) : downloadStatus[resource.id] === 'success' ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    下载成功
                  </>
                ) : downloadStatus[resource.id] === 'error' ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    下载失败
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    下载
                  </>
                )}
              </button>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <span className="text-xs text-gray-500">{resource.category}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">未找到匹配的资源</p>
        </div>
      )}
    </div>
  );
}
