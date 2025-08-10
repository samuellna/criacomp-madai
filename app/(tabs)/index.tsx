import TaskCard from "@/components/TaskCard";
import RoastModal from "@/components/RoastModal";
import { useTasks } from "@/hooks/useTasks";
import { useBronca } from "@/hooks/useBronca";
import { Task } from "@/types";
import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";

export default function TaskListScreen() {
  const { tasks, updateTask } = useTasks();
  const [filter, setFilter] = useState<
    "all" | "pending" | "completed" | "high" | "medium" | "low"
  >("all");
  const [modalVisible, setModalVisible] = useState(false);
  const {
    isPlaying,
    isLoadingAudio,
    togglePlayback,
    playBroncaForTask,
    stopBronca,
  } = useBronca();

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === "all") return true;
      if (["pending", "completed"].includes(filter))
        return task.status === filter;
      return task.priority === filter;
    })
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const [showBroncaButton, setShowBroncaButton] = useState(false);

  useEffect(() => {
    const now = new Date();
    const hasUrgent = tasks.some((task) => {
      if (task.status !== "pending") return false;
      const diff = task.dueDate.getTime() - now.getTime();
      return diff < 0 || diff <= 24 * 60 * 60 * 1000;
    });
    setShowBroncaButton(hasUrgent);
  }, [tasks]);

  const handleBronca = async () => {
    const urgentTask = tasks
      .filter((t) => t.status === "pending")
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )[0];
    if (!urgentTask) return;

    setModalVisible(true);
    await playBroncaForTask(urgentTask);
  };

  const handleToggleComplete = (task: Task) => {
    updateTask(task.id, {
      status: task.status === "completed" ? "pending" : "completed",
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Tasks",
          headerRight: () => (
            <Pressable onPress={() => router.push("/voice")}>
              <Text style={styles.headerButton}>+ Add</Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={
              ["all", "pending", "completed", "high", "medium", "low"] as (
                | "all"
                | "pending"
                | "completed"
                | "high"
                | "medium"
                | "low"
              )[]
            }
            keyExtractor={(item) => item}
            renderItem={({
              item,
            }: {
              item: "all" | "pending" | "completed" | "high" | "medium" | "low";
            }) => (
              <Pressable
                style={[
                  styles.filterButton,
                  filter === item && styles.activeFilterButton,
                ]}
                onPress={() => setFilter(item)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === item && styles.activeFilterText,
                  ]}
                >
                  {item[0].toUpperCase() + item.slice(1)}
                </Text>
              </Pressable>
            )}
            contentContainerStyle={styles.filterList}
          />

          {showBroncaButton && (
            <Pressable style={styles.fab} onPress={handleBronca}>
              <Image
                source={require("../../assets/images/bronca.png")}
                style={{ width: 50, height: 50 }}
              />
            </Pressable>
          )}
        </View>

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === "all"
                ? "Tap the + button to create your first task"
                : `No ${filter} tasks at the moment`}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onPress={() => router.push(`/task/${item.id}`)}
                onToggleComplete={() => handleToggleComplete(item)}
              />
            )}
            contentContainerStyle={styles.taskList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <RoastModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          stopBronca();
        }}
        isLoading={isLoadingAudio}
        isPlaying={isPlaying}
        onPlayPause={togglePlayback}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  filterContainer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  activeFilterButton: {
    backgroundColor: "#e90d0dff",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeFilterText: {
    color: "#fff",
  },
  taskList: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  headerButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  fab: {
    position: "absolute",
    top: 16,
    right: 16,
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 5,
  },
});
