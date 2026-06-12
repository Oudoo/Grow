import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GROW — Integrated Creative & Enterprise Infrastructure Operating as One.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INDIGO = "#4F46E5";
const CHARCOAL = "#1A202C";
const ALABASTER = "#F8F9FA";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF",
          padding: "72px 80px",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <svg width="72" height="72" viewBox="0 0 100 100" fill="none">
              <g stroke={INDIGO} strokeWidth="5.5">
                <path d="M 31,5 H 69 L 95,31 V 42 M 95,66 V 69 L 69,95 H 31 L 5,69 V 31 Z" />
                <path d="M 35,15 H 65 L 85,35 V 42 M 85,66 V 65 L 65,85 H 35 L 15,65 V 35 Z" />
                <path d="M 39,25 H 61 L 75,39 V 42 M 75,66 V 61 L 61,75 H 39 L 25,61 V 39 Z" />
                <path d="M 97,46 H 50" />
                <path d="M 97,54 H 58" />
                <path d="M 97,62 H 66" />
              </g>
            </svg>
            <div style={{ display: "flex", fontSize: 56, fontWeight: 800, color: CHARCOAL, letterSpacing: -2 }}>
              GROW
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: CHARCOAL,
              border: `2px solid ${CHARCOAL}`,
              borderRadius: 999,
              padding: "10px 28px",
            }}
          >
            INSTITUTIONAL TECH
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, color: CHARCOAL, letterSpacing: -2, lineHeight: 1.05 }}>
            Integrated Creative &
          </div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, color: INDIGO, letterSpacing: -2, lineHeight: 1.05 }}>
            Enterprise Infrastructure
          </div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, color: CHARCOAL, letterSpacing: -2, lineHeight: 1.05 }}>
            Operating as One.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${ALABASTER}`,
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", fontSize: 24, color: "#5C636B" }}>
            The Foundational Operating System for Modern Marketing.
          </div>
          <div style={{ display: "flex", fontSize: 24, color: INDIGO, fontFamily: "monospace" }}>
            CLARITY AT SCALE
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
