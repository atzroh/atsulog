/**
 * Icosphere wireframe geometry, kept out of the component (no React, no canvas)
 * so the maths reads on its own and stays outside the client bundle boundary.
 */

// --- Types ---

type Vec3 = [number, number, number];
type Face = [number, number, number];
type Edge = [number, number];

export function generateIcosphere(subdivisions: number = 1): {
  vertices: Vec3[];
  edges: Edge[];
} {
  const phi = (1 + Math.sqrt(5)) / 2;
  const vertices: Vec3[] = [
    [-1, phi, 0],
    [1, phi, 0],
    [-1, -phi, 0],
    [1, -phi, 0],
    [0, -1, phi],
    [0, 1, phi],
    [0, -1, -phi],
    [0, 1, -phi],
    [phi, 0, -1],
    [phi, 0, 1],
    [-phi, 0, -1],
    [-phi, 0, 1],
  ].map((v) => normalize(v as Vec3));

  let faces: Face[] = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ];

  const midPointCache = new Map<string, number>();

  const getMidPoint = (v1Idx: number, v2Idx: number) => {
    const key = edgeKey(v1Idx, v2Idx);
    if (midPointCache.has(key)) return midPointCache.get(key)!;

    const v1 = vertices[v1Idx];
    const v2 = vertices[v2Idx];
    const mid: Vec3 = [
      (v1[0] + v2[0]) / 2,
      (v1[1] + v2[1]) / 2,
      (v1[2] + v2[2]) / 2,
    ];

    vertices.push(normalize(mid));
    const idx = vertices.length - 1;
    midPointCache.set(key, idx);
    return idx;
  };

  for (let i = 0; i < subdivisions; i++) {
    const nextFaces: Face[] = [];
    for (const [v1, v2, v3] of faces) {
      const a = getMidPoint(v1, v2);
      const b = getMidPoint(v2, v3);
      const c = getMidPoint(v3, v1);
      nextFaces.push([v1, a, c], [v2, b, a], [v3, c, b], [a, b, c]);
    }
    faces = nextFaces;
  }

  const edgeSet = new Set<string>();
  const edges: Edge[] = [];
  faces.forEach(([v1, v2, v3]) => {
    [
      [v1, v2],
      [v2, v3],
      [v3, v1],
    ].forEach(([a, b]) => {
      const key = edgeKey(a, b);
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([a, b]);
      }
    });
  });

  return { vertices, edges };
}

/** Scales `v` onto the unit sphere. */
function normalize(v: Vec3): Vec3 {
  const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
  return [v[0] / len, v[1] / len, v[2] / len];
}

/** The same key for either direction of an edge. */
function edgeKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

/** A vertex on the canvas: `z` is its depth (about [-1, 1]), `p` its perspective scale. */
export type ProjectedVertex = { x: number; y: number; z: number; p: number };

/** Rotates about Z, then Y, then X, and projects onto the canvas with perspective. */
export function projectVertices(
  vertices: Vec3[],
  rotation: { x: number; y: number; z: number },
  center: { x: number; y: number },
  radius: number,
): ProjectedVertex[] {
  const cX = Math.cos(rotation.x),
    sX = Math.sin(rotation.x);
  const cY = Math.cos(rotation.y),
    sY = Math.sin(rotation.y);
  const cZ = Math.cos(rotation.z),
    sZ = Math.sin(rotation.z);

  return vertices.map(([x, y, z]) => {
    const x1 = x * cZ - y * sZ;
    const y1 = x * sZ + y * cZ;
    const x2 = x1 * cY - z * sY;
    const z2 = x1 * sY + z * cY;
    const y3 = y1 * cX - z2 * sX;
    const z3 = y1 * sX + z2 * cX;

    const p = 1 / (1 - z3 * 0.2);
    return {
      x: center.x + x2 * radius * p,
      y: center.y + y3 * radius * p,
      z: z3,
      p,
    };
  });
}
