/**
 * THE RADIATE 8 (web address: /radiate8)
 */
import type { Metadata } from "next";
import { Radiate8Home } from "@/components/radiate8/Radiate8Home";

export const metadata: Metadata = { title: "Radiate 8" };

export default function Radiate8Page() {
  return <Radiate8Home />;
}
