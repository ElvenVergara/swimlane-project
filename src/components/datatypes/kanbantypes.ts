export interface Task {
  id: string;
  title: string;
  deadline: string;
  category: string;
  columnId: string;
  status: boolean;
  order?: number;
}

export interface Column {
  id: string;
  name: string;
  editStatus: boolean;
  addStatus: boolean;
  tasks: Task[];
}