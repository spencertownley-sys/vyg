import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#0A0A0A",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#FAFAFA",
            fontSize: 20,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.5px",
            fontFamily: "sans-serif",
            marginTop: 1,
          }}
        >
          V
        </span>
      </div>
    ),
    { ...size }
  );
}
