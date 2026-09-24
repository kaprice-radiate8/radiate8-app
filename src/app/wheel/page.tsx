/**
 * THE RADIATE 8 WHEEL (web address: /wheel)
 */
import type { Metadata } from "next";
import { WheelScreen } from "@/components/wheel/WheelScreen";

export const metadata: Metadata = { title: "Wheel" };

export default function WheelPage() {
  return <WheelScreen />;
}
