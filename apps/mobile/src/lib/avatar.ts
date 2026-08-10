import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking, Platform } from "react-native";

const MAX_EDGE = 400;
const JPEG_QUALITY = 0.72;
/** Keep payload small for data-URL storage on PUT /users/me */
const MAX_DATA_URL_CHARS = 900_000;

export type AvatarPickSource = "library" | "camera";

async function ensurePermission(source: AvatarPickSource): Promise<boolean> {
  if (source === "camera") {
    const current = await ImagePicker.getCameraPermissionsAsync();
    if (current.granted) return true;
    const asked = await ImagePicker.requestCameraPermissionsAsync();
    if (asked.granted) return true;
    Alert.alert(
      "Camera access needed",
      "Allow camera access in Settings to take a profile photo.",
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
    "Allow photo library access in Settings to choose a profile photo.",
    [
      { text: "Not now", style: "cancel" },
      { text: "Open Settings", onPress: () => void Linking.openSettings() },
    ],
  );
  return false;
}

async function compressToDataUrl(uri: string): Promise<string> {
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
    throw new Error("Could not process that photo. Try another image.");
  }

  const dataUrl = `data:image/jpeg;base64,${manipulated.base64}`;
  if (dataUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error("That photo is too large. Try a clearer, smaller image.");
  }

  return dataUrl;
}

/**
 * Pick + crop + compress a square avatar into a JPEG data URL
 * (same storage approach as the web profile).
 */
export async function pickAndCompressAvatar(
  source: AvatarPickSource,
): Promise<string | null> {
  const ok = await ensurePermission(source);
  if (!ok) return null;

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.9,
    exif: false,
  };

  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }

  return compressToDataUrl(result.assets[0].uri);
}

export function presentAvatarActions(options: {
  hasAvatar: boolean;
  onLibrary: () => void;
  onCamera: () => void;
  onRemove?: () => void;
}) {
  const buttons: {
    text: string;
    style?: "cancel" | "destructive" | "default";
    onPress?: () => void;
  }[] = [
    { text: "Choose from library", onPress: options.onLibrary },
    ...(Platform.OS !== "web"
      ? [{ text: "Take photo", onPress: options.onCamera }]
      : []),
    ...(options.hasAvatar && options.onRemove
      ? [
          {
            text: "Remove photo",
            style: "destructive" as const,
            onPress: options.onRemove,
          },
        ]
      : []),
    { text: "Cancel", style: "cancel" },
  ];

  Alert.alert(
    "Profile photo",
    "Add a clear photo of yourself. Members will see it on your home and profile.",
    buttons,
  );
}
