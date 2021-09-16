export type Particle = {
  x: number;
  y: number;
  type: number;
  sx: number;
  sy: number;
  bonds: Particle[];
};