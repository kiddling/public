'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Share2, FileDown, History, Check, Download } from 'lucide-react';
import type { AIPrompt, AIPromptVersion } from '@/types';
import { copyToClipboard } from '@/lib/utils';
import { exportToText, exportToPDF } from '@/lib/pdf-export';
import { aiPromptsStorage } from '@/lib/storage';

interface AIPromptCardProps {
  prompt: AIPrompt;
  onUpdate?: (prompt: AIPrompt) => void;
}

export default function AIPromptCard({ prompt, onUpdate }: AIPromptCardProps) {
  const [showVersions, setShowVersions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(prompt.currentVersion);

  const currentPromptText = prompt.versions.find(v => v.version === selectedVersion)?.prompt || prompt.prompt;

  const handleCopy = async () => {
    try {
      await copyToClipboard(currentPromptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('复制失败，请重试');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: prompt.title,
      text: currentPromptText,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      handleCopy();
      alert('提示词已复制到剪贴板！');
    }
  };

  const handleExportText = async () => {
    const content = `${prompt.title}\n\n${prompt.description}\n\n提示词内容：\n${currentPromptText}\n\n标签：${prompt.tags.join(', ')}`;
    const filename = `${prompt.title.replace(/\s+/g, '_')}_v${selectedVersion}.txt`;
    await exportToText(content, filename);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById(`prompt-content-${prompt.id}`);
    if (!element) return;
    
    const filename = `${prompt.title.replace(/\s+/g, '_')}_v${selectedVersion}.pdf`;
    await exportToPDF(element, filename);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold font-chinese mb-2">{prompt.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{prompt.description}</p>
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
            {prompt.category}
          </span>
        </div>
        <button
          onClick={() => setShowVersions(!showVersions)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          title="版本历史"
        >
          <History className="w-5 h-5" />
        </button>
      </div>

      <div id={`prompt-content-${prompt.id}`} className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">版本 {selectedVersion}</span>
          {prompt.versions.length > 1 && (
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              {prompt.versions.map(v => (
                <option key={v.version} value={v.version}>
                  v{v.version}
                </option>
              ))}
            </select>
          )}
        </div>
        <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-gray-800">
          {currentPromptText}
        </pre>
      </div>

      {showVersions && (
        <div className="mb-4 bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">版本历史</h4>
          <div className="space-y-3">
            {prompt.versions.map(version => (
              <div
                key={version.version}
                className={`p-3 rounded ${
                  version.version === selectedVersion
                    ? 'bg-primary-100 border-l-4 border-primary-600'
                    : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium">版本 {version.version}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(version.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                {version.changelog && (
                  <p className="text-sm text-gray-600">{version.changelog}</p>
                )}
                <button
                  onClick={() => setSelectedVersion(version.version)}
                  className="text-xs text-primary-600 hover:underline mt-1"
                >
                  查看此版本
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {prompt.tags.map(tag => (
          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              复制
            </>
          )}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Share2 className="w-4 h-4" />
          分享
        </button>
        <button
          onClick={handleExportText}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          title="导出为文本"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          title="导出为PDF"
        >
          <FileDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function AIPromptGrid() {
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const stored = aiPromptsStorage.get() || [];
    
    if (stored.length === 0) {
      const samplePrompts: AIPrompt[] = [
        {
          id: '1',
          title: '设计思维启发提示',
          description: '用于激发创新设计思路的AI提示词',
          category: '创意激发',
          prompt: '作为一位经验丰富的设计师，请帮我分析以下设计问题：\n\n问题描述：[在此输入问题]\n用户需求：[在此输入需求]\n约束条件：[在此输入约束]\n\n请提供：\n1. 3-5个不同角度的设计方向\n2. 每个方向的优劣分析\n3. 推荐的实施步骤',
          tags: ['设计思维', '创意', '问题分析'],
          versions: [
            {
              version: 1,
              prompt: '作为一位经验丰富的设计师，请帮我分析以下设计问题：\n\n问题描述：[在此输入问题]\n用户需求：[在此输入需求]\n约束条件：[在此输入约束]\n\n请提供：\n1. 3-5个不同角度的设计方向\n2. 每个方向的优劣分析\n3. 推荐的实施步骤',
              createdAt: new Date().toISOString(),
            },
          ],
          currentVersion: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: '用户研究分析助手',
          description: '帮助分析用户研究数据并提取关键洞察',
          category: '用户研究',
          prompt: '请作为用户研究专家，分析以下用户反馈：\n\n[粘贴用户反馈内容]\n\n请提供：\n1. 主要用户痛点总结\n2. 用户需求优先级排序\n3. 设计改进建议\n4. 潜在的创新机会',
          tags: ['用户研究', '数据分析', '洞察提取'],
          versions: [
            {
              version: 1,
              prompt: '请作为用户研究专家，分析以下用户反馈：\n\n[粘贴用户反馈内容]\n\n请提供：\n1. 主要用户痛点总结\n2. 用户需求优先级排序\n3. 设计改进建议\n4. 潜在的创新机会',
              createdAt: new Date().toISOString(),
            },
          ],
          currentVersion: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      setPrompts(samplePrompts);
      aiPromptsStorage.set(samplePrompts);
    } else {
      setPrompts(stored);
    }
  }, []);

  const categories = ['all', ...Array.from(new Set(prompts.map(p => p.category)))];
  const filteredPrompts = filter === 'all' 
    ? prompts 
    : prompts.filter(p => p.category === filter);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-chinese mb-2">AI 提示词工具</h1>
        <p className="text-gray-600">复制、分享和导出AI提示词模板</p>
      </div>

      <div className="mb-6 flex gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg ${
              filter === category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category === 'all' ? '全部' : category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPrompts.map(prompt => (
          <AIPromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </div>
  );
}
