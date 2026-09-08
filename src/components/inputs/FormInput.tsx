import { StyleSheet, Text, TextInput, View } from "react-native";
import Colors from "../../constants/Colors";

interface FormInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
}

const FormInput = ({
  label,
  value,
  placeholder,
  onChangeText,
}: FormInputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={Colors.GRAY3}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
};

export default FormInput;

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: Colors.GRAY4,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    height: 56,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Colors.DARKBLUE2,
    borderRadius: 18,
    backgroundColor: Colors.DARKGRAY,
    color: Colors.WHITE,
    fontSize: 16,
  },
});
