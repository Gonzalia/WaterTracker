import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { usePreventRemove } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/StackNavigator";
import { deleteLocalAccount } from "../services/WaterService";
import CryingWaterGlass from "../views/CryingWaterGlass";
import Colors from "../constants/Colors";

type Props = NativeStackScreenProps<RootStackParamList, "DeleteAccount">;
export default function DeleteAccountScreen({ navigation }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  usePreventRemove(deleting && !deleted, () => {});

  useEffect(() => {
    if (deleted)
      navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
  }, [deleted, navigation]);
  const handleDelete = async () => {
    if (busy.current) return;
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    busy.current = true;
    setDeleting(true);
    setError("");
    try {
      await deleteLocalAccount();
      setDeleted(true);
    } catch {
      setError("No pudimos borrar tus datos. Intentá nuevamente.");
      busy.current = false;
      setDeleting(false);
    }
  };
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {deleted ? (
        <ActivityIndicator
          color={Colors.LIGHTBLUE}
          accessibilityLabel="Volviendo al inicio"
        />
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver a Configuración"
            disabled={deleting}
            onPress={() => navigation.goBack()}
            style={styles.back}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
          </Pressable>
          <Text style={styles.eyebrow}>ELIMINAR CUENTA</Text>
          <Text style={styles.title}>¿Seguro que querés borrar tu cuenta?</Text>
          <Text style={styles.description}>
            Vas a perder todo tu progreso y tus estadísticas.
          </Text>
          <View style={styles.illustration}>
            <CryingWaterGlass crying={confirmed} />
          </View>
          <Text accessibilityLiveRegion="polite" style={styles.note}>
            {confirmed
              ? "Esta es la última confirmación. Tus datos se borrarán de este dispositivo y vas a empezar de cero."
              : "Se eliminarán tu perfil, tu objetivo diario y todo el historial de agua."}
          </Text>
          {!!error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: deleting, busy: deleting }}
              disabled={deleting}
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.button,
                confirmed && styles.destructive,
                (pressed || deleting) && { opacity: 0.65 },
              ]}
            >
              {deleting ? (
                <ActivityIndicator
                  color="white"
                  accessibilityLabel="Borrando datos"
                />
              ) : (
                <Text style={styles.buttonText}>Sí, borrar mi cuenta</Text>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={deleting}
              onPress={() => navigation.goBack()}
              style={styles.cancel}
            >
              <Text style={styles.cancelText}>No, quiero quedarme</Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.DARKBLUE },
  content: { flexGrow: 1, padding: 24 },
  back: {
    alignSelf: "flex-start",
    padding: 10,
    marginLeft: -10,
    marginBottom: 20,
  },
  eyebrow: {
    color: "#FF919B",
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
  },
  title: {
    color: Colors.WHITE,
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "800",
    textAlign: "center",
  },
  description: {
    color: Colors.GRAY2,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 14,
  },
  illustration: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  note: {
    color: Colors.GRAY2,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 24,
  },
  actions: { gap: 8 },
  button: {
    backgroundColor: "#23485F",
    borderRadius: 18,
    minHeight: 56,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  destructive: { backgroundColor: "#D9384D" },
  buttonText: { color: Colors.WHITE, fontSize: 16, fontWeight: "700" },
  cancel: { padding: 16, alignItems: "center" },
  cancelText: { color: "#69CCFF", fontSize: 15, fontWeight: "600" },
  error: { color: "#FF919B", textAlign: "center", marginBottom: 16 },
});
