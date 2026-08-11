import * as THREE from "three";

/**
 * Custom GLSL Shader Material for 28m Karesansui Raked Sand Bed.
 * Features:
 * - Parallel linear raked furrows across the 28m ground plane
 * - Concentric circular ripples around rock islands
 * - Interactive expanding ripple shockwave triggered by user interaction
 * - Analytical procedural normal calculation for realistic sand lighting
 * - Fine-grained micro-gravel noise
 */
export const RakedSandShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uSandColor: { value: new THREE.Color("#d5c4a1") },
    uRakeColor: { value: new THREE.Color("#9d8866") },
    uShadowColor: { value: new THREE.Color("#564736") },
    uRippleCenter: { value: new THREE.Vector2(0, 0) },
    uRippleTime: { value: -100 },
    uRippleStrength: { value: 0 },
    // Rock island positions (in 28m world space) for concentric raking
    uRockIsland0: { value: new THREE.Vector2(-4.0, -3.0) },
    uRockIsland1: { value: new THREE.Vector2(5.0, 2.0) },
    uRockIsland2: { value: new THREE.Vector2(0.5, 6.0) },
    uRockIsland3: { value: new THREE.Vector2(-6.0, 7.0) },
  },
  vertexShader: /* glsl */ `
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec3 uSandColor;
    uniform vec3 uRakeColor;
    uniform vec3 uShadowColor;
    uniform vec2 uRippleCenter;
    uniform float uRippleTime;
    uniform float uRippleStrength;

    uniform vec2 uRockIsland0;
    uniform vec2 uRockIsland1;
    uniform vec2 uRockIsland2;
    uniform vec2 uRockIsland3;

    varying vec3 vWorldPosition;
    varying vec2 vUv;
    varying vec3 vNormal;

    // Simple pseudo-random noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    // Height function for raked sand ridges & ripples
    float getSandHeight(vec2 pos) {
      // 1. Parallel linear rake lines across the 28m plane (angle ~25 deg)
      vec2 rotPos = vec2(pos.x * 0.906 - pos.y * 0.422, pos.x * 0.422 + pos.y * 0.906);
      float linearRake = sin(rotPos.x * 12.0) * 0.5 + 0.5;
      linearRake = pow(linearRake, 1.3);

      // 2. Concentric ripples around Rock Islands
      float islandInfluence = 0.0;
      float concentricRake = 0.0;

      vec2 islands[4];
      islands[0] = uRockIsland0;
      islands[1] = uRockIsland1;
      islands[2] = uRockIsland2;
      islands[3] = uRockIsland3;

      for (int i = 0; i < 4; i++) {
        float dist = length(pos - islands[i]);
        float mask = smoothstep(4.5, 0.5, dist);
        if (mask > 0.001) {
          float ring = sin(dist * 14.0) * 0.5 + 0.5;
          concentricRake = mix(concentricRake, ring, mask);
          islandInfluence = max(islandInfluence, mask);
        }
      }

      // Blend linear rake and concentric ripples
      float height = mix(linearRake, concentricRake, islandInfluence);

      // 3. Interactive Expanding Ripple Shockwave
      if (uRippleTime > 0.0 && uRippleStrength > 0.0) {
        float rDist = length(pos - uRippleCenter);
        float waveFront = uRippleTime * 7.0; // speed
        float delta = rDist - waveFront;
        float wave = sin(delta * 4.0) * exp(-abs(delta) * 0.4) * exp(-uRippleTime * 0.8);
        height += wave * 0.45 * uRippleStrength;
      }

      // 4. Fine micro-gravel texture noise
      float microGrain = noise(pos * 40.0) * 0.06;
      return height + microGrain;
    }

    void main() {
      vec2 pos = vWorldPosition.xz;
      float h = getSandHeight(pos);

      // Compute normal via finite differences for crisp shadow ridges
      float eps = 0.04;
      float hR = getSandHeight(pos + vec2(eps, 0.0));
      float hU = getSandHeight(pos + vec2(0.0, eps));
      vec3 gradN = normalize(vec3((h - hR) / eps, 1.2, (h - hU) / eps));

      // Directional light from dusk sky/moon
      vec3 lightDir = normalize(vec3(0.5, 0.8, 0.4));
      float diff = max(dot(gradN, lightDir), 0.0);
      float shadowFactor = smoothstep(0.3, 0.8, diff);

      // Specular highlight for wet/glistening quartz sand grains
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 halfVector = normalize(lightDir + viewDir);
      float spec = pow(max(dot(gradN, halfVector), 0.0), 24.0) * 0.25;

      // Color composition
      vec3 finalColor = mix(uShadowColor, uSandColor, shadowFactor * 0.8 + 0.2);
      finalColor = mix(finalColor, uRakeColor, (1.0 - h) * 0.35);
      finalColor += vec3(spec);

      // Subtle radial vignetting toward 28m garden boundary (soft ground falloff)
      float centerDist = length(pos);
      float edgeFade = smoothstep(14.0, 11.5, centerDist);
      finalColor = mix(finalColor * 0.4, finalColor, edgeFade);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

/**
 * Custom Wind Foliage Shader for swaying leaves & trees
 */
export const WindFoliageShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#9c27b0") },
    uWindSpeed: { value: 1.5 },
  },
  vertexShader: /* glsl */ `
    uniform float uTime;
    uniform float uWindSpeed;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec3 pos = position;

      // Wind sway displacement based on height (pos.y)
      float sway = sin(uTime * uWindSpeed + pos.x * 2.0 + pos.z * 1.5) * 0.06 * max(pos.y, 0.0);
      pos.x += sway;
      pos.z += sway * 0.5;

      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vec3 lightDir = normalize(vec3(0.4, 0.9, 0.3));
      float diff = max(dot(vNormal, lightDir), 0.0) * 0.6 + 0.4;
      gl_FragColor = vec4(uColor * diff, 1.0);
    }
  `,
};

/**
 * Atmospheric Dusk & Night Sky Gradient Shader with Procedural Twinkling Stars
 */
export const AtmosphericSkyShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uTopColor: { value: new THREE.Color("#050814") },
    uBottomColor: { value: new THREE.Color("#2a182b") },
  },
  vertexShader: /* glsl */ `
    varying vec3 vWorldPos;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec3 uTopColor;
    uniform vec3 uBottomColor;
    varying vec3 vWorldPos;

    float hash(vec3 p) {
      p  = fract(p * 0.1031);
      p += dot(p, p.yzx + 33.33);
      return fract((p.x + p.y) * p.z);
    }

    void main() {
      vec3 normPos = normalize(vWorldPos);
      float factor = clamp(normPos.y * 0.5 + 0.5, 0.0, 1.0);
      vec3 skyColor = mix(uBottomColor, uTopColor, factor);

      // Starfield dots
      if (normPos.y > 0.05) {
        vec3 starGrid = floor(normPos * 180.0);
        float star = hash(starGrid);
        if (star > 0.985) {
          float twinkle = sin(uTime * 3.0 + star * 60.0) * 0.5 + 0.5;
          skyColor += vec3(0.95, 0.98, 1.0) * (star - 0.985) * 60.0 * twinkle * normPos.y;
        }
      }

      gl_FragColor = vec4(skyColor, 1.0);
    }
  `,
};
