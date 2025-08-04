import { BlurView } from "expo-blur";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  isLoading: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
};

export default function RoastModal({
  visible,
  onClose,
  isLoading,
  isPlaying,
  onPlayPause,
}: Props) {
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
            O madai tem uma bronca para você!
          </Text>

          <Pressable
            onPress={onPlayPause}
            style={[styles.audioButton, isLoading && { opacity: 0.5 }]}
            disabled={isLoading}
          >
            <Text style={styles.audioButtonText}>
              {isLoading
                ? "🔄 Carregando bronca..."
                : isPlaying
                ? "⏸️ Pausar"
                : "▶️ Tocar"}
            </Text>
          </Pressable>

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
