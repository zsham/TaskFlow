
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  role: UserRole;
  bio?: string;
  isActive: boolean; // Admin must approve
  joinedAt: number;
  chatHistory?: ChatMessage[];
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  subtasks: SubTask[];
  createdAt: number;
  deadline?: string;
  tags: string[];
  createdBy?: string;
  assignedTo?: string; // User ID
  image?: string; // Base64 encoded image
}

export interface ProjectInsight {
  summary: string;
  productivityScore: number;
  recommendations: string[];
}
