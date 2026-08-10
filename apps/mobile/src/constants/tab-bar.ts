import { spacing } from "@/theme/tokens";

/** Glyph size rendered inside each tab icon slot. */
export const TAB_BAR_ICON_SIZE = 22;
/** Slightly larger than the glyph so FA icons are not clipped at the edges. */
export const TAB_BAR_ICON_SLOT = 28;
export const TAB_BAR_PADDING_TOP = 6;
export const TAB_BAR_ITEM_GAP = 2;
export const TAB_BAR_MIN_BOTTOM_INSET = 4;
export const TAB_BAR_HORIZONTAL_INSET = 4;
/** Icon row + label + internal gap (excludes outer padding and safe area). */
export const TAB_BAR_CONTENT_HEIGHT = 40;
/** Center Deposit FAB rises above the tab bar top edge. */
export const TAB_BAR_FAB_OVERHANG = 18;

/**
 * Scroll padding so content clears the custom tab bar + elevated FAB
 * without leaving a large empty dead zone under the last section.
 */
export function tabBarScrollPadding(bottomInset: number) {
  const tabBarHeight =
    TAB_BAR_PADDING_TOP +
    TAB_BAR_CONTENT_HEIGHT +
    Math.max(bottomInset, TAB_BAR_MIN_BOTTOM_INSET);
  return tabBarHeight + TAB_BAR_FAB_OVERHANG + spacing.sm;
}
