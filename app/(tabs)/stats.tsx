import TaskCard from '@/components/TaskCard';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/types';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

type FilterType = 'all' | 'pending' | 'completed' | 'high' | 'medium' | 'low';

export default function TaskListScreen() {
  const { tasks, updateTask } = useTasks();
  const [filter, setFilter] = useState<FilterType>('all');

  const getFilteredTasks = () => {
    switch (filter) {
      case 'pending':
        return tasks.filter(task => task.status === 'pending');
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      case 'high':
      case 'medium':
      case 'low':
        return tasks.filter(task => task.priority === filter);
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks().sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'pending' ? -1 : 1;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handleToggleComplete = (task: Task) => {
    updateTask(task.id, {
      status: task.status === 'completed' ? 'pending' : 'completed'
    });
  };

  const handleTaskPress = (task: Task) => {
    router.push(`/task/${task.id}`);
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Done' },
    { key: 'high', label: 'High' },
    { key: 'medium', label: 'Medium' },
    { key: 'low', label: 'Low' },
  ];

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Tasks',
          headerRight: () => (
            <Pressable onPress={() => router.push('/voice')}>
              <Text style={styles.headerButton}>+ Add</Text>
            </Pressable>
          )
        }} 
      />
      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filters}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.filterButton,
                  filter === item.key && styles.activeFilterButton
                ]}
                onPress={() => setFilter(item.key)}
              >
                <Text style={[
                  styles.filterText,
                  filter === item.key && styles.activeFilterText
                ]}>
                  {item.label}
                </Text>
              </Pressable>
            )}
            contentContainerStyle={styles.filterList}
          />
        </View>

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' 
                ? 'Tap the + button to create your first task'
                : `No ${filter} tasks at the moment`
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onPress={() => handleTaskPress(item)}
                onToggleComplete={() => handleToggleComplete(item)}
              />
            )}
            contentContainerStyle={styles.taskList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  taskList: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  headerButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});