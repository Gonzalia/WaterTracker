import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  Alert,
  AppState,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addWater,
  getWaterDateKey,
  getWaterIntake,
} from "../services/WaterService";
import AddWaterPopup from "../components/popups/AddWaterPopup";
import DailyGoalPopup from "../components/popups/DailyGoalPopup";
import WaterRegisteredNotice from "../components/popups/WaterRegisteredNotice";
import WaterGlass from "../views/WaterGlass";

const HomeScreen = () => {
  const [name, setName] = useState("");
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [currentWater, setCurrentWater] = useState(0);
  const updatingWater = useRef(false);
  const [addPopupVisible, setAddPopupVisible] = useState(false);
  const [goalPopupVisible, setGoalPopupVisible] = useState(false);
  const [waterNotice, setWaterNotice] = useState<{
    id: number;
    message: string;
  } | null>(null);
  const noticeId = useRef(0);
  const dismissWaterNotice = useCallback(() => setWaterNotice(null), []);

  const hour = new Date().getHours();

  const getDayPeriod = () => {
    if (hour < 12) {
      return {
        greeting: "¡Buenos días",
        background: require("../../assets/images/backgrounds/homeMorningBG.png"),
      };
    }

    if (hour < 19) {
      return {
        greeting: "¡Buenas tardes",
        background: require("../../assets/images/backgrounds/homeAfternoonBG.png"),
      };
    }

    return {
      greeting: "¡Buenas noches",
      background: require("../../assets/images/backgrounds/homeNightBG.png"),
    };
  };

  const dayPeriod = getDayPeriod();

  useFocusEffect(
    useCallback(() => {
      const refresh = () => {
        loadHome().catch(() =>
          Alert.alert(
            "No se pudo cargar",
            "Intentá abrir la pantalla otra vez.",
          ),
        );
      };
      refresh();
      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") refresh();
      });
      let day = getWaterDateKey();
      const timer = setInterval(() => {
        const nextDay = getWaterDateKey();
        if (nextDay !== day) {
          day = nextDay;
          refresh();
        }
      }, 1000);
      return () => {
        subscription.remove();
        clearInterval(timer);
      };
    }, []),
  );

  const loadHome = async () => {
    const storedName = await AsyncStorage.getItem("userName");
    const storedGoal = await AsyncStorage.getItem("dailyGoal");
    const storedWater = await getWaterIntake();

    if (storedName) {
      setName(storedName);
    }

    if (storedGoal) {
      setDailyGoal(Number(storedGoal));
    }

    setCurrentWater(storedWater);
  };

  const handleQuickChange = async (amount: number) => {
    if (updatingWater.current) return;
    updatingWater.current = true;
    try {
      const newAmount = await addWater(amount);
      setCurrentWater(newAmount);
    } catch {
      Alert.alert("No se pudo guardar", "Intentá actualizar el agua otra vez.");
    } finally {
      updatingWater.current = false;
    }
  };

  return (
    <ImageBackground
      source={dayPeriod.background}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.container}>
        <View>
          <Text style={styles.greeting}>{dayPeriod.greeting},</Text>

          <Text style={styles.name}>{name || "Tomi"}!</Text>

          <Text style={styles.date}>
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Text>
        </View>

        <View style={styles.goalCard}>
          <View>
            <Text style={styles.goalLabel}>Objetivo diario</Text>

            <Text style={styles.goalValue}>{dailyGoal / 1000} L</Text>
          </View>

          <Pressable
            onPress={() => setGoalPopupVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Editar objetivo diario"
          >
            <Text style={styles.edit}>Editar</Text>
          </Pressable>
        </View>

        <View style={styles.glassContainer}>
          <WaterGlass current={currentWater} goal={dailyGoal} />
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.addButton}
            onPress={() => handleQuickChange(250)}
            accessibilityRole="button"
            accessibilityLabel="Agregar 250 mililitros"
          >
            <Text style={styles.addText}>+</Text>
          </Pressable>

          <Pressable
            style={[
              styles.addButton,
              currentWater <= 0 && styles.disabledButton,
            ]}
            onPress={() => handleQuickChange(-250)}
            disabled={currentWater <= 0}
            accessibilityRole="button"
            accessibilityLabel="Restar 250 mililitros"
            accessibilityState={{ disabled: currentWater <= 0 }}
          >
            <Text style={styles.addText}>−</Text>
          </Pressable>

          <Pressable
            style={styles.moreButton}
            onPress={() => setAddPopupVisible(true)}
            accessibilityRole="button"
          >
            <Text style={styles.moreText}>Quiero cargar más</Text>
          </Pressable>
        </View>
      </View>
      <AddWaterPopup
        visible={addPopupVisible}
        onClose={() => setAddPopupVisible(false)}
        onSaved={(total, date) => {
          if (getWaterDateKey(date) === getWaterDateKey())
            setCurrentWater(total);
          setWaterNotice({
            id: ++noticeId.current,
            message: `Se guardó tu consumo del ${date.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}.`,
          });
        }}
      />
      <DailyGoalPopup
        visible={goalPopupVisible}
        goal={dailyGoal}
        onClose={() => setGoalPopupVisible(false)}
        onSaved={setDailyGoal}
      />
      {waterNotice && (
        <WaterRegisteredNotice
          key={waterNotice.id}
          message={waterNotice.message}
          onClose={dismissWaterNotice}
        />
      )}
    </ImageBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFill,

    backgroundColor: "rgba(3, 18, 30, 0.25)",
  },

  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 24,
  },

  greeting: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  name: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  date: {
    color: "#D2E5F0",
    fontSize: 13,
    marginTop: 6,
    textTransform: "capitalize",
  },

  goalCard: {
    marginTop: 18,

    backgroundColor: "rgba(7, 26, 43, 0.72)",

    borderWidth: 1,
    borderColor: "rgba(120, 205, 255, 0.35)",

    borderRadius: 18,

    paddingHorizontal: 16,
    paddingVertical: 14,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalLabel: {
    color: "#D6EAF6",
    fontSize: 12,
  },
  goalValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 2,
  },
  edit: {
    color: "#72CFFF",
    fontSize: 13,
  },
  glassContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  addButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#A9E4FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#DDF5FF",
  },
  addText: {
    color: "#082033",
    fontSize: 34,
    fontWeight: "400",
    lineHeight: 36,
  },
  disabledButton: {
    opacity: 0.4,
  },
  moreButton: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#48BFF5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
  },
  moreText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
