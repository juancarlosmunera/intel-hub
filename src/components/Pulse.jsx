export default function Pulse({ color }) {
  return (
    <span style={{ display: "inline-block", position: "relative", width: 10, height: 10, marginRight: 8, flexShrink: 0 }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%", backgroundColor: color,
        animation: "pulse 2s ease-in-out infinite",
      }} />
      <span style={{
        position: "absolute", inset: -3, borderRadius: "50%", border: `1.5px solid ${color}`,
        opacity: 0.4, animation: "pulse-ring 2s ease-in-out infinite",
      }} />
    </span>
  );
}
