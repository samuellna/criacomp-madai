import { Tabs } from "expo-router";
import { BarChart3, List, Mic } from "lucide-react-native";
import React from "react";

import { Colors } from "@/constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => <List color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="voice"
        options={{
          title: "Voice",
          tabBarIcon: ({ color }) => <Mic color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => <BarChart3 color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}