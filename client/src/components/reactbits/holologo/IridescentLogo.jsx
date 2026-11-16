import Iridescence from "../iridescence/Iridescence";
import logo from "./pokepository-anim-vector.svg";

export default function IridescentLogo() {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        background: "#0c0b10",
        WebkitMaskImage: `url("${logo}")`,
        maskImage: `url("${logo}")`,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
      }}
    >
      <Iridescence color="#8b769f" speed={0.5} />
    </div>
  );
}
