/** Same mark as web `apps/web/public/brand/logo-transparent.png` (PaySense-style wordmark). */
export const BRAND_LOGO = require("../../assets/images/logo-transparent.png");
/** Intrinsic aspect of the optimized wordmark (~2.58:1). */
export const BRAND_LOGO_ASPECT = 922 / 357;
/** Atmospheric splash / welcome backdrop (optimized JPEG). */
export const SPLASH_BACKGROUND = require("../../assets/images/splash-bg.jpg");
/** Welcome screen rotating lifestyle slides. */
export const WELCOME_SLIDES = [
  require("../../assets/images/welcome-slide-1.jpg"),
  require("../../assets/images/welcome-slide-2.jpg"),
  require("../../assets/images/welcome-slide-3.jpg"),
] as const;
/** Home promo carousel lifestyle photos (optimized JPEG). */
export const HOME_PROMO_IMAGES = {
  deposit: require("../../assets/images/home-promo-save-today.jpg"),
  grow: require("../../assets/images/home-promo-stay-consistent.jpg"),
  goals: require("../../assets/images/home-promo-save-together.jpg"),
} as const;

/** Mobile-money provider marks used on deposit / withdraw. */
export const MOBILE_MONEY_MARKS = {
  mtn: require("../../assets/images/payments/mtn.png"),
  telecel: require("../../assets/images/payments/telecel.png"),
  airteltigo: require("../../assets/images/payments/airteltigo.png"),
  bank: require("../../assets/images/payments/bank.png"),
} as const;
