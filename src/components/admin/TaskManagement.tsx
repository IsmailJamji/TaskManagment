import React, { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { Task, User } from '../../types';
import { TaskForm } from './TaskForm';
import { SearchFilter } from '../common/SearchFilter';
import { TaskDetailModal } from '../user/TaskDetailModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { Plus, Edit, Trash2, Calendar, User as UserIcon, ClipboardList } from 'lucide-react';

export function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const { apiRequest } = useApi();
  const { t } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, usersData] = await Promise.all([
        apiRequest('/tasks'),
        apiRequest('/users')
      ]);
      setTasks(tasksData);
      setFilteredTasks(tasksData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    const filtered = tasks.filter(task => 
      task.title.toLowerCase().includes(query.toLowerCase()) ||
      task.description?.toLowerCase().includes(query.toLowerCase()) ||
      users.find(u => u.id === task.assignee_id)?.name.toLowerCase().includes(query.toLowerCase()) ||
      users.find(u => u.id === task.assigner_id)?.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTasks(filtered);
  };

  const handleFilter = (filters: Record<string, string>) => {
    let filtered = tasks;

    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.assignee && filters.assignee !== 'all') {
      filtered = filtered.filter(task => task.assignee_id === parseInt(filters.assignee));
    }

    setFilteredTasks(filtered);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' });
        await loadData();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleTaskSaved = () => {
    setShowForm(false);
    setEditingTask(null);
    loadData();
  };

  const handleTaskUpdate = async (taskId: number, updates: Partial<Task>) => {
    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      await loadData();
    } catch (error) {
      console.error('Failed to update task:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filterOptions = [
    {
      key: 'priority',
      label: t('task.priority'),
      options: [
        { value: 'low', label: t('task.priority.low') },
        { value: 'medium', label: t('task.priority.medium') },
        { value: 'high', label: t('task.priority.high') }
      ]
    },
    {
      key: 'status',
      label: t('task.status'),
      options: [
        { value: 'not_started', label: t('task.status.not_started') },
        { value: 'in_progress', label: t('task.status.in_progress') },
        { value: 'completed', label: t('task.status.completed') }
      ]
    },
    {
      key: 'assignee',
      label: t('task.assign'),
      options: users.map(user => ({ value: user.id.toString(), label: user.name }))
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('task.management')}</h1>
          <p className="mt-1 text-sm text-gray-600">{t('task.management.desc')}</p>
        </div>
        <button
          onClick={handleCreateTask}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('task.new')}
        </button>
      </div>

      {/* Search and Filter */}
      <SearchFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        filterOptions={filterOptions}
        placeholder={`${t('search.placeholder')} tasks...`}
      />

              {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedTask(task)}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">{task.title}</h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEditTask(task)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{t('task.assign')}</span>
                <span className="font-medium text-gray-900">{task.assignee_name}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{t('task.due')}</span>
                <span className="font-medium text-gray-900">
                  {new Date(task.due_date).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {t(`task.priority.${task.priority}`)} {t('task.priority')}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {t(`task.status.${task.status}`)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          users={users}
          onClose={() => setShowForm(false)}
          onSave={handleTaskSaved}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
}