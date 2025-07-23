import { Task } from '@/types';
import { AlertTriangle, CheckCircle, Circle, Clock } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
}

export default function TaskCard({ task, onPress, onToggleComplete }: TaskCardProps) {
  const isOverdue = task.status === 'pending' && task.dueDate < new Date();
  const isCompleted = task.status === 'completed';

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#007AFF';
    }
  };

  const formatDueDate = () => {
    const now = new Date();
    const due = task.dueDate;
    const diffMs = due.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      const overdueDays = Math.abs(diffDays);
      const overdueHours = Math.abs(diffHours) % 24;
      if (overdueDays > 0) {
        return `${overdueDays}d overdue`;
      } else {
        return `${overdueHours}h overdue`;
      }
    }

    if (diffDays > 0) {
      return `${diffDays}d left`;
    } else if (diffHours > 0) {
      return `${diffHours}h left`;
    } else {
      return 'Due soon';
    }
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <Pressable style={styles.checkbox} onPress={onToggleComplete}>
          {isCompleted ? (
            <CheckCircle size={24} color="#34C759" />
          ) : (
            <Circle size={24} color="#999" />
          )}
        </Pressable>

        <View style={styles.taskInfo}>
          <Text style={[styles.title, isCompleted && styles.completedTitle]}>
            {task.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
          <View style={styles.metadata}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
              <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
            </View>
            <Text style={styles.category}>{task.category}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          {isOverdue && <AlertTriangle size={20} color="#FF3B30" />}
          <Clock size={16} color={isOverdue ? '#FF3B30' : '#999'} />
          <Text style={[styles.dueDate, isOverdue && styles.overdue]}>
            {formatDueDate()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  category: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#999',
  },
  overdue: {
    color: '#FF3B30',
    fontWeight: '600',
  },
});