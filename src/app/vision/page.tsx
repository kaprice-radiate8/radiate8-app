/** HER VISION BOARD (web address: /vision) */
import type { Metadata } from "next";
import { VisionBoard } from "@/components/vision/VisionBoard";

export const metadata: Metadata = { title: "Your vision board" };

export default function VisionPage() {
  return <VisionBoard />;
}
