import { ReactNode } from "react";
import {
  TabScreenHeader,
  TabScreenLayout,
  TabScreenSection,
} from "@/components/layout/TabScreen";

interface ScreenProps {
  title?: string;
  children: ReactNode;
}

/** @deprecated Prefer TabScreenLayout + TabScreenHeader + TabScreenSection */
export function Screen({ title, children }: ScreenProps) {
  return (
    <TabScreenLayout
      header={title ? <TabScreenHeader title={title} /> : undefined}
    >
      {children}
    </TabScreenLayout>
  );
}

export { TabScreenSection as ScreenSection } from "@/components/layout/TabScreen";
