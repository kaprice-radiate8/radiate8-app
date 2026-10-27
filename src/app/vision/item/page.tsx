/**
 * ONE ITEM ON HER VISION BOARD (web address: /vision/item?id=...)
 * Built once and reads which item to show from the address, like /intentions/view.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { VisionItemScreen } from "@/components/vision/VisionItemScreen";

export const metadata: Metadata = { title: "On your vision board" };

export default function VisionItemPage() {
  return (
    <Suspense fallback={null}>
      <VisionItemScreen />
    </Suspense>
  );
}
