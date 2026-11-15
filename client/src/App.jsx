import Particles from "./components/reactbits/particles/Particles";

function App() {
  return (
    <>
      <div className="site-background">
        <Particles
          particleColors={["#f8f6a9", "#ffffff", "#ffffff"]}
          particleCount={200}
          particleSpread={5}
          speed={0.02}
          particleBaseSize={100}
          glow={0.5}
          twinkle={1}
          moveParticlesOnHover
          hoverEffect="parallax"
          sizeRandomness={1}
          shape="square"
          depthOfField={0.2}
          connections={false}
          connectionDistance={110}
          particleHoverFactor={0.1}
          hoverRadius={140}
          drift="none"
          driftSpeed={1}
          alphaParticles={false}
          disableRotation={false}
          cameraDistance={20}
          variation={0}
          opacity={1}
          clickBurst={false}
          intro
          lightMode={false}
        />
      </div>
      <div className="hero">
        <h1>Pokepository</h1>
        <p>Hi</p>
      </div>
    </>
  );
}

export default App;
