import { Task } from "@/types";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const TASKS_STORAGE_KEY = "tasks";

export const [TaskProvider, useTasks] = createContextHook(() => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (tasks: Task[]) => {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      return tasks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  useEffect(() => {
    if (tasksQuery.data) {
      const parsedTasks = tasksQuery.data.map((task: any) => ({
        ...task,
        dueDate: new Date(task.dueDate),
        createdAt: new Date(task.createdAt),
      }));
      setTasks(parsedTasks);
    }
  }, [tasksQuery.data]);

  const addTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveMutation.mutate(updatedTasks);
    console.log("Task created:", newTask);

    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    );
    setTasks(updatedTasks);
    saveMutation.mutate(updatedTasks);
  };

  const deleteTask = async (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    saveMutation.mutate(updatedTasks);
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter(
      (task) =>
        task.status === "pending" &&
        task.dueDate < new Date(now.getTime() - 5 * 60 * 1000) // 5 minutes ago
    );
  };

  const getTasksByPriority = (priority: Task["priority"]) => {
    return tasks.filter((task) => task.priority === priority);
  };

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status);
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    getOverdueTasks,
    getTasksByPriority,
    getTasksByStatus,
    isLoading: tasksQuery.isLoading,
  };
});
