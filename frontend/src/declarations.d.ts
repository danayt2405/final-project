// declarations.d.ts

// Standard image types
declare module "*.png" {
  const value: string;
  export default value;
}
declare module "*.jpg" {
  const value: string;
  export default value;
}
declare module "*.jpeg" {
  const value: string;
  export default value;
}
declare module "*.svg" {
  const value: string;
  export default value;
}

// Figma asset imports
declare module "figma:asset/*" {
  const value: string;
  export default value;
}
