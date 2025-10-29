'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, FileDown, Printer, Plus, Trash2 } from 'lucide-react';
import type { DesignLogEntry, DesignIteration } from '@/types';
import { generateId } from '@/lib/utils';
import { exportToPDF, preparePrintLayout } from '@/lib/pdf-export';
import { designLogsStorage } from '@/lib/storage';

interface DesignLogFormProps {
  templateType: 'P-04' | 'P-05' | 'P-06';
  initialData?: DesignLogEntry;
  onSave?: (entry: DesignLogEntry) => void;
}

const templateGuidance = {
  'P-04': {
    title: '问题定义与背景分析',
    fields: ['problem', 'context', 'constraints'],
    guidance: {
      problem: '清晰描述设计问题，包括目标用户和核心需求',
      context: '分析使用场景、环境因素和相关约束条件',
      constraints: '列出技术、成本、时间等限制因素',
    },
  },
  'P-05': {
    title: '创意发散与方案探索',
    fields: ['ideas', 'solution'],
    guidance: {
      ideas: '记录多个初步想法，鼓励发散思维',
      solution: '选择并细化最优方案，说明选择理由',
    },
  },
  'P-06': {
    title: '方案评估与反思',
    fields: ['solution', 'reflection', 'iterations'],
    guidance: {
      solution: '详细描述最终设计方案',
      reflection: '反思设计过程，总结经验和改进方向',
      iterations: '记录设计迭代历程',
    },
  },
};

export default function DesignLogForm({
  templateType,
  initialData,
  onSave,
}: DesignLogFormProps) {
  const [ideas, setIdeas] = useState<string[]>(initialData?.content.ideas || ['']);
  const [iterations, setIterations] = useState<DesignIteration[]>(
    initialData?.content.iterations || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const template = templateGuidance[templateType];
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      projectName: initialData?.projectName || '',
      problem: initialData?.content.problem || '',
      context: initialData?.content.context || '',
      constraints: initialData?.content.constraints || '',
      solution: initialData?.content.solution || '',
      reflection: initialData?.content.reflection || '',
    },
  });

  const addIdea = () => {
    setIdeas([...ideas, '']);
  };

  const updateIdea = (index: number, value: string) => {
    const newIdeas = [...ideas];
    newIdeas[index] = value;
    setIdeas(newIdeas);
  };

  const removeIdea = (index: number) => {
    setIdeas(ideas.filter((_, i) => i !== index));
  };

  const addIteration = () => {
    const newIteration: DesignIteration = {
      id: generateId(),
      version: iterations.length + 1,
      description: '',
      timestamp: new Date().toISOString(),
      changes: '',
    };
    setIterations([...iterations, newIteration]);
  };

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    
    const entry: DesignLogEntry = {
      id: initialData?.id || generateId(),
      templateType,
      title: data.title,
      projectName: data.projectName,
      date: new Date().toISOString(),
      content: {
        problem: data.problem,
        context: data.context,
        constraints: data.constraints,
        ideas: ideas.filter(idea => idea.trim()),
        solution: data.solution,
        reflection: data.reflection,
        iterations,
      },
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingLogs = designLogsStorage.get() || [];
    const logIndex = existingLogs.findIndex((log) => log.id === entry.id);
    
    if (logIndex >= 0) {
      existingLogs[logIndex] = entry;
    } else {
      existingLogs.push(entry);
    }
    
    designLogsStorage.set(existingLogs);
    
    if (onSave) {
      onSave(entry);
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setIsSaving(false);
    }, 2000);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('design-log-content');
    if (!element) return;
    
    const filename = `${templateType}_${watch('projectName') || 'design-log'}_${Date.now()}.pdf`;
    await exportToPDF(element, filename);
  };

  const handlePrint = () => {
    const element = document.getElementById('design-log-content');
    if (!element) {
      return;
    }
    preparePrintLayout(element);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-chinese">{template.title}</h1>
          <p className="text-gray-600 mt-2">模板类型: {templateType}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileDown className="w-4 h-4" />
            导出PDF
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Printer className="w-4 h-4" />
            打印
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
          设计日志已成功保存到本地存储！
        </div>
      )}

      <div id="design-log-content" className="bg-white rounded-lg shadow-lg p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-chinese">
              项目名称 *
            </label>
            <input
              {...register('projectName', { required: true })}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="输入项目名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-chinese">
              标题 *
            </label>
            <input
              {...register('title', { required: true })}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="输入日志标题"
            />
          </div>

          {template.fields.includes('problem') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-chinese">
                问题描述
              </label>
              <p className="text-sm text-gray-500 mb-2">{template.guidance.problem}</p>
              <textarea
                {...register('problem')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="描述设计问题..."
              />
            </div>
          )}

          {template.fields.includes('context') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-chinese">
                背景与场景
              </label>
              <p className="text-sm text-gray-500 mb-2">{template.guidance.context}</p>
              <textarea
                {...register('context')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="分析使用场景和背景..."
              />
            </div>
          )}

          {template.fields.includes('constraints') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-chinese">
                约束条件
              </label>
              <p className="text-sm text-gray-500 mb-2">{template.guidance.constraints}</p>
              <textarea
                {...register('constraints')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="列出限制因素..."
              />
            </div>
          )}

          {template.fields.includes('ideas') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-chinese">
                创意想法
              </label>
              <p className="text-sm text-gray-500 mb-2">{template.guidance.ideas}</p>
              <div className="space-y-2">
                {ideas.map((idea, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={idea}
                      onChange={(e) => updateIdea(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={`想法 ${index + 1}`}
                    />
                    {ideas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIdea(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIdea}
                  className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  添加想法
                </button>
              </div>
            </div>
          )}

          {template.fields.includes('solution') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-chinese">
                设计方案
              </label>
              <p className="text-sm text-gray-500 mb-2">{template.guidance.solution}</p>
              <textarea
                {...register('solution')}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="详细描述设计方案..."
              />
            </div>
          )}

          {template.fields.includes('reflection') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-chinese">
                反思与总结
              </label>
              <p className="text-sm text-gray-500 mb-2">{template.guidance.reflection}</p>
              <textarea
                {...register('reflection')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="反思设计过程..."
              />
            </div>
          )}

          {template.fields.includes('iterations') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-chinese">
                迭代历程
              </label>
              <p className="text-sm text-gray-500 mb-2">{template.guidance.iterations}</p>
              <div className="space-y-4">
                {iterations.map((iteration, index) => (
                  <div key={iteration.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">版本 {iteration.version}</h4>
                    <input
                      type="text"
                      value={iteration.description}
                      onChange={(e) => {
                        const newIterations = [...iterations];
                        newIterations[index].description = e.target.value;
                        setIterations(newIterations);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                      placeholder="描述"
                    />
                    <textarea
                      value={iteration.changes}
                      onChange={(e) => {
                        const newIterations = [...iterations];
                        newIterations[index].changes = e.target.value;
                        setIterations(newIterations);
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="变更说明"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIteration}
                  className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  添加迭代
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
