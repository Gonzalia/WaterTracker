import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootTabParamList } from "../navigation/TabNavigator";
import { RootStackParamList } from "../navigation/StackNavigator";
import Colors from "../constants/Colors";

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, "Settings">,
  NativeStackScreenProps<RootStackParamList>
>;

const premiumOptions = [
  {
    icon: "palette-outline",
    title: "Vasos y temas exclusivos",
    detail: "Elegí un estilo que sea bien tuyo.",
  },
  {
    icon: "chart-line",
    title: "Estadísticas avanzadas",
    detail: "Conocé mejor tus hábitos y tendencias.",
  },
  {
    icon: "bell-outline",
    title: "Recordatorios personalizados",
    detail: "Un empujoncito en el momento ideal.",
  },
] as const;

export default function SettingsScreen({ navigation }: Props) {
  const [premium, setPremium] = useState(false);
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.subtitle}>Tu cuenta, a tu manera.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPremium(true)}
          style={({ pressed }) => [
            styles.row,
            styles.premiumRow,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.crown}>
            <MaterialCommunityIcons name="crown" size={28} color="#F6CD76" />
          </View>
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>Desbloquear Premium</Text>
            <Text style={styles.detail}>Un extra para tu hidratación</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#F6CD76" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("DeleteAccount")}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <Ionicons name="trash-outline" size={24} color="#FF919B" />
          <View style={styles.rowCopy}>
            <Text style={[styles.rowTitle, { color: "#FF919B" }]}>
              Eliminar cuenta
            </Text>
            <Text style={styles.detail}>Borrar mi perfil y mis datos</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.GRAY2} />
        </Pressable>
      </ScrollView>
      <Modal
        visible={premium}
        transparent
        animationType="fade"
        onRequestClose={() => setPremium(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modal} accessibilityViewIsModal>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar Premium"
                hitSlop={12}
                onPress={() => setPremium(false)}
                style={styles.close}
              >
                <Ionicons name="close" size={24} color={Colors.GRAY2} />
              </Pressable>
              <View style={[styles.crown, styles.bigCrown]}>
                <MaterialCommunityIcons
                  name="crown"
                  size={42}
                  color="#F6CD76"
                />
              </View>
              <Text style={styles.eyebrow}>WATERTRACKER PREMIUM</Text>
              <Text style={styles.modalTitle}>Dale más vida a tu rutina</Text>
              <Text style={[styles.subtitle, styles.center]}>
                Pequeños extras para acompañar cada sorbo.
              </Text>
              {premiumOptions.map(({ icon, title, detail }) => (
                <View style={styles.benefit} key={title}>
                  <MaterialCommunityIcons
                    name={icon}
                    size={24}
                    color="#F6CD76"
                  />
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowTitle}>{title}</Text>
                    <Text style={styles.detail}>{detail}</Text>
                  </View>
                </View>
              ))}
              <Text style={styles.price}>
                US$ 2,99 <Text style={styles.detail}>/ mes</Text>
              </Text>
              <Text style={styles.demo}>
                Vista previa · Precio de ejemplo. No se realizará ningún cobro.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPremium(false)}
                style={styles.premiumButton}
              >
                <Text style={styles.premiumButtonText}>Entendido</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.DARKBLUE },
  content: { padding: 24, gap: 16 },
  title: {
    color: Colors.WHITE,
    fontSize: 30,
    fontWeight: "800",
    marginTop: 12,
  },
  subtitle: {
    color: Colors.GRAY2,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 20,
    backgroundColor: Colors.DARKGRAY,
    borderWidth: 1,
    borderColor: "#21475F",
    minHeight: 88,
  },
  premiumRow: { borderColor: "#71603E", backgroundColor: "#242B30" },
  crown: { backgroundColor: "#423B2C", padding: 10, borderRadius: 16 },
  rowCopy: { flex: 1, gap: 5 },
  rowTitle: { color: Colors.WHITE, fontWeight: "700", fontSize: 16 },
  detail: { color: Colors.GRAY2, fontSize: 13, lineHeight: 19 },
  pressed: { opacity: 0.7 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 8, 16, 0.8)",
    justifyContent: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: Colors.DARKGRAY,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#71603E",
    maxHeight: "90%",
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  modalContent: { padding: 24 },
  close: { alignSelf: "flex-end", padding: 4 },
  bigCrown: {
    alignSelf: "center",
    padding: 18,
    borderRadius: 24,
    marginBottom: 20,
  },
  eyebrow: {
    color: "#F6CD76",
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "800",
    textAlign: "center",
  },
  modalTitle: {
    color: Colors.WHITE,
    fontSize: 27,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 12,
  },
  center: { textAlign: "center" },
  benefit: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    marginVertical: 12,
  },
  price: {
    color: Colors.WHITE,
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 20,
    paddingVertical: 12,
  },
  demo: {
    color: Colors.GRAY2,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    marginVertical: 12,
  },
  premiumButton: {
    padding: 17,
    backgroundColor: "#F6CD76",
    borderRadius: 16,
    alignItems: "center",
  },
  premiumButtonText: {
    color: Colors.DARKBLUE,
    fontSize: 16,
    fontWeight: "800",
  },
});
