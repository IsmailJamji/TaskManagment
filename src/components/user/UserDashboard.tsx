import React, { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { Task, DashboardStats } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskFilter } from './TaskFilter';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskCreateForm } from './TaskCreateForm';
import { ClipboardList, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';

export function UserDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  const { apiRequest } = useApi();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, statsData] = await Promise.all([
        apiRequest('/tasks'),
        apiRequest('/analytics/user-dashboard')
      ]);
      setTasks(tasksData);
      setFilteredTasks(tasksData);
      setStats(statsData.userStats);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
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

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...taskData,
          assignee_id: user?.id
        })
      });
      await loadData();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const statCards = [
    {
      title: 'My Tasks',
      value: stats?.total_tasks || 0,
      icon: ClipboardList,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Completed',
      value: stats?.completed_tasks || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'In Progress',
      value: stats?.in_progress_tasks || 0,
      icon: Clock,
      color: 'bg-amber-500',
      textColor: 'text-amber-600'
    },
    {
      title: 'Overdue',
      value: stats?.overdue_tasks || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="mt-1 text-sm text-gray-600">Here are your assigned tasks</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle tâche</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor} mt-2`}>{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Component */}
      <TaskFilter tasks={tasks} onFilteredTasks={setFilteredTasks} />

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={handleTaskUpdate}
            onClick={() => setSelectedTask(task)}
          />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">
            {tasks.length === 0 ? 'You have no assigned tasks yet' : 'No tasks match your current filter'}
          </p>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
        />
      )}

      {/* Task Create Form */}
      {showCreateForm && (
        <TaskCreateForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateTask}
        />
      )}
    </div>
  );
}