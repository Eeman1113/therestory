import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const FONT_DIR = path.join(process.cwd(), "node_modules", "geist", "dist", "fonts");

const geistSansRegular = readFileSync(path.join(FONT_DIR, "geist-sans", "Geist-Regular.ttf"));
const geistSansMedium = readFileSync(path.join(FONT_DIR, "geist-sans", "Geist-Medium.ttf"));
const geistMonoRegular = readFileSync(path.join(FONT_DIR, "geist-mono", "GeistMono-Regular.ttf"));

const wordmarkPng = readFileSync(path.join(process.cwd(), "public", "wordmark.png"));
const wordmarkDataUrl = `data:image/png;base64,${wordmarkPng.toString("base64")}`;

const PAPER = "#F6F3EC";
const INK = "#1A1815";
const INK_MUTED = "#6B655A";
const RULE = "#DDD7C7";
const ACCENT = "#2E4057";

interface Params {
  eyebrow?: string;
  date?: string;
  title: string;
  footer?: string;
}

export function ogImage({ eyebrow, date, title, footer }: Params) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "72px 80px",
          background: PAPER,
          color: INK,
          fontFamily: "'Geist'",
          fontSize: 24,
          position: "relative",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 16,
            color: INK_MUTED,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={wordmarkDataUrl} width={110} height={52} alt="Therestory" />
          <span
            style={{
              fontFamily: "'Geist Mono'",
              textTransform: "uppercase",
              letterSpacing: 3,
            }}
          >
            /3500 BCE → 2026
          </span>
        </div>

        {/* Date */}
        {date && (
          <div
            style={{
              display: "flex",
              marginTop: 72,
              fontFamily: "'Geist Mono'",
              fontSize: 56,
              letterSpacing: -1,
              color: INK,
            }}
          >
            {date}
          </div>
        )}

        {/* Eyebrow */}
        {eyebrow && (
          <div
            style={{
              display: "flex",
              marginTop: date ? 20 : 72,
              textTransform: "uppercase",
              letterSpacing: 4,
              fontSize: 14,
              color: ACCENT,
            }}
          >
            {eyebrow}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize:
              title.length > 80
                ? 46
                : title.length > 55
                  ? 56
                  : title.length > 35
                    ? 72
                    : 96,
            lineHeight: 1.05,
            letterSpacing: -2,
            fontWeight: 500,
            color: INK,
            maxWidth: 1040,
          }}
        >
          {title}
        </div>

        {/* Spacer to push footer down */}
        <div style={{ display: "flex", flex: 1, minHeight: 40 }} />

        {/* Hairline rule */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 1,
            background: RULE,
            marginBottom: 20,
          }}
        />

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontSize: 20,
            color: INK_MUTED,
          }}
        >
          <span>{footer ?? "eeman1113.github.io/therestory"}</span>
          <span
            style={{
              fontFamily: "'Geist Mono'",
              fontSize: 14,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Wikipedia · by time
          </span>
        </div>

        {/* Accent bar in top-right corner as a graphic anchor */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            right: 80,
            width: 3,
            height: 44,
            background: ACCENT,
          }}
        />
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        {
          name: "Geist",
          data: geistSansRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Geist",
          data: geistSansMedium,
          weight: 500,
          style: "normal",
        },
        {
          name: "Geist Mono",
          data: geistMonoRegular,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );
}
