import { Dimensions, StyleSheet, Text, View } from "react-native";
import Colors from "../constants/Colors";
import LottieView from "lottie-react-native";
import { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

const SplashScreen = ({ navigation }: Props) => {
  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const onboardingCompleted = await AsyncStorage.getItem(
          "onboardingCompleted",
        );

        navigation.replace(
          onboardingCompleted === "true" ? "Main" : "Onboarding",
        );
      } catch (error) {
        console.log("Error checking onboarding:", error);
      }
    };

    checkInitialRoute();
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={require("../../assets/lotties/splashLottie.json")}
        autoPlay
        loop
        style={styles.animation}
      />

      <Text style={styles.title}>WaterTracker</Text>
      <Text style={styles.subtitle}>Tu hidratación, todos los días.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071A2B",
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: 180,
    height: 180,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    marginTop: 12,
  },
  subtitle: {
    color: "#8FAEC4",
    fontSize: 14,
    marginTop: 6,
  },
});

export default SplashScreen;
