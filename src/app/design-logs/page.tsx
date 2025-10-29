'use client';

import React, { useState } from 'react';
import DesignLogForm from '@/components/DesignLogForm';
import { Plus, List } from 'lucide-react';
import type { DesignLogEntry } from '@/types';

export default function DesignLogsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<'P-04' | 'P-05' | 'P-06' | null>(null);
  const [showList, setShowList] = useState(false);

  if (selectedTemplate) {
    return (
      <DesignLogForm
        templateType={selectedTemplate}
        onSave={() => {
          setSelectedTemplate(null);
          setShowList(true);
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 font-chinese">
          设计逻辑日志
        </h1>
        <p className="text-xl text-gray-600">
          选择一个模板开始记录您的设计思考过程
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          onClick={() => setSelectedTemplate('P-04')}
          className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
            <h2 className="text-3xl font-bold mb-2">P-04</h2>
            <p className="text-blue-100">问题定义模板</p>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3 font-chinese">
              问题定义与背景分析
            </h3>
            <p className="text-gray-600 mb-4">
              清晰描述设计问题，分析使用场景和约束条件
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 问题描述</li>
              <li>• 背景与场景</li>
              <li>• 约束条件</li>
            </ul>
            <button className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold group-hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              使用此模板
            </button>
          </div>
        </div>

        <div
          onClick={() => setSelectedTemplate('P-05')}
          className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group"
        >
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
            <h2 className="text-3xl font-bold mb-2">P-05</h2>
            <p className="text-green-100">创意发散模板</p>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3 font-chinese">
              创意发散与方案探索
            </h3>
            <p className="text-gray-600 mb-4">
              记录多个初步想法，选择并细化最优方案
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 创意想法列表</li>
              <li>• 方案选择与细化</li>
              <li>• 选择理由说明</li>
            </ul>
            <button className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold group-hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              使用此模板
            </button>
          </div>
        </div>

        <div
          onClick={() => setSelectedTemplate('P-06')}
          className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group"
        >
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
            <h2 className="text-3xl font-bold mb-2">P-06</h2>
            <p className="text-purple-100">评估反思模板</p>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3 font-chinese">
              方案评估与反思
            </h3>
            <p className="text-gray-600 mb-4">
              详细描述最终方案，反思过程并记录迭代
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 最终设计方案</li>
              <li>• 过程反思总结</li>
              <li>• 迭代历程记录</li>
            </ul>
            <button className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg font-semibold group-hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              使用此模板
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={() => setShowList(!showList)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <List className="w-5 h-5" />
          查看已保存的日志
        </button>
      </div>
    </div>
  );
}
