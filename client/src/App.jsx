import Particles from "./components/reactbits/particles/Particles";
import HoloCard from "./components/reactbits/holocard/HoloCard";
import StrokeText from "./components/reactbits/stroketext/StrokeText";

function App() {
  return (
    <>
      <div className="site-background">
        <Particles
          particleColors={["#f8f6a9", "#ffffff", "#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.02}
          particleBaseSize={100}
          glow={0.5}
          twinkle={1}
          moveParticlesOnHover
          hoverEffect="parallax"
          sizeRandomness={1}
          shape="ring"
          depthOfField={0}
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
          clickBurst={true}
          intro
          lightMode={false}
        />
      </div>
      <div className="hero-scroll">
        <section className="hero">
          <div className="hero__text">
            <h1 className="hero__title">
              <StrokeText
                text="Poképository"
                strokeColor="#e6f3ab"
                fillColor="currentColor"
                fontSize={96}
                strokeWidth={1.2}
                letterSpacing={-2}
                drawDuration={1.4}
                fillDelay={0.2}
                trigger="mount"
              />
            </h1>
            <div className="hero__lines">
              <p className="hero__line hero__line--a">Hi</p>
              <p className="hero__line hero__line--b">
                Every card you own, now in one place :D
              </p>
            </div>
          </div>
          <div className="hero__card">
            <HoloCard
              image="https://assets.tcgdex.net/en/xy/xy12/100/high.png"
              alt="M Venusaur EX"
              preset="gold"
              width={320}
            />
          </div>
        </section>
      </div>
    </>
  );
}

export default App;
