import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Loader, Mic, Square } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface VoiceRecorderProps {
  onRecordingComplete: (audioUri: string) => void;
  isProcessing?: boolean;
}

export default function VoiceRecorder({
  onRecordingComplete,
  isProcessing,
}: VoiceRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (Platform.OS !== "web") {
        const permission = await Audio.requestPermissionsAsync();
        if (permission.status !== "granted") {
          Alert.alert(
            "Permission required",
            "Please grant microphone permission to record audio."
          );
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      });

      setRecording(recording);
      setIsRecording(true);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();

      if (Platform.OS !== "web") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const uri = recording.getURI();
      if (uri) {
        onRecordingComplete(uri);
      }
      setRecording(null);
    } catch (err) {
      console.error("Failed to stop recording", err);
      Alert.alert("Error", "Failed to stop recording. Please try again.");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.recordButton,
          isRecording && styles.recordingButton,
          isProcessing && styles.processingButton,
        ]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader size={32} color="#fff" />
        ) : isRecording ? (
          <Square size={32} color="#fff" fill="#fff" />
        ) : (
          <Mic size={32} color="#fff" />
        )}
      </Pressable>

      <Text style={styles.instruction}>
        {isProcessing
          ? "Processing your recording..."
          : isRecording
          ? `Recording... ${formatDuration(recordingDuration)}`
          : "Aperte para gravar"}
      </Text>

      {isRecording && (
        <View style={styles.waveform}>
          {[...Array(5)].map((_, i) => (
            <View
              key={i}
              style={[styles.waveBar, { animationDelay: `${i * 0.1}s` }]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 40,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    boxShadow: "0px 4px 16px rgba(0,0,0,0.3)",
  },
  recordingButton: {
    backgroundColor: "#FF3B30",
    transform: [{ scale: 1.1 }],
  },
  processingButton: {
    backgroundColor: "#FF9500",
  },
  instruction: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  waveBar: {
    width: 4,
    height: 20,
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
});
