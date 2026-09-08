import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from "react-native";
import Colors from "../../constants/Colors";

interface MainButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

const MainButton = ({
  title,
  onPress,
  backgroundColor = Colors.LIGHTBLUE,
  textColor = Colors.WHITE,
  disabled = false,
  style,
}: MainButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
};

export default MainButton;

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.WHITE,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.4,
  },
});
