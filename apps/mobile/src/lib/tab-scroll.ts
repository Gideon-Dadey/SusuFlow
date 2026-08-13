import { DeviceEventEmitter } from "react-native";

/** Fired when the user re-taps the already-focused tab (iOS/Android convention). */
export const TAB_SCROLL_TO_TOP_EVENT = "susuflow:tab-scroll-to-top";

export function emitTabScrollToTop(routeName: string) {
  DeviceEventEmitter.emit(TAB_SCROLL_TO_TOP_EVENT, routeName);
}
