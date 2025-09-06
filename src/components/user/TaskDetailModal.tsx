import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import { TaskComments } from './TaskComments';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Calendar, User, Flag, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdate: (taskId: number, updates: Partial<Task>) => void;
}

export function TaskDetailModal({ task, onClose, onUpdate }: TaskDetailModalProps) {
  const { t } = useLanguage();
  const [currentTask, setCurrentTask] = useState<Task | null>(task);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

  if (!currentTask) return null;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Flag className="w-4 h-4 text-red-600" />;
      case 'medium': return <Flag className="w-4 h-4 text-amber-600" />;
      case 'low': return <Flag className="w-4 h-4 text-green-600" />;
      default: return <Flag className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'not_started': return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'not_started': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = new Date(currentTask.due_date) < new Date() && currentTask.status !== 'completed';

  const handleStatusChange = async (newStatus: string) => {
    // Update local state immediately for better UX
    setCurrentTask(prev => prev ? { ...prev, status: newStatus as any } : null);
    setRefreshTrigger(prev => prev + 1);
    
    // Call the parent update function
    onUpdate(currentTask.id, { status: newStatus as any });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentTask.title}</h2>
            <div className="flex items-center gap-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(currentTask.priority)}`}>
                {getPriorityIcon(currentTask.priority)}
                {t(`task.priority.${currentTask.priority}`)}
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentTask.status)}`}>
                {getStatusIcon(currentTask.status)}
                {t(`task.status.${currentTask.status}`)}
              </div>
              {isOverdue && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                  <AlertCircle className="w-4 h-4" />
                  Overdue
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {currentTask.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              <TaskComments taskId={currentTask.id} refreshTrigger={refreshTrigger} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Task Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                       <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                         {new Date(currentTask.due_date).toLocaleDateString('en-US', {
                           weekday: 'long',
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric'
                         })}
                       </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Assigned To</p>
                      <p className="font-medium text-gray-900">{currentTask.assignee_name || 'Unassigned'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Created By</p>
                      <p className="font-medium text-gray-900">{currentTask.assigner_name || 'System'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                <select
                  value={currentTask.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Update your progress on this task
                </p>
              </div>

              {/* Quick Actions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const newStatus = currentTask.status === 'not_started' ? 'in_progress' : 'completed';
                      handleStatusChange(newStatus);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    {currentTask.status === 'not_started' ? 'Start Task' : 
                     currentTask.status === 'in_progress' ? 'Mark as Completed' : 'Task Completed'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
