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

// Parc Informatique
export interface ParcInformatique {
  id: number;
  type: 'laptop' | 'desktop' | 'unite_centrale' | 'clavier' | 'imprimante' | 'telephone' | 'routeur' | 'souris' | 'ecran' | 'casque' | 'autre';
  marque: string;
  modele: string;
  serial_number: string;
  ticket_numero?: string;
  specifications: {
    disque_dur?: string;
    processeur?: string;
    ram?: string;
    os?: string;
    autres?: string;
  };
  proprietaire: string;
  ville_societe: string;
  poste: string;
  departement?: string;
  est_premiere_main: boolean;
  date_acquisition: string;
  age_ans: number;
  est_ancien: boolean; // Calculé automatiquement si > 5 ans
  created_at: string;
  updated_at: string;
}

// Parc Télécom
export interface ParcTelecom {
  id: number;
  numero_puce: string;
  operateur: 'iam' | 'inwi';
  proprietaire: string;
  ville_societe: string;
  poste: string;
  departement?: string;
  specifications: {
    type_abonnement?: string;
    forfait?: string;
    date_activation?: string;
    type?: string;
    autres?: string;
  };
  created_at: string;
  updated_at: string;
}

// Gestion de Projet
export interface Projet {
  id: number;
  nom: string;
  description: string;
  chef_projet_id: number;
  chef_projet_name?: string;
  equipe_ids: number[];
  equipe_names?: string[];
  date_debut: string;
  date_fin_prevue: string;
  statut: 'planifie' | 'en_cours' | 'suspendu' | 'termine' | 'annule';
  priorite: 'low' | 'medium' | 'high';
  budget?: number;
  created_at: string;
  updated_at: string;
}

export interface SousTache {
  id: number;
  projet_id: number;
  nom: string;
  description: string;
  assigne_id: number;
  assigne_name?: string;
  date_debut: string;
  date_fin_prevue: string;
  statut: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  priorite: 'low' | 'medium' | 'high';
  progression: number; // 0-100
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}