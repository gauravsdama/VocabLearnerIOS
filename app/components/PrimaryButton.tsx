import React from "react";
import { ViewStyle } from "react-native";
import DSButton from "./ui/DSButton";

const PrimaryButton = ({
  label,
  onPress,
  disabled,
  style
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) => {
  return <DSButton label={label} onPress={onPress} disabled={disabled} style={style} />;
};

export default PrimaryButton;
