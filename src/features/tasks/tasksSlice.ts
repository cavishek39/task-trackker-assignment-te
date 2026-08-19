import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  synced_status: boolean;
  updated_at: number;
}

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
}

const initialState: TasksState = {
  tasks: [],
  isLoading: false,
};

const sortTasks = (tasks: Task[]) => {
  return tasks.sort((a, b) => {
    if (a.completed === b.completed) {
      return b.updated_at - a.updated_at; // Newest first
    }
    return a.completed ? 1 : -1; // Incomplete first
  });
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = sortTasks([...action.payload]);
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
      sortTasks(state.tasks);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
        sortTasks(state.tasks);
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },
  },
});

export const { setTasks, addTask, updateTask, deleteTask } = tasksSlice.actions;
export default tasksSlice.reducer;
