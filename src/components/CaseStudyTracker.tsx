'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Link as LinkIcon, FileText, Clock } from 'lucide-react';
import type { CaseStudy, CaseStudyReference, TimelineEvent } from '@/types';
import { generateId, formatDate } from '@/lib/utils';
import { caseStudiesStorage } from '@/lib/storage';

export default function CaseStudyTracker() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  useEffect(() => {
    const stored = caseStudiesStorage.get() || [];
    setCaseStudies(stored);
  }, []);

  const saveCaseStudies = (studies: CaseStudy[]) => {
    setCaseStudies(studies);
    caseStudiesStorage.set(studies);
  };

  const createNewStudy = () => {
    const newStudy: CaseStudy = {
      id: generateId(),
      title: '新建案例研究',
      description: '',
      projectType: '模块化座椅项目',
      startDate: new Date().toISOString(),
      status: 'planning',
      references: [],
      resources: [],
      timeline: [],
      tags: [],
    };
    setSelectedStudy(newStudy);
    setShowModal(true);
  };

  const saveStudy = (study: CaseStudy) => {
    const existingIndex = caseStudies.findIndex(s => s.id === study.id);
    if (existingIndex >= 0) {
      const updated = [...caseStudies];
      updated[existingIndex] = study;
      saveCaseStudies(updated);
    } else {
      saveCaseStudies([...caseStudies, study]);
    }
    setShowModal(false);
    setSelectedStudy(null);
  };

  const deleteStudy = (id: string) => {
    if (confirm('确定要删除这个案例研究吗？')) {
      saveCaseStudies(caseStudies.filter(s => s.id !== id));
    }
  };

  const addReference = (studyId: string, reference: CaseStudyReference) => {
    const study = caseStudies.find(s => s.id === studyId);
    if (study) {
      study.references.push(reference);
      saveStudy(study);
    }
  };

  const addTimelineEvent = (studyId: string, event: TimelineEvent) => {
    const study = caseStudies.find(s => s.id === studyId);
    if (study) {
      study.timeline.push(event);
      study.timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      saveStudy(study);
    }
  };

  const getStatusColor = (status: CaseStudy['status']) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  const getStatusText = (status: CaseStudy['status']) => {
    const texts = {
      planning: '规划中',
      'in-progress': '进行中',
      completed: '已完成',
      archived: '已归档',
    };
    return texts[status];
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-chinese">案例研究追踪器</h1>
          <p className="text-gray-600 mt-2">跨课程和卡片的项目引用管理</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'timeline' : 'list')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            {viewMode === 'list' ? '时间线视图' : '列表视图'}
          </button>
          <button
            onClick={createNewStudy}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            新建案例
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map(study => (
            <div key={study.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold font-chinese mb-2">{study.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(study.status)}`}>
                    {getStatusText(study.status)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedStudy(study);
                      setShowModal(true);
                    }}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteStudy(study.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{study.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(study.startDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <LinkIcon className="w-4 h-4" />
                  <span>{study.references.length} 个引用</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <FileText className="w-4 h-4" />
                  <span>{study.resources.length} 个资源</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{study.timeline.length} 个事件</span>
                </div>
              </div>

              {study.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {study.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold font-chinese mb-6">时间线视图</h2>
          <div className="space-y-8">
            {caseStudies.map(study => (
              <div key={study.id} className="border-l-4 border-primary-500 pl-6">
                <h3 className="text-xl font-bold font-chinese mb-2">{study.title}</h3>
                <div className="space-y-4">
                  {study.timeline.map(event => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-8 w-4 h-4 bg-primary-500 rounded-full"></div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{event.title}</h4>
                          <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{event.description}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                          {event.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && selectedStudy && (
        <CaseStudyModal
          study={selectedStudy}
          onSave={saveStudy}
          onClose={() => {
            setShowModal(false);
            setSelectedStudy(null);
          }}
        />
      )}
    </div>
  );
}

interface CaseStudyModalProps {
  study: CaseStudy;
  onSave: (study: CaseStudy) => void;
  onClose: () => void;
}

function CaseStudyModal({ study, onSave, onClose }: CaseStudyModalProps) {
  const [formData, setFormData] = useState(study);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold font-chinese mb-6">编辑案例研究</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">项目类型</label>
            <input
              type="text"
              value={formData.projectType}
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CaseStudy['status'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="planning">规划中</option>
              <option value="in-progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="archived">已归档</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
