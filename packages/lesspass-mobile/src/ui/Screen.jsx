import React from "react";
import { ScrollView } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Styles from "./Styles";

export default function Screen({ children, title, ...props }) {
  const theme = useTheme();
  return (
    <ScrollView
      contentContainerStyle={{
        ...Styles.container,
        backgroundColor: theme.colors.background,
      }}
      {...props}
    >
      {title !== undefined && (
        <Text
          variant="titleLarge"
          style={{
            ...Styles.title,
          }}
        >
          {title}
        </Text>
      )}
      {children}
    </ScrollView>
  );
}
