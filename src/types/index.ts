export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  department?: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assignee_id: number;
  assigner_id: number;
  assignee_name?: string;
  assigner_name?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  user_name: string;
  comment_text: string;
  created_at: string;
}

export interface DashboardStats {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}