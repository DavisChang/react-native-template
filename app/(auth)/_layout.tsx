import React from "react";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
const AuthLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="signin" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack>

      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default AuthLayout;
