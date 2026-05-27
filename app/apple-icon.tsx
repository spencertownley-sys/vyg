import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#0A0A0A",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#FAFAFA",
            fontSize: 112,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-2px",
            fontFamily: "sans-serif",
            marginTop: 4,
          }}
        >
          V
        </span>
      </div>
    ),
    { ...size }
  );
}
