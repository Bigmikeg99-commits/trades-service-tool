import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SoloPro — Field Service Software for Contractors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#18181b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        {/* Logo mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "48px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "#ffffff",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 700,
              color: "#18181b",
              letterSpacing: "-2px",
            }}
          >
            SP
          </div>
          <span
            style={{
              fontSize: "52px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-2px",
            }}
          >
            SoloPro
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "54px",
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: "960px",
            letterSpacing: "-2px",
            marginBottom: "28px",
          }}
        >
          Field Service Software for Contractors
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: "26px",
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          Quotes, proposals, and scheduling — built for the truck
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "48px",
          }}
        >
          {["Fast Quotes", "PDF Proposals", "Crew Scheduling"].map((label) => (
            <div
              key={label}
              style={{
                background: "#27272a",
                border: "1px solid #3f3f46",
                borderRadius: "9999px",
                padding: "10px 24px",
                fontSize: "20px",
                color: "#d4d4d8",
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
