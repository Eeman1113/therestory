import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { TimelineStrip } from "@/components/timeline/timeline-strip";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Therestory — world history, by time",
    template: "%s · Therestory",
  },
  description:
    "Therestory is the single most complete, up-to-date home for world history — Wikipedia, but organized by time instead of topic.",
  metadataBase: new URL("https://eeman1113.github.io/therestory/"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-bg text-ink flex flex-col">
        <ThemeProvider>
          <TimelineStrip />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
