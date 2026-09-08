// screens/OnboardingScreen.tsx
import { useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import FormInput from "../components/inputs/FormInput";
import GoalSelector from "../components/selectors/GoalSelector";
import MainButton from "../components/buttons/MainButton";
import OnboardingProgressBar from "../components/progressBars/OnboardingProgressBar";
import Colors from "../constants/Colors";

const OnboardingScreen = ({ navigation }: any) => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dailyGoal, setDailyGoal] = useState(2000);

  const completedSteps = [
    name.trim().length > 0,
    lastName.trim().length > 0,
    dailyGoal !== null,
  ].filter(Boolean).length;
  const progress = completedSteps / 3;
  const handleContinue = async () => {
    await AsyncStorage.multiSet([
      ["userName", name],
      ["userLastName", lastName],
      ["dailyGoal", dailyGoal.toString()],
      ["onboardingCompleted", "true"],
    ]);

    navigation.replace("Home");
  };

  const disabled = !name.trim() || !lastName.trim();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ImageBackground
        source={require("../../assets/images/backgrounds/onboardingBg.png")}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <OnboardingProgressBar progress={progress} />

          <View style={styles.header}>
            <Text style={styles.title}>Empecemos a conocernos</Text>

            <Text style={styles.subtitle}>
              Configurá tu perfil y tu objetivo diario de hidratación.
            </Text>
          </View>

          <View style={styles.form}>
            <FormInput
              label="Nombre"
              placeholder="Tony"
              value={name}
              onChangeText={setName}
            />

            <FormInput
              label="Apellido"
              placeholder="Stark"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <GoalSelector value={dailyGoal} onChange={setDailyGoal} />

          <View style={styles.footer}>
            <MainButton
              title="Comenzar"
              onPress={handleContinue}
              disabled={disabled}
            />
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
    gap: 10,
  },
  title: {
    color: Colors.WHITE,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
  },
  subtitle: {
    color: Colors.GRAY2,
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: 18,
    marginBottom: 34,
  },
  footer: {
    marginTop: "auto",
  },
});
