import React from 'react';
import { Task } from '../../types';
import { Calendar, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: number, updates: Partial<Task>) => void;
  onClick: () => void;
}

export function TaskCard({ task, onUpdate, onClick }: TaskCardProps) {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <ArrowUp className="w-4 h-4" />;
      case 'medium': return <ArrowRight className="w-4 h-4" />;
      case 'low': return <ArrowDown className="w-4 h-4" />;
      default: return <ArrowRight className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed';

  const handleStatusChange = (newStatus: string) => {
    onUpdate(task.id, { status: newStatus as any });
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all cursor-pointer ${
        isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-blue-200'
      }`}
      onClick={onClick}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">{task.title}</h3>
          <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {getPriorityIcon(task.priority)}
            <span className="ml-1">{task.priority}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>

        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
            {new Date(task.due_date).toLocaleDateString()}
          </span>
          {isOverdue && (
            <span className="text-red-600 font-medium text-xs">(Overdue)</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>

          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
    </div>
  );
}