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
/**
 * Center Deposit FAB rises above the tab bar top edge
 * (`CustomTabBar` elevatedTab.marginTop).
 */
export const TAB_BAR_FAB_OVERHANG = 18;

/**
 * Bottom padding for scroll content in tab screens.
 *
 * Tab scenes already lay out *above* the tab bar (not under it), so we only
 * need clearance for the elevated Deposit FAB that overhangs into the scene,
 * plus a tight breathing gap — not another full tab-bar height.
 */
export function tabBarScrollPadding(_bottomInset = 0) {
  return TAB_BAR_FAB_OVERHANG + spacing.sm;
}
