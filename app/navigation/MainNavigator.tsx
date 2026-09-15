import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import FeedScreen from "../screens/FeedScreen";
import SettingsScreen from "../screens/SettingsScreen";
import StatsScreen from "../screens/StatsScreen";
import DiagnosticsScreen from "../screens/DiagnosticsScreen";
import { MainStackParamList } from "./types";

const Stack = createNativeStackNavigator<MainStackParamList>();
const showTraceUi = process.env.EXPO_PUBLIC_TRACE_UI === "true";

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center"
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "VocabCat" }} />
      <Stack.Screen name="Feed" component={FeedScreen} options={{ headerShown: false, gestureEnabled: true }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Configure" }} />
      <Stack.Screen name="Stats" component={StatsScreen} options={{ title: "Stats & Summary" }} />
      {showTraceUi && <Stack.Screen name="Diagnostics" component={DiagnosticsScreen} options={{ title: "Diagnostics" }} />}
    </Stack.Navigator>
  );
};

export default MainNavigator;
