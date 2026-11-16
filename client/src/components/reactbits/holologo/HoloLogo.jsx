import { useEffect, useRef } from "react";
import logo from "./pokepository-anim-vector.svg";

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
#define PI 3.14159265359
#define TAU 6.28318530718
#define MATERIAL_OUTSIDE false
#define MATERIAL_REACH 0.3200
uniform sampler2D uField;
uniform sampler2D uSurf;
uniform vec2 uFieldScale;
uniform vec2 uResolution;
uniform float uTime;
uniform vec4 uMatP[8];
uniform vec4 uMatC[16];
uniform vec4 uSurface;
out vec4 outColor;
#define P_hueShift uMatP[0].x
#define P_foilScale uMatP[0].y
#define P_saturation uMatP[0].z
#define P_silver uMatP[0].w
#define P_roughness uMatP[1].x
#define P_crinkle uMatP[1].y
#define P_crinkleScale uMatP[1].z
#define P_sparkle uMatP[1].w
#define P_speed uMatP[2].x

struct Surface {
  vec2 p;
  vec2 uv;
  vec2 frag;
  vec2 res;
  float unit;
  float px;
  float d;
  float aa;
  float cov;
  vec2 n;
  float slope;
  float time;
};

mat2 rot2(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c);
}

float smin(float a, float b, float k) {
  if (k <= 0.0) return min(a, b);
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

float smax(float a, float b, float k) {
  return -smin(-a, -b, k);
}

vec4 over(vec4 base, vec4 top) {
  return top + base * (1.0 - top.a);
}

vec3 toLinear(vec3 c) {
  return pow(c, vec3(2.2));
}

vec3 toDisplay(vec3 c) {
  return pow(max(c, 0.0), vec3(1.0 / 2.2));
}

float shapeAt(vec2 q) {
  return texture(uField, q * uFieldScale + 0.5).r;
}

vec4 backdropAt(vec2 q) {
  return vec4(0.0);
}

float surfaceRim(Surface s, float width) {
  return clamp(1.0 + s.d / max(width, 1e-4), 0.0, 1.0);
}

vec3 domeNormal(Surface s, float width) {
  float x = min(surfaceRim(s, width), 0.985) * smoothstep(0.15, 0.85, s.slope);
  return normalize(vec3(s.n * x, sqrt(1.0 - x * x)));
}

float domeHeight(Surface s, float width) {
  float x = surfaceRim(s, width);
  return sqrt(max(1.0 - x * x, 0.0));
}


const vec2 m_LD = vec2(0.5, -0.8660254);
const vec3 m_L = vec3(0.37164709, -0.64371163, -0.66896474);

uint m_rotl(uint x, int k) {
  return (x << uint(k)) | (x >> uint(32 - k));
}

uint m_hashInt(int x, int y) {
  uint seed = 0xdeadbeefu + (2u << 2u) + 13u;
  uint a = seed + uint(x);
  uint b = seed + uint(y);
  uint c = seed;
  c ^= b; c -= m_rotl(b, 14);
  a ^= c; a -= m_rotl(c, 11);
  b ^= a; b -= m_rotl(a, 25);
  c ^= b; c -= m_rotl(b, 16);
  a ^= c; a -= m_rotl(c, 4);
  b ^= a; b -= m_rotl(a, 14);
  c ^= b; c -= m_rotl(b, 24);
  return c;
}

float m_grad(uint h, float x, float y) {
  h &= 7u;
  float u = h < 4u ? x : y;
  float v = 2.0 * (h < 4u ? y : x);
  return ((h & 1u) != 0u ? -u : u) + ((h & 2u) != 0u ? -v : v);
}

float m_noise(vec2 p) {
  int X = int(floor(p.x));
  int Y = int(floor(p.y));
  float fx = p.x - float(X);
  float fy = p.y - float(Y);
  float u = fx * fx * fx * (fx * (fx * 6.0 - 15.0) + 10.0);
  float v = fy * fy * fy * (fy * (fy * 6.0 - 15.0) + 10.0);
  float a = m_grad(m_hashInt(X, Y), fx, fy);
  float b = m_grad(m_hashInt(X + 1, Y), fx - 1.0, fy);
  float c = m_grad(m_hashInt(X, Y + 1), fx, fy - 1.0);
  float d = m_grad(m_hashInt(X + 1, Y + 1), fx - 1.0, fy - 1.0);
  return 0.6616 * mix(mix(a, b, u), mix(c, d, u), v);
}

vec3 m_rainbow(float t) {
  return cos((t + vec3(0.0, 1.0 / 3.0, 2.0 / 3.0)) * TAU) * 0.5 + 0.5;
}

vec4 material(Surface s) {
  if (s.d > 0.02) return vec4(0.0);
  float t = s.time * P_speed;
  float sdf = s.d * 0.5;
  vec2 pd = s.p * 0.5;
  vec2 grad = s.n * s.slope;

  float edgeT = clamp(-sdf / 0.06, 0.0, 1.0);
  vec2 base = grad * (1.0 - edgeT) * 0.35;

  float crScale = P_crinkleScale * 1.35;
  float crAmp = P_crinkle * 0.8;
  float neps = 0.02;
  vec2 cq = pd * crScale + vec2(2.7, 11.3);
  float w0 = m_noise(cq);
  float wx = (m_noise(cq + vec2(neps * crScale, 0.0)) - w0) / neps;
  float wy = (m_noise(cq + vec2(0.0, neps * crScale)) - w0) / neps;
  vec3 n = normalize(vec3(base + vec2(wx, wy) * crAmp * 0.4, -1.0));

  float fScale = P_foilScale * 2.2;
  float drift = t * 0.06;
  float blotch = m_noise(pd * fScale + drift * m_LD)
    + m_noise(pd * fScale * 2.1 + vec2(5.2, 9.4) - drift * m_LD * 1.6) * 0.4;
  float tilt = dot(n.xy, m_LD);
  float ramp = dot(pd, m_LD) * 0.8;
  float sv = clamp(P_silver, 0.0, 1.0);
  float s1 = smoothstep(0.0, 0.5, sv);
  float s2 = smoothstep(0.4, 1.0, sv);
  float hue = blotch * 0.45 * mix(1.0, 0.5, s2) + ramp * mix(1.0, 1.8, s2) + tilt * 1.4 + t * 0.18 + P_hueShift / 360.0;

  float sat = clamp(P_saturation, 0.0, 1.0);
  float env = smoothstep(-0.5, 0.5, dot(n.xy, vec2(0.6, 0.8)) * 3.0 + dot(pd, vec2(-0.5, 0.9)) * 1.2);
  vec3 silver = vec3(0.72, 0.73, 0.76) * mix(1.0, 0.3 + 0.75 * env, s1);
  float k = mix(1.0, 1.8, s1);
  float w = mix(1.0, 0.55, s1) * mix(1.0, 0.62, s2);
  float u = fract(hue * k + 0.5) - 0.5;
  float inBand = 1.0 - smoothstep(0.3 * w, 0.5 * w, abs(u));
  float bandHue = mix(0.0, 0.6667, s1) + u / w * mix(1.0, 0.6667, s1);
  vec3 spectral = pow(m_rainbow(bandHue), vec3(mix(1.0, 2.4, s2))) * mix(1.0, 1.25, s2);
  float spectralAmt = sat * mix(0.85, inBand * mix(0.85, 1.0, s2), s1);
  vec3 tint = mix(silver, spectral, spectralAmt);

  float rough = clamp(P_roughness, 0.0, 1.0);
  vec3 H = normalize(m_L + vec3(0.0, 0.0, -1.0));
  float ndl = clamp(dot(n, m_L) * 0.5 + 0.5, 0.0, 1.0);
  float ndh = clamp(dot(n, H), 0.0, 1.0);
  float sheen = pow(ndh, 7.0) * 0.45 * (1.0 - rough * 0.35);
  float specCore = pow(ndh, mix(42.0, 12.0, rough)) * 0.85 * (1.0 - rough * 0.55);
  vec3 spec = tint * sheen + mix(tint, vec3(1.0), 0.6) * specCore;

  vec2 fq = pd * 190.0;
  float flakeN = m_noise(fq);
  float flakePhase = m_noise(fq + vec2(47.3, -31.1));
  float twinkle = sin(t * 2.2 + flakePhase * 12.6) * 0.5 + 0.5;
  float flakeMask = smoothstep(0.52, 0.62, flakeN * 0.75 + twinkle * 0.3) * clamp(P_sparkle, 0.0, 1.0);
  vec3 flake = m_rainbow(hue + 0.33 + flakePhase * 0.5) * (0.85 + twinkle * 0.55) * (ndl * 0.6 + 0.7);

  float grain = m_noise(pd * 420.0);
  float grainMul = 1.0 + grain * rough * 0.28;

  vec3 foil = tint * (ndl * 0.5 + 0.62) + spec;
  foil = mix(foil, flake, flakeMask) * grainMul;
  return vec4(toDisplay(clamp(foil, 0.0, 1.0)), 1.0);
}


void main() {

  float unit = min(uResolution.x, uResolution.y) * 0.5;
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  vec2 p = (frag - uResolution * 0.5) / unit;
  float px = 1.0 / unit;
  float bw = max(uSurface.x, px);
  float e = clamp(bw * 0.2, px * 1.5, max(bw * 0.5, px * 1.5));
  float d = shapeAt(p);
  float aa = clamp(length(vec2(dFdx(d), dFdy(d))), px * 0.5, px * 1.5);
  vec2 g = vec2(shapeAt(p + vec2(e, 0.0)) - shapeAt(p - vec2(e, 0.0)), shapeAt(p + vec2(0.0, e)) - shapeAt(p - vec2(0.0, e))) / (2.0 * e);
  Surface s;
  s.p = p;
  s.uv = frag / uResolution;
  s.frag = frag;
  s.res = uResolution;
  s.unit = unit;
  s.px = px;
  s.d = d;
  s.aa = aa;
  s.cov = clamp(0.5 - d / aa, 0.0, 1.0);
  s.slope = length(g);
  s.n = s.slope > 1e-5 ? g / s.slope : vec2(0.0);
  s.time = uTime;

  vec4 m = material(s);
  float reach = 1.0 - smoothstep(MATERIAL_REACH * 0.55, MATERIAL_REACH, d);
  float a = clamp(MATERIAL_OUTSIDE ? m.a * max(reach, s.cov) : m.a * s.cov, 0.0, 1.0);
  outColor = vec4(clamp(m.rgb, 0.0, 1.0) * a, a);
}
`;

const toRgba = (value) => {
  const hex = String(value || "#ffffff").replace("#", "");
  const full =
    hex.length <= 4
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;
  const channel = (index) => parseInt(full.slice(index, index + 2), 16) / 255;
  return [
    channel(0),
    channel(2),
    channel(4),
    full.length >= 8 ? channel(6) : 1,
  ];
};

const solve = (grid, offset, stride, length, f, v, z) => {
  for (let i = 0; i < length; i++) f[i] = grid[offset + i * stride];
  let k = 0;
  v[0] = 0;
  z[0] = -1e20;
  z[1] = 1e20;
  for (let q = 1; q < length; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = 1e20;
  }
  k = 0;
  for (let q = 0; q < length; q++) {
    while (z[k + 1] < q) k++;
    grid[offset + q * stride] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
};

const distances = (grid, width, height) => {
  const size = Math.max(width, height);
  const f = new Float64Array(size);
  const v = new Int32Array(size);
  const z = new Float64Array(size + 1);
  for (let x = 0; x < width; x++) solve(grid, x, width, height, f, v, z);
  for (let y = 0; y < height; y++) solve(grid, y * width, 1, width, f, v, z);
};

const loadField = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const long = 640;
      const ratio = image.width / image.height || 1;
      const width = Math.round(ratio >= 1 ? long : long * ratio);
      const height = Math.round(ratio >= 1 ? long / ratio : long);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height).data;
      const outer = new Float64Array(width * height);
      const inner = new Float64Array(width * height);
      for (let i = 0; i < width * height; i++) {
        const a = pixels[i * 4 + 3] / 255;
        const edge = 0.5 - a;
        outer[i] = a >= 1 ? 0 : a <= 0 ? 1e20 : edge > 0 ? edge * edge : 0;
        inner[i] = a <= 0 ? 0 : a >= 1 ? 1e20 : edge < 0 ? edge * edge : 0;
      }
      distances(outer, width, height);
      distances(inner, width, height);
      const unit = Math.min(width, height) / 2;
      const data = new Float32Array(width * height);
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.sqrt(outer[i]) - Math.sqrt(inner[i])) / unit;
      resolve({ data, width, height });
    };
    image.onerror = reject;
    image.src = src;
  });

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

export default function PokepositoryVector2Mark({
  src = logo,
  className,
  style,
  hueShift = 59,
  foilScale = 3.15,
  saturation = 0.75,
  silver = 0.64,
  roughness = 0.12,
  crinkle = 0.22,
  crinkleScale = 1,
  sparkle = 0.61,
  speed = 0.49,
}) {
  const canvasRef = useRef(null);
  const settings = useRef({});
  settings.current = {
    hueShift,
    foilScale,
    saturation,
    silver,
    roughness,
    crinkle,
    crinkleScale,
    sparkle,
    speed,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
    });
    if (!gl) return undefined;
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.bindAttribLocation(program, 0, "aPosition");
    gl.linkProgram(program);
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uniform = (name) => gl.getUniformLocation(program, name);
    const texture = gl.createTexture();
    const surface = gl.createTexture();
    let field = null;
    let frame = 0;
    let alive = true;
    const started = performance.now();

    const pack = ({
      hueShift,
      foilScale,
      saturation,
      silver,
      roughness,
      crinkle,
      crinkleScale,
      sparkle,
      speed,
    }) => {
      const floats = new Float32Array(32);
      const colors = new Float32Array(64);
      floats[0] = Number(hueShift) || 0;
      floats[1] = Number(foilScale) || 0;
      floats[2] = Number(saturation) || 0;
      floats[3] = Number(silver) || 0;
      floats[4] = Number(roughness) || 0;
      floats[5] = Number(crinkle) || 0;
      floats[6] = Number(crinkleScale) || 0;
      floats[7] = Number(sparkle) || 0;
      floats[8] = Number(speed) || 0;
      return { floats, colors };
    };

    const render = (now) => {
      frame = requestAnimationFrame(render);
      if (!field) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const { floats, colors } = pack(settings.current);
      const fieldUnit = Math.min(field.width, field.height) / 2;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uniform("uResolution"), width, height);
      gl.uniform2f(
        uniform("uFieldScale"),
        fieldUnit / field.width,
        fieldUnit / field.height,
      );
      gl.uniform1f(uniform("uTime"), (now - started) / 1000);
      gl.uniform4fv(uniform("uMatP"), floats);
      gl.uniform4fv(uniform("uMatC"), colors);
      gl.uniform4f(uniform("uSurface"), 0.08, 0, 0, 0);
      gl.uniform1i(uniform("uField"), 0);
      gl.uniform1i(uniform("uSurf"), 1);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    loadField(src)
      .then((result) => {
        if (!alive) return;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.R16F,
          result.width,
          result.height,
          0,
          gl.RED,
          gl.FLOAT,
          result.data,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        field = result;
      })
      .catch(() => {});
    frame = requestAnimationFrame(render);

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      gl.deleteTexture(texture);
      gl.deleteTexture(surface);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: "block",
        width: "100%",
        aspectRatio: "1 / 1",
        ...style,
      }}
    />
  );
}

PokepositoryVector2Mark.credits =
  "Material adapted from Shaders.com by Shader Effects Inc., MIT License, https://github.com/shader-effects-inc/shaders";
