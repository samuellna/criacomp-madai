import TaskCard from "@/components/TaskCard";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types";
import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  Image,
  View,
} from "react-native";
import { Audio } from "expo-av";
import { BlurView } from "expo-blur";
import { generateRoastAudio } from "@/services/aiService";

type FilterType = "all" | "pending" | "completed" | "high" | "medium" | "low";

export default function TaskListScreen() {
  const { tasks, updateTask } = useTasks();
  const [filter, setFilter] = useState<FilterType>("all");

  const getFilteredTasks = () => {
    switch (filter) {
      case "pending":
        return tasks.filter((task) => task.status === "pending");
      case "completed":
        return tasks.filter((task) => task.status === "completed");
      case "high":
      case "medium":
      case "low":
        return tasks.filter((task) => task.priority === filter);
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks().sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "pending" ? -1 : 1;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handleToggleComplete = (task: Task) => {
    updateTask(task.id, {
      status: task.status === "completed" ? "pending" : "completed",
    });
  };

  const handleTaskPress = (task: Task) => {
    router.push(`/task/${task.id}`);
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Done" },
    { key: "high", label: "High" },
    { key: "medium", label: "Medium" },
    { key: "low", label: "Low" },
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [sound, setSound] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBroncaButton, setShowBroncaButton] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const togglePlayback = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      sound && sound.unloadAsync();
    };
  }, [sound]);

  useEffect(() => {
    const now = new Date();

    const hasUrgentTask = tasks.some((task) => {
      if (task.status !== "pending") return false;

      const timeDiff = task.dueDate.getTime() - now.getTime();
      const isOverdue = timeDiff < 0;
      const isWithin24h = timeDiff <= 24 * 60 * 60 * 1000;

      return isOverdue || isWithin24h;
    });

    setShowBroncaButton(hasUrgentTask);
  }, [tasks]);

  const playRoastForWorstTask = async () => {
    const urgentTask = tasks
      .filter((task) => task.status === "pending")
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )[0];

    if (!urgentTask) return;

    try {
      setIsLoadingAudio(true);
      const audioBlob = await generateRoastAudio(
        urgentTask.title,
        urgentTask.description
      );

      // Salva o áudio no armazenamento temporário
      const path = `${FileSystem.cacheDirectory}bronca.mp3`;
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await FileSystem.writeAsStringAsync(path, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const { sound: newSound } = await Audio.Sound.createAsync({
          uri: path,
        });
        setSound(newSound);
        setIsPlaying(true);
        await newSound.playAsync();
      };

      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Falha ao gerar bronca:", error);
    } finally {
      setIsLoadingAudio(false);
    }
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
            data={filters}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.filterButton,
                  filter === item.key && styles.activeFilterButton,
                ]}
                onPress={() => setFilter(item.key)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === item.key && styles.activeFilterText,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            )}
            contentContainerStyle={styles.filterList}
          />
          {/* Botão flutuante no canto superior direito */}
          {showBroncaButton && (
            <Pressable
              style={styles.fab}
              onPress={async () => {
                setModalVisible(true);
                await playRoastForWorstTask();
              }}
            >
              <Image
                source={require("../../assets/images/bronca.png")}
                style={{ width: 50, height: 50 }}
              />
            </Pressable>
          )}

          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <BlurView intensity={50} tint="dark" style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.audioTitle}>
                  O madai tem uma bronca para você!
                </Text>
                <Pressable
                  onPress={togglePlayback}
                  style={[
                    styles.audioButton,
                    isLoadingAudio && { opacity: 0.5 },
                  ]}
                  disabled={isLoadingAudio}
                >
                  <Text style={styles.audioButtonText}>
                    {isLoadingAudio
                      ? "🔄 Carregando bronca..."
                      : isPlaying
                      ? "⏸️ Pausar"
                      : "▶️ Tocar"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setModalVisible(false);
                    sound && sound.unloadAsync();
                    setSound(null);
                    setIsPlaying(false);
                  }}
                >
                  <Text style={styles.closeText}>Fechar</Text>
                </Pressable>
              </View>
            </BlurView>
          </Modal>
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
    backgroundColor: "#007AFF",
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
  fabText: {
    color: "#fff",
    fontSize: 24,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },

  modalContent: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },

  audioTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },

  audioButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  audioButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  closeText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
