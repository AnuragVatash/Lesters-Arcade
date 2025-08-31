import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Border */}
        <div
          style={{
            position: "absolute",
            top: 2,
            left: 2,
            right: 2,
            bottom: 2,
            border: "1px solid #22c55e",
            background: "#0a0a0a",
          }}
        />
        {/* Green bar */}
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 4,
            width: 24,
            height: 4,
            background: "#22c55e",
          }}
        />
        {/* Green dots */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 4,
            width: 12,
            height: 2,
            background: "#15803d",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 4,
            width: 16,
            height: 2,
            background: "#15803d",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 4,
            width: 10,
            height: 2,
            background: "#15803d",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 4,
            width: 18,
            height: 2,
            background: "#15803d",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
