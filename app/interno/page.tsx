import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Painel interno",
  description: "Triagem editorial dos envios do VR Abandonada.",
};

export default function InternalHomePage() {
  redirect("/interno/intake");
}
