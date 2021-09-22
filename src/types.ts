export type Particle = {
  x: number;
  y: number;
  lastX?: number;
  lastY?: number;
  type: number;
  sx: number;
  sy: number;
  bonds: Particle[];
};