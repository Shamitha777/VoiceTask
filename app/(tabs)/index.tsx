import React, { useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

export default function HomeScreen() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Speech recognition started
  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
  });

  // Speech recognition stopped
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  // Speech-to-text result
  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript || "";

    if (transcript.trim()) {
      setTask(transcript);

      // Automatically add the voice task
      setTasks((currentTasks) => [...currentTasks, transcript.trim()]);

      setTask("");
    }
  });

  // Speech recognition error
  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);

    console.log("Speech recognition error:", event.error, event.message);

    Alert.alert(
      "Voice Recognition Error",
      event.message || `Error: ${event.error}`,
    );
  });

  // Start voice recognition
  const startVoiceRecognition = async () => {
    try {
      // Request microphone + speech recognition permission
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow microphone and speech recognition permission in your phone settings.",
        );
        return;
      }

      // Start listening
      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: false,
        continuous: false,
      });
    } catch (error) {
      console.log("Voice start error:", error);

      Alert.alert("Error", "Unable to start voice recognition.");
    }
  };

  // Stop voice recognition
  const stopVoiceRecognition = () => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.log("Voice stop error:", error);
    }
  };

  // Manual task
  const addTask = () => {
    if (task.trim() === "") return;

    setTasks([...tasks, task.trim()]);
    setTask("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>VoiceTask</Text>

          <Text style={styles.subtitle}>Manage your tasks with your voice</Text>
        </View>

        <View style={styles.micIcon}>
          <Text style={styles.micText}>🎙️</Text>
        </View>
      </View>

      {/* Voice Button */}
      <TouchableOpacity
        style={[styles.voiceButton, isListening && styles.voiceButtonListening]}
        onPress={isListening ? stopVoiceRecognition : startVoiceRecognition}
        activeOpacity={0.8}
      >
        <Text style={styles.voiceIcon}>{isListening ? "🔴" : "🎤"}</Text>

        <Text style={styles.voiceText}>
          {isListening ? "Listening..." : "Tap to Speak"}
        </Text>

        <Text style={styles.voiceSubtext}>
          {isListening ? "Say your task now" : "Say a task to add it"}
        </Text>
      </TouchableOpacity>

      {/* Manual Task Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a task..."
          placeholderTextColor="#888"
          value={task}
          onChangeText={setTask}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={addTask}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Tasks */}
      <Text style={styles.sectionTitle}>My Tasks</Text>

      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>

          <Text style={styles.emptyTitle}>No tasks yet</Text>

          <Text style={styles.emptyText}>
            Tap the microphone or add a task manually.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <View style={styles.checkbox}>
                <Text>✓</Text>
              </View>

              <Text style={styles.taskText}>{item}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 30,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#202124",
  },

  subtitle: {
    fontSize: 15,
    color: "#70757A",
    marginTop: 5,
  },

  micIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E8E9FF",
    justifyContent: "center",
    alignItems: "center",
  },

  micText: {
    fontSize: 25,
  },

  voiceButton: {
    backgroundColor: "#5B5FEF",
    borderRadius: 25,
    height: 190,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    elevation: 5,
  },

  voiceButtonListening: {
    backgroundColor: "#4B4FD8",
  },

  voiceIcon: {
    fontSize: 45,
    marginBottom: 10,
  },

  voiceText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  voiceSubtext: {
    color: "#E8E8FF",
    fontSize: 14,
    marginTop: 8,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  input: {
    flex: 1,
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  addButton: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#5B5FEF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 32,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#202124",
    marginBottom: 15,
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },

  emptyText: {
    fontSize: 14,
    color: "#777777",
    marginTop: 7,
    textAlign: "center",
  },

  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
  },

  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E8E9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  taskText: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
  },
});
