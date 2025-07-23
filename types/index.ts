export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  status: 'pending' | 'completed';
  createdAt: Date;
  aiGuidance?: {
    guide: string;
    sources: string[];
  };
}

export interface TaskExtraction {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  due_date: string;
}