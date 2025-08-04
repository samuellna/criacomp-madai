import { useState } from "react";
import { Audio } from "expo-av";
import { Task } from "@/types";
import { generateRoastAudio } from "@/services/aiService";

export const useBronca = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const playBroncaForTask = async (task: Task) => {
    try {
      setIsLoadingAudio(true);

      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }

      const audioUri = await generateRoastAudio(
        task.id,
        task.title,
        task.description
      );
      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: audioUri,
      });

      setSound(newSound);
      setIsPlaying(true);
      await newSound.playAsync();
    } catch (error) {
      console.error("Erro ao tocar bronca:", error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

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

  const stopBronca = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  return {
    isLoadingAudio,
    isPlaying,
    togglePlayback,
    playBroncaForTask,
    stopBronca,
  };
};
