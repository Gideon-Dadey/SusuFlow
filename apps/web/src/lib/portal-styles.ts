/** Portal UI class tokens — OmniH healthcare portal pattern */
export const HC = {
  btnPrimary:
    "inline-flex items-center justify-center gap-2 bg-slate-900 px-4 py-2.5 text-[15px] font-bold text-white shadow-sm hover:opacity-95 active:scale-[0.98] transition-all dark:bg-white dark:text-[#1a1a1a] disabled:opacity-50",
  btnSecondary:
    "inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-[15px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all dark:border-twitter-dark-border dark:bg-twitter-dark-elevated dark:text-white dark:hover:bg-twitter-dark-hover disabled:opacity-50",
  btnDanger:
    "inline-flex items-center justify-center gap-2 border border-rose-200 bg-rose-50 px-4 py-2.5 text-[15px] font-semibold text-rose-700 hover:bg-rose-100 active:scale-[0.98] transition-all dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300",
  input:
    "w-full px-4 py-3.5 border border-slate-200 bg-white text-[16px] text-[#1a1a1a] placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 dark:border-twitter-dark-border dark:bg-twitter-dark-elevated dark:text-white dark:placeholder:text-slate-600",
  card: "rounded border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-twitter-dark-elevated",
  cardHeader:
    "px-6 py-5 border-b border-slate-100 dark:border-twitter-dark-border",
  cardBody: "p-6",
} as const;
