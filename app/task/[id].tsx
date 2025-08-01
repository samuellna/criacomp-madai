import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Lightbulb,
  Tag,
  Trash2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, updateTask, deleteTask } = useTasks();
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    const foundTask = tasks.find((t) => t.id === id);
    if (foundTask) {
      setTask(foundTask);
    }
  }, [id, tasks]);

  if (!task) {
    return (
      <View style={styles.container}>
        <Text>Task not found</Text>
      </View>
    );
  }

  const isOverdue = task.status === "pending" && task.dueDate < new Date();
  const isCompleted = task.status === "completed";

  const getPriorityColor = () => {
    switch (task.priority) {
      case "high":
        return "#FF3B30";
      case "medium":
        return "#FF9500";
      case "low":
        return "#34C759";
      default:
        return "#007AFF";
    }
  };

  const formatDueDate = () => {
    return task.dueDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleToggleComplete = () => {
    updateTask(task.id, {
      status: task.status === "completed" ? "pending" : "completed",
    });
  };

  const handleDelete = () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteTask(task.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Sobre a Tarefa",
          headerRight: () => (
            <Pressable onPress={handleDelete}>
              <Trash2 size={20} color="#FF3B30" />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, isCompleted && styles.completedTitle]}>
              {task.title}
            </Text>

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor() },
                ]}
              >
                <Text style={styles.priorityText}>
                  {task.priority.toUpperCase()}
                </Text>
              </View>
              {isOverdue && (
                <View style={styles.overdueBadge}>
                  <AlertTriangle size={16} color="#fff" />
                  <Text style={styles.overdueText}>ATRASADA</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>{task.description}</Text>
          </View>

          <View style={styles.metaSection}>
            <View style={styles.metaItem}>
              <Tag size={20} color="#666" />
              <Text style={styles.metaText}>{task.category}</Text>
            </View>

            <View style={styles.metaItem}>
              <Clock size={20} color={isOverdue ? "#FF3B30" : "#666"} />
              <Text style={[styles.metaText, isOverdue && styles.overdueText]}>
                {formatDueDate()}
              </Text>
            </View>
          </View>

          {task.aiGuidance && (
            <View style={styles.section}>
              <View style={styles.guidanceHeader}>
                <Lightbulb size={20} color="#FF9500" />
                <Text style={styles.sectionTitle}>Ajuda da IA</Text>
              </View>
              <Text style={styles.guidance}>{task.aiGuidance.guide}</Text>

              {task.aiGuidance.sources.length > 0 && (
                <>
                  <Text style={styles.sourcesTitle}>Helpful Resources:</Text>
                  {task.aiGuidance.sources.map((source, index) => (
                    <Text key={index} style={styles.source}>
                      • {source}
                    </Text>
                  ))}
                </>
              )}
            </View>
          )}

          <Pressable
            style={[
              styles.actionButton,
              isCompleted ? styles.completedButton : styles.pendingButton,
            ]}
            onPress={handleToggleComplete}
          >
            {isCompleted ? (
              <CheckCircle size={20} color="#fff" />
            ) : (
              <CheckCircle size={20} color="#fff" />
            )}
            <Text style={styles.actionButtonText}>
              {isCompleted ? "Marcar como Pendente" : "Marcar como Concluída"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
    lineHeight: 32,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  overdueBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  overdueText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  metaSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    elevation: 3,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
  },
  guidanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  guidance: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  sourcesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  source: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  pendingButton: {
    backgroundColor: "#34C759",
  },
  completedButton: {
    backgroundColor: "#007AFF",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
