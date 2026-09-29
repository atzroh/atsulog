/**
 * Icosphere wireframe generation.
 *
 * Pure geometry: no React, no canvas. Kept out of the component so the maths
 * is readable on its own and stays outside the client bundle boundary.
 */

// --- Types ---

export type Vec3 = [number, number, number];
export type Face = [number, number, number];
export type Edge = [number, number];


/**
 * Generates a subdivided Icosphere wireframe.
 */
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
  ].map((v) => {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len, v[1] / len, v[2] / len] as Vec3;
  });

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
    const key = v1Idx < v2Idx ? `${v1Idx}-${v2Idx}` : `${v2Idx}-${v1Idx}`;
    if (midPointCache.has(key)) return midPointCache.get(key)!;

    const v1 = vertices[v1Idx];
    const v2 = vertices[v2Idx];
    const mid: Vec3 = [
      (v1[0] + v2[0]) / 2,
      (v1[1] + v2[1]) / 2,
      (v1[2] + v2[2]) / 2,
    ];
    const len = Math.sqrt(mid[0] ** 2 + mid[1] ** 2 + mid[2] ** 2);
    const normalized: Vec3 = [mid[0] / len, mid[1] / len, mid[2] / len];

    vertices.push(normalized);
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
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([a, b]);
      }
    });
  });

  return { vertices, edges };
}
