import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});
import { ThemeProvider } from "@/components/theme-provider";
import { TimelineViewProvider } from "@/components/timeline/timeline-view";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CommandPaletteMount } from "@/components/command-palette-mount";
import { SkipToContent } from "@/components/skip-to-content";
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
      className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-bg text-ink flex flex-col">
        <SkipToContent />
        <ThemeProvider>
          <TimelineViewProvider>
            <SiteHeader />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
            <CommandPaletteMount />
          </TimelineViewProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
