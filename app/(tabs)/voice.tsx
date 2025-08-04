/* eslint-disable react/no-unescaped-entities */
import * as FileSystem from "expo-file-system";
import VoiceRecorder from "@/components/VoiceRecorder";
import { useTasks } from "@/hooks/useTasks";
import {
  extractDetailedTranscript,
  generateTask,
  generateTaskGuidance,
  transcribeAudio,
} from "@/services/aiService";
import { TaskExtraction } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function VoiceScreen() {
  const { addTask } = useTasks();
  const [extractedTask, setExtractedTask] = useState<TaskExtraction | null>(
    null
  );
  const [transcript, setTranscript] = useState<string>("");
  const [detailedTranscript, setDetailedTranscript] = useState<string>("");

  const processingMutation = useMutation({
    mutationFn: async (audioUri: string) => {
      const formData = new FormData();

      // Sempre adicionar model e language
      formData.append("model", "whisper-1");
      formData.append("language", "pt");

      if (Platform.OS === "web") {
        const response = await fetch(audioUri);
        const blob = await response.blob();

        const file = new File([blob], "recording.webm", { type: "audio/webm" });

        formData.append("file", file);
      } else {
        const fileInfo = await FileSystem.getInfoAsync(audioUri);
        if (!fileInfo.exists) {
          throw new Error("Audio file does not exist");
        }

        const uriParts = audioUri.split(".");
        const fileType = uriParts[uriParts.length - 1] || "m4a"; // fallback

        formData.append("file", {
          uri: audioUri,
          name: `recording.${fileType}`,
          type: `audio/${fileType}`,
        } as any);
      }

      const transcript = await transcribeAudio(formData);
      const detailedTranscript = await extractDetailedTranscript(transcript);
      const taskData = await generateTask(detailedTranscript);
      return { transcript, taskData, detailedTranscript };
    },
    onSuccess: ({ transcript, taskData }) => {
      setTranscript(transcript);
      setExtractedTask(taskData);
      setDetailedTranscript(taskData.description);
    },
    onError: (error) => {
      console.error("Processing error:", error);
      Alert.alert(
        "Error",
        "Failed to process your recording. Please try again."
      );
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: TaskExtraction) => {
      const guidance = await generateTaskGuidance(
        taskData.title,
        detailedTranscript
      );

      const task = await addTask({
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        priority: taskData.priority,
        dueDate: new Date(taskData.due_date),
        status: "pending",
        aiGuidance: guidance,
      });

      return task;
    },
    onSuccess: () => {
      Alert.alert("Success", "Task created successfully!", [
        {
          text: "OK",
          onPress: () => {
            setExtractedTask(null);
            setTranscript("");
          },
        },
      ]);
    },
    onError: (error) => {
      console.error("Task creation error:", error);
      Alert.alert("Error", "Failed to create task. Please try again.");
    },
  });

  const handleRecordingComplete = (audioUri: string) => {
    processingMutation.mutate(audioUri);
  };

  const handleCreateTask = () => {
    if (extractedTask) {
      createTaskMutation.mutate(extractedTask);
    }
  };

  const handleRetry = () => {
    setExtractedTask(null);
    setTranscript("");
  };

  return (
    <>
      <Stack.Screen options={{ title: "Voice Input" }} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Descreva a sua tarefa</Text>
          <Text style={styles.subtitle}>
            Descreva o que você precisa fazer, quando deve ser concluído e qual
            a prioridade
          </Text>

          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            isProcessing={processingMutation.isPending}
          />

          {transcript && (
            <View style={styles.transcriptSection}>
              <Text style={styles.sectionTitle}>O que eu entendi:</Text>
              <Text style={styles.transcript}>"{transcript}"</Text>
            </View>
          )}

          {extractedTask && (
            <View style={styles.extractedSection}>
              <Text style={styles.sectionTitle}>Atividade extraída:</Text>
              <View style={styles.taskPreview}>
                <Text style={styles.taskTitle}>{extractedTask.title}</Text>
                <Text style={styles.taskDescription}>
                  {extractedTask.description}
                </Text>
                <View style={styles.taskMeta}>
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor: getPriorityColor(
                          extractedTask.priority
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.priorityText}>
                      {extractedTask.priority.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.category}>{extractedTask.category}</Text>
                  <Text style={styles.dueDate}>
                    Due: {new Date(extractedTask.due_date).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable style={styles.retryButton} onPress={handleRetry}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.createButton,
                    createTaskMutation.isPending && styles.disabledButton,
                  ]}
                  onPress={handleCreateTask}
                  disabled={createTaskMutation.isPending}
                >
                  <Text style={styles.createButtonText}>
                    {createTaskMutation.isPending
                      ? "Creating..."
                      : "Create Task"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "#FF3B30";
    case "medium":
      return "#FF9500";
    case "low":
      return "#34C759";
    default:
      return "#007AFF";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  transcriptSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  transcript: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    lineHeight: 20,
  },
  extractedSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  taskPreview: {
    marginBottom: 20,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  category: {
    fontSize: 12,
    color: "#999",
    textTransform: "capitalize",
  },
  dueDate: {
    fontSize: 12,
    color: "#999",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  retryButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  createButton: {
    flex: 2,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
