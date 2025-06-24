// --- START OF FILE: src/app/types.ts ---

export interface MaterialInputs {
  [key: string]: number;
  yieldStrength: number;
  ultimateStrength: number;
  elasticModulus: number;
  shearModulus: number;
  materialFactor: number;
}

export interface SectionGeometryInputs {
  [key: string]: number;
  depth: number;
  breadth: number;
  lipWidth: number;
  webThickness: number;
  flangeThickness: number;
  lipHeight1: number;
  lipHeight2: number;
  webStiffenerDepth: number;
  webStiffenerLength: number;
  overallFlangeDimension: number;
}

export interface SectionPropertiesInputs {
  [key: string]: number;
  grossArea: number;
  perimeter: number;
  iXx: number;
  iYy: number;
  zXx: number;
  zYy: number;
  warpingConstant: number;
  torsionConstant: number;
  centroidX: number;
  centroidY: number;
  shearCenterX: number;
  shearCenterY: number;
  ex: number; // Shear Center from Centroid (X-dir)
  radiusGyrationX: number;
  radiusGyrationY: number;
  // REMOVED: radiusGyrationTorsion, betaConstant, effAreaUniformComp
}

// Replace this interface
export interface AppliedLoads {
  [key: string]: number;
  axialForce: number; // P
  momentMx: number;   // Mx
  momentMy: number;   // My
  loadEccentricityX: number; // Xc, Added for beta constant calculation
}

export interface EffectiveLengthInputs {
  [key: string]: number;
  unsupportedLenX: number; // Lx
  unsupportedLenY: number; // Ly
  unsupportedLenTorsion: number; // Lt
  effLenFactorX: number; // kx
  effLenFactorY: number; // ky
  effLenFactorTorsion: number; // kt
}

export interface ServiceabilityInputs {
  [key: string]: number;
  totalUprightHeight: number; // H for sway check
  maxInducedSway: number;     // From external analysis
}

export interface UprightDesignInput {
  material: MaterialInputs;
  geometry: SectionGeometryInputs;
  sectionProperties: SectionPropertiesInputs;
  effectiveLengths: EffectiveLengthInputs;
  appliedLoads: AppliedLoads;
  serviceability: ServiceabilityInputs;
  project_info?: Record<string, unknown>;
}

// --- Interfaces for the results from the backend ---
export interface BucklingResult {
  capacity: number;
}

export interface InteractionResult {
  axialTerm: number;
  momentXTerm: number;
  momentYTerm: number;
  totalRatio: number;
  status: "PASS" | "FAIL" | "";
}

export interface SwayResult {
  permissibleSway: number;
  inducedSway: number;
  status: "PASS" | "FAIL" | "";
}

export interface UprightDesignResults {
  yieldingCapacity: number;
  flexuralBuckling: BucklingResult;
  torsionalBuckling: BucklingResult;
  momentCapacityX: number;
  momentCapacityY: number;
  designAxialCapacity: number; // The governing axial capacity
  interactionCheck: InteractionResult;
  swayCheck: SwayResult;
  finalStatus: "PASS" | "FAIL" | "";
  calculationSteps: string[];
}
// --- END OF FILE: src/app/types.ts ---