import { BlurView } from "expo-blur";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  isLoading: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
  duration?: number;
  currentTime?: number;
};

export default function RoastModal({
  visible,
  onClose,
  isLoading,
  isPlaying,
  onPlayPause,
  currentTime = 0,
  duration = 10,
}: Props) {
  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = Math.min(currentTime / duration, 1);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={50} tint="dark" style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.audioTitle}>
            O madai tem uma bronca pra você!
          </Text>

          {/* Player */}
          <View style={styles.playerRow}>
            <Pressable
              onPress={onPlayPause}
              style={styles.iconButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <Ionicons name="reload" size={28} color="#007AFF" />
              ) : isPlaying ? (
                <Ionicons name="pause" size={32} color="#007AFF" />
              ) : (
                <Ionicons name="play" size={32} color="#007AFF" />
              )}
            </Pressable>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
              <View style={styles.timerRow}>
                <Text style={styles.time}>{formatTime(currentTime)}</Text>
                <Text style={styles.time}>{formatTime(duration)}</Text>
              </View>
            </View>
          </View>

          <Pressable onPress={onClose}>
            <Text style={styles.closeText}>Fechar</Text>
          </Pressable>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    alignItems: "center",
    elevation: 6,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  iconButton: {
    padding: 8,
    marginRight: 12,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
  },
  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  time: {
    fontSize: 12,
    color: "#555",
  },
  closeText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
