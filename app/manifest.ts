import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyAccentTrainer",
    short_name: "MyAccentTrainer",
    description: "Speak English clearly. Keep your own voice. Practice with Nina, your AI coach.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f6faf8",
    theme_color: "#20ad68",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
