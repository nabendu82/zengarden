import * as THREE from "three";

/**
 * Simplex/Perlin-like 3D noise function for vertex displacement.
 */
function noise3D(x: number, y: number, z: number): number {
  const p1 = Math.sin(x * 1.7 + y * 2.3 + z * 1.1);
  const p2 = Math.cos(x * 3.1 - y * 1.4 + z * 2.7);
  const p3 = Math.sin(x * 0.8 + z * 3.9);
  return (p1 + p2 + p3) / 3.0;
}

/**
 * Creates an organic Zen boulder geometry by displacing vertices of a polyhedra.
 */
export function createDisplacedBoulderGeometry(
  radius: number = 1.5,
  detail: number = 3,
  roughness: number = 0.45,
  seed: number = 1.0
): THREE.BufferGeometry {
  const geo = new THREE.DodecahedronGeometry(radius, detail);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = v.clone().normalize();

    // Multi-octave noise displacement
    const noiseVal =
      noise3D(v.x * 0.8 + seed, v.y * 0.8 + seed, v.z * 0.8 + seed) * roughness +
      noise3D(v.x * 2.2, v.y * 2.2, v.z * 2.2) * (roughness * 0.35);

    // Flatten bottom slightly so it grounds nicely on the sand
    let disp = noiseVal;
    if (v.y < 0) {
      disp -= Math.abs(v.y) * 0.25;
    }

    v.addScaledVector(n, disp);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a procedural Japanese Stone Lantern (Yukimi-doro).
 */
export function createStoneLanternGroup(): THREE.Group {
  const group = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({
    color: "#7a756c",
    roughness: 0.85,
    metalness: 0.1,
  });

  const paperMat = new THREE.MeshBasicMaterial({
    color: "#ffc87c",
  });

  // Base stone (Jiban)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.25, 6), stoneMat);
  base.position.y = 0.125;
  group.add(base);

  // Pedestal Legs (Sao)
  const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.5, 6), stoneMat);
  legs.position.y = 0.5;
  group.add(legs);

  // Middle platform (Chubu)
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.4, 0.2, 6), stoneMat);
  platform.position.y = 0.85;
  group.add(platform);

  // Light Box (Hibukuro)
  const lightBoxFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.55, 6, 1, true), stoneMat);
  lightBoxFrame.position.y = 1.225;
  group.add(lightBoxFrame);

  // Inner glowing paper windows
  const paperWindow = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.5, 6), paperMat);
  paperWindow.position.y = 1.225;
  group.add(paperWindow);

  // Roof (Kasa)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.45, 6), stoneMat);
  roof.position.y = 1.7;
  group.add(roof);

  // Top Jewel (Hoju)
  const jewel = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 1), stoneMat);
  jewel.position.y = 2.05;
  group.add(jewel);

  return group;
}

/**
 * Creates a procedural Japanese Temple Gong / Bronze Bell with Frame.
 */
export function createTempleGongGroup(): THREE.Group {
  const group = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({
    color: "#3a2318",
    roughness: 0.7,
  });

  const bronzeMat = new THREE.MeshStandardMaterial({
    color: "#8c6838",
    roughness: 0.35,
    metalness: 0.8,
  });

  // Vertical Posts
  const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.6, 8), woodMat);
  postL.position.set(-1.1, 1.3, 0);
  const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.6, 8), woodMat);
  postR.position.set(1.1, 1.3, 0);
  group.add(postL, postR);

  // Top Beam (Torii style)
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 0.22), woodMat);
  beam.position.set(0, 2.5, 0);
  group.add(beam);

  // Gong Disc
  const gong = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 24), bronzeMat);
  gong.rotation.x = Math.PI / 2;
  gong.position.set(0, 1.55, 0);
  gong.name = "temple_gong";
  group.add(gong);

  // Center Gong Boss (Embossed dome)
  const boss = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), bronzeMat);
  boss.position.set(0, 1.55, 0.04);
  boss.rotation.x = -Math.PI / 2;
  group.add(boss);

  // Wooden Striker Hanging
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), woodMat);
  rope.position.set(0.6, 1.9, 0);
  const mallet = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 12), woodMat);
  mallet.rotation.z = Math.PI / 2;
  mallet.position.set(0.6, 1.6, 0);
  group.add(rope, mallet);

  return group;
}

/**
 * Creates procedural Stepping Stones (Tobi-ishi).
 */
export function createSteppingStoneGeometry(): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(0.4, 0.45, 0.12, 10);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // Slight squishing and noise
    v.x *= 1.1 + Math.sin(v.z * 5.0) * 0.1;
    v.z *= 0.95 + Math.cos(v.x * 4.0) * 0.1;
    if (v.y > 0) v.y -= Math.random() * 0.02;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}
