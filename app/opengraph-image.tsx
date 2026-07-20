import { OG_SIZE, OG_CONTENT_TYPE, ogImage } from "@/lib/og/template";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Therestory — a history of everything, everywhere, arranged along a single line.";

export default function Image() {
  return ogImage({
    title: "A history of everything, everywhere, arranged along a single line.",
    footer: "eeman1113.github.io/therestory",
  });
}
