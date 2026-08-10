import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";

const MAX_EDGE = 1024;
const JPEG_QUALITY = 0.62;
const MAX_DATA_URL_CHARS = 900_000;

export type KycImageSource = "library" | "camera";

async function ensurePermission(source: KycImageSource): Promise<boolean> {
  if (source === "camera") {
    const current = await ImagePicker.getCameraPermissionsAsync();
    if (current.granted) return true;
    const asked = await ImagePicker.requestCameraPermissionsAsync();
    if (asked.granted) return true;
    Alert.alert(
      "Camera access needed",
      "Allow camera access in Settings to capture your ID or selfie.",
      [
        { text: "Not now", style: "cancel" },
        { text: "Open Settings", onPress: () => void Linking.openSettings() },
      ],
    );
    return false;
  }

  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted || current.accessPrivileges === "limited") return true;
  const asked = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (asked.granted || asked.accessPrivileges === "limited") return true;
  Alert.alert(
    "Photo access needed",
    "Allow photo library access in Settings to upload verification documents.",
    [
      { text: "Not now", style: "cancel" },
      { text: "Open Settings", onPress: () => void Linking.openSettings() },
    ],
  );
  return false;
}

async function compressDoc(uri: string): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_EDGE } }],
    {
      compress: JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );

  if (!manipulated.base64) {
    throw new Error("Could not process that image. Try another photo.");
  }

  const dataUrl = `data:image/jpeg;base64,${manipulated.base64}`;
  if (dataUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error("That photo is too large. Try a clearer, closer shot.");
  }
  return dataUrl;
}

/** Capture or pick a KYC document / selfie as a compressed JPEG data URL. */
export async function pickKycImage(
  source: KycImageSource,
  options?: { square?: boolean; cameraType?: "front" | "back" },
): Promise<string | null> {
  const ok = await ensurePermission(source);
  if (!ok) return null;

  const pickerOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: options?.square ? [1, 1] : [4, 3],
    quality: 0.9,
    exif: false,
    cameraType:
      options?.cameraType === "front"
        ? ImagePicker.CameraType.front
        : ImagePicker.CameraType.back,
  };

  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions);

  if (result.canceled || !result.assets?.[0]?.uri) return null;
  return compressDoc(result.assets[0].uri);
}

export function presentKycImageActions(options: {
  title: string;
  message?: string;
  onLibrary: () => void;
  onCamera: () => void;
}) {
  Alert.alert(options.title, options.message, [
    { text: "Take photo", onPress: options.onCamera },
    { text: "Choose from library", onPress: options.onLibrary },
    { text: "Cancel", style: "cancel" },
  ]);
}
