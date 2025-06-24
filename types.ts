// types.ts (or at the top of page.tsx)

// Enums from backend (subset used in frontend state)
export enum SectionType {
    C_SECTION = "C-Section",
    Z_SECTION = "Z-Section",
    LIPPED_CHANNEL = "Lipped Channel",
    CUSTOM = "Custom",
  }
  
  export enum SteelGrade {
    S235 = "S235",
    S280 = "S280",
    S350 = "S350",
    CUSTOM = "Custom",
    // Add others if you plan to use them directly in state
  }
  
  export enum LoadType {
    COMPRESSION = "Compression",
    BENDING = "Bending",
    COMBINED = "Combined",
  }
  
  export enum EndCondition {
    PINNED_PINNED = "Pinned-Pinned",
    FIXED_FIXED = "Fixed-Fixed",
    FIXED_PINNED = "Fixed-Pinned",
    // CANTILEVER = "Cantilever" // If needed
  }
  
  export enum LateralRestraint {
    FULLY_RESTRAINED = "Fully Restrained", // Maps to backend's Continuous/Both
    TOP_FLANGE_ONLY = "Top Flange Only",
    UNRESTRAINED = "Unrestrained", // Maps to backend's None
    // Add others if directly mapping
  }
  
  export enum SupportType {
    SIMPLE = "Simple",
    CONTINUOUS = "Continuous",
    CANTILEVER = "Cantilever",
  }
  
  export enum DesignCode {
    BS5950_5 = "BS5950-5",
    AS4600 = "AS4600",
    AISI = "AISI",
    CUSTOM = "Custom",
    // Add others if needed
  }
  
  export enum DeflectionLimit {
    L_250 = "L/250",
    L_300 = "L/300",
    L_360 = "L/360",
    CUSTOM = "Custom",
    // L_500 = "L/500" // If needed
  }
  
  export enum LoadCombination {
    ULS_135G_15Q = "1.35G+1.5Q",
    ULS_12G_16Q = "1.2G+1.6Q",
    CUSTOM = "Custom",
    // Add others if needed
  }
  
  
  // Backend Input Models
  export interface SectionDefinitionBE {
    sectionType: string; // Use string here, map to enum on send
    thickness: number;
    depth: number; // overall_depth
    flangeWidth: number; // flange_width
    lipDepth: number; // lip_depth
    internalRadius?: number;
    auto_radius: boolean;
  }
  
  export interface MaterialPropertiesBE {
    steelGrade: string; // Use string here
    yieldStrength?: number;
    elasticModulus: number;
    partialSafetyFactor: number;
  }
  
  export interface LoadingBE {
    loadType: string; // Use string here
    axialLoad: number;
    bendingMoment: number;
    shearForce: number;
    distributedLoad: number;
    pointLoad: number;
    pointLoadPosition: number;
  }
  
  export interface StructuralParametersBE {
    spanLength: number;
    effectiveLength?: number;
    endConditions: string; // Use string here
    lateralRestraint: string; // Use string here
  }
  
  export interface SupportDetailsBE {
    bearingLength: number;
    endDistance: number;
    supportType: string; // Use string here
  }
  
  export interface DesignCriteriaBE {
    designCode: string; // Use string here
    deflectionLimit: string; // Use string here
    loadCombination: string; // Use string here
  }
  
  export interface AdvancedOptionsBE {
    includeStiffeners: boolean;
    numberOfStiffeners: number;
    stiffenerSpacing: number;
    webCrushingCheck: boolean;
    lateralTorsionalBuckling: boolean;
    detailedDeflectionAnalysis: boolean;
  }
  
  export interface DesignInputBE {
    section: SectionDefinitionBE;
    material: MaterialPropertiesBE;
    loading: LoadingBE;
    structural: StructuralParametersBE;
    support: SupportDetailsBE;
    criteria: DesignCriteriaBE;
    advanced: AdvancedOptionsBE;
    project_info?: Record<string, any>;
  }
  
  // Backend Response Models
  export interface UtilizationCheckBE {
    value: number;
    capacity: number;
    utilization: number;
    status: "PASS" | "FAIL" | "N/A";
  }
  
  export interface DesignResultsBE {
    section_utilization: number; // Percentage
    governing_check: string;
    overall_status: "PASS" | "FAIL";
    compression_check: UtilizationCheckBE;
    bending_check: UtilizationCheckBE;
    shear_check: UtilizationCheckBE;
    deflection_check: UtilizationCheckBE;
    effective_area: number;
    section_modulus: number;
    moment_of_inertia: number;
    effectiveness_factor: number;
    detailed_calculations: string[];
    warnings: string[];
    // summary_data and calculation_steps are more for the AI report endpoint
  }
  
  // For dropdown options
  export interface MetaDataResponse {
    section_types: string[];
    steel_grades: string[];
    load_types: string[];
    end_conditions: string[];
    lateral_restraints: string[];
    support_types: string[];
    design_codes: string[];
    deflection_limits: string[];
    load_combinations: string[];
    steel_properties_info: Record<string, { fy: number; E: number; fu: number }>;
  }