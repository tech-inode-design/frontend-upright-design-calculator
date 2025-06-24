"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  RotateCcw,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react"
import {
  UprightDesignInput,
  UprightDesignResults,
  MaterialInputs,
  SectionGeometryInputs,
  SectionPropertiesInputs,
  EffectiveLengthInputs,
  AppliedLoads,
  ServiceabilityInputs
} from "@/app/types" // Adjust the import path as necessary

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const initialInputs: UprightDesignInput = {
  material: { yieldStrength: 350, ultimateStrength: 400, elasticModulus: 210000, shearModulus: 80769, materialFactor: 1.1 },
  geometry: { 
    depth: 120, 
    breadth: 60, 
    lipWidth: 27.5, 
    webThickness: 3.0, 
    flangeThickness: 3.0,
    lipHeight1: 27,
    lipHeight2: 18,
    webStiffenerDepth: 10,
    webStiffenerLength: 20,
    overallFlangeDimension: 87.5
  },
  sectionProperties: {
    grossArea: 1083.0,
    perimeter: 368.4,
    iXx: 2104581.6,
    iYy: 989904.8,
    zXx: 35076.4,
    zYy: 28050.6,
    warpingConstant: 5567475868.2,
    torsionConstant: 3315.3,
    centroidX: 35.3,
    centroidY: 60.0,
    shearCenterX: -46.2,
    shearCenterY: 58.5,
    ex: -80.1,
    radiusGyrationX: 44.1,
    radiusGyrationY: 30.2,
  },
  effectiveLengths: { unsupportedLenX: 2800, unsupportedLenY: 1200, unsupportedLenTorsion: 1200, effLenFactorX: 1.0, effLenFactorY: 1.0, effLenFactorTorsion: 1.0 },
  appliedLoads: { 
    axialForce: 144.24, 
    momentMx: 0.043, 
    momentMy: 0.963,
    loadEccentricityX: 0,
  },
  serviceability: { totalUprightHeight: 9200, maxInducedSway: 8.296 },
  project_info: { project_name: "IKEA PUNE B200", client: "IKEA" }
};

const initialResults: UprightDesignResults = {
  yieldingCapacity: 0,
  flexuralBuckling: { capacity: 0 },
  torsionalBuckling: { capacity: 0 },
  momentCapacityX: 0, momentCapacityY: 0,
  designAxialCapacity: 0,
  interactionCheck: { axialTerm: 0, momentXTerm: 0, momentYTerm: 0, totalRatio: 0, status: "" },
  swayCheck: { permissibleSway: 0, inducedSway: 0, status: "" },
  finalStatus: "", calculationSteps: [],
};

type InputSection = keyof Omit<UprightDesignInput, 'project_info'>;

export default function UprightDesignTool() {
  const [inputs, setInputs] = useState<UprightDesignInput>(initialInputs);
  const [results, setResults] = useState<UprightDesignResults>(initialResults);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportProgress, setReportProgress] = useState(0);
  const [reportStep, setReportStep] = useState('');

  const handleInputChange = (section: InputSection, field: string, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    if (!isNaN(numValue)) {
      setInputs(prev => ({ ...prev, [section]: { ...prev[section], [field]: numValue } }));
    }
  };

  const handleCalculate = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/calculate-upright`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(inputs),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Calculation failed: ${response.statusText}`);
      }
      const data: UprightDesignResults = await response.json();
      setResults(data);
    } catch (err: any) {
      console.error(err);
      setResults(initialResults);
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [inputs]);
  
  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  const loadExample = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/load-upright-example`);
      if (!response.ok) throw new Error("Failed to load example");
      const data: UprightDesignInput = await response.json();
      setInputs(data);
    } catch (err:any) {
      console.error(err);
      alert("Failed to load example data.");
    } finally {
        // The calculate useEffect will trigger automatically when inputs change
    }
  };
  
  const handleExportReport = async () => {
    setShowReportDialog(true);
    setReportProgress(10);
    setReportStep('Sending data for report generation...');
    setIsLoading(true);
    try {
      setReportProgress(30); setReportStep('Generating report content...');
      const response = await fetch(`${API_BASE_URL}/api/generate-report`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inputs),
      });
      setReportProgress(70); setReportStep('Finalizing PDF...');
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Report generation failed");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "Upright_Design_Report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setReportProgress(100); setReportStep('Done! Downloading...');
      setTimeout(() => setShowReportDialog(false), 1500);
    } catch (err: any) {
      console.error("Report generation error:", err);
      alert(`Failed to generate report: ${err.message}`);
      setShowReportDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "PASS") return "text-green-600 bg-green-100 border-green-300";
    if (status === "FAIL") return "text-red-600 bg-red-100 border-red-300";
    return "text-gray-600 bg-gray-100 border-gray-300";
  };
  
  const renderResultField = (label: string, value: number, unit: string, precision: number = 3) => (
    <div className="flex justify-between items-center py-1.5 px-2 odd:bg-slate-50 rounded-md">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="font-mono font-semibold text-sm">{value.toFixed(precision)} {unit}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Upright Design Calculator (EN 15512)</h1>
          <p className="text-gray-600">Interaction and serviceability checks for upright columns.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* INPUTS COLUMN */}
          <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>1. Input Parameters</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    {/* Material */}
                    <InputSection 
                      title="Material Properties" 
                      data={inputs.material} 
                      section="material" 
                      onChange={handleInputChange} 
                      units={{
                        yieldStrength: "N/mm²", 
                        ultimateStrength: "N/mm²", 
                        elasticModulus: "N/mm²", 
                        shearModulus: "N/mm²"
                      }} 
                    />
                    <Separator/>
                    
                    {/* Section Geometry */}
                    <InputSection 
                      title="Section Geometry" 
                      data={inputs.geometry} 
                      section="geometry" 
                      onChange={handleInputChange} 
                      units={{ 
                        depth: 'mm', 
                        breadth: 'mm', 
                        lipWidth: 'mm', 
                        webThickness: 'mm', 
                        flangeThickness: 'mm',
                        lipHeight1: 'mm',
                        lipHeight2: 'mm',
                        webStiffenerDepth: 'mm',
                        webStiffenerLength: 'mm',
                        overallFlangeDimension: 'mm'
                      }} 
                    />
                    <Separator/>
                    
                    {/* Section Properties */}
                    <InputSection 
                      title="Section Properties" 
                      data={inputs.sectionProperties} 
                      section="sectionProperties" 
                      onChange={handleInputChange} 
                      units={{ 
                        grossArea: 'mm²', 
                        perimeter: 'mm', 
                        iXx: 'mm⁴', 
                        iYy: 'mm⁴', 
                        zXx: 'mm³', 
                        zYy: 'mm³', 
                        warpingConstant: 'mm⁶', 
                        torsionConstant: 'mm⁴', 
                        centroidX: 'mm', 
                        centroidY: 'mm', 
                        shearCenterX: 'mm', 
                        shearCenterY: 'mm', 
                        ex: 'mm',
                        radiusGyrationX: 'mm', 
                        radiusGyrationY: 'mm', 
                        // The old fields and their units are now gone
                      }} 
                    />
                    <Separator/>
                    
                    {/* Effective Lengths */}
                    <InputSection 
                      title="Effective Lengths" 
                      data={inputs.effectiveLengths} 
                      section="effectiveLengths" 
                      onChange={handleInputChange} 
                      units={{ 
                        unsupportedLenX: 'mm', 
                        unsupportedLenY: 'mm', 
                        unsupportedLenTorsion: 'mm' 
                      }} 
                    />
                    <Separator/>
                    
                    {/* Applied Loads */}
                    <InputSection 
                      title="Applied Factored Loads & Moments" 
                      data={inputs.appliedLoads} 
                      section="appliedLoads" 
                      onChange={handleInputChange} 
                      units={{ 
                        axialForce: 'kN', 
                        momentMx: 'kNm', 
                        momentMy: 'kNm',
                        loadEccentricityX: 'mm' // Add unit for the new field
                      }} 
                    />
                    <Separator/>
                    
                    {/* Serviceability */}
                    <InputSection 
                      title="Serviceability (Sway)" 
                      data={inputs.serviceability} 
                      section="serviceability" 
                      onChange={handleInputChange} 
                      units={{ 
                        totalUprightHeight: 'mm', 
                        maxInducedSway: 'mm' 
                      }} 
                    />
                </CardContent>
            </Card>
            
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCalculate} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                {isLoading ? "Calculating..." : "Re-Calculate"}
              </Button>
              <Button variant="outline" onClick={loadExample} disabled={isLoading}>
                <FileText className="mr-2 h-4 w-4" /> Load Example
              </Button>
              <Button variant="secondary" onClick={handleExportReport} disabled={isLoading || !results.finalStatus}>
                <Download className="mr-2 h-4 w-4" /> Generate PDF Report
              </Button>
            </div>
          </div>

          {/* RESULTS COLUMN */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>2. Design Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg" style={{backgroundColor: results.finalStatus === 'PASS' ? '#f0fff4' : results.finalStatus === 'FAIL' ? '#fff5f5' : '#f8f8f8'}}>
                    <span className="text-lg font-bold">Overall Status:</span>
                    <Badge className={`${getStatusColor(results.finalStatus)} text-lg px-4 py-1.5`}>
                        {results.finalStatus || "N/A"}
                    </Badge>
                </div>

                {/* Key Calculation Results Card (styled like Interaction Check) */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Key Calculation Results</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center py-1.5 px-2 odd:bg-slate-50 rounded-md">
                      <span className="text-sm text-gray-600">Yielding Capacity (Nc,Rd):</span>
                      <span className="font-mono font-semibold text-sm">{results.yieldingCapacity.toFixed(3)} kN</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-2 odd:bg-slate-50 rounded-md">
                      <span className="text-sm text-gray-600">Flexural Buckling Capacity:</span>
                      <span className="font-mono font-semibold text-sm">{results.flexuralBuckling.capacity.toFixed(3)} kN</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-2 odd:bg-slate-50 rounded-md">
                      <span className="text-sm text-gray-600">Flexural-Torsional Capacity:</span>
                      <span className="font-mono font-semibold text-sm">{results.torsionalBuckling.capacity.toFixed(3)} kN</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-2 odd:bg-slate-50 rounded-md">
                      <span className="text-sm text-gray-600">Design Axial Capacity:</span>
                      <span className="font-mono font-semibold text-sm">{results.designAxialCapacity.toFixed(3)} kN</span>
                    </div>
                    <Separator/>
                    <div className="flex justify-between items-center py-1.5 px-2 odd:bg-slate-50 rounded-md">
                      <span className="text-sm text-gray-600">Total Ratio:</span>
                      <span className="font-mono font-semibold text-sm">{results.interactionCheck.totalRatio.toFixed(3)} {'\u2264'} 1.0</span>
                    </div>
                  </CardContent>
                </Card>
                
                {/* <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base">Interaction Check (ULS)</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {renderResultField("P / P_cap", results.interactionCheck.axialTerm, "")}
                        {renderResultField("Mx / Mx_cap", results.interactionCheck.momentXTerm, "")}
                        {renderResultField("My / My_cap", results.interactionCheck.momentYTerm, "")}
                        <Separator/>
                        {renderResultField("Total Ratio", results.interactionCheck.totalRatio, ` <= 1.0`)}
                    </CardContent>
                </Card> */}
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base">Sway Check (SLS)</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {renderResultField("Induced Sway", results.swayCheck.inducedSway, "mm")}
                        {renderResultField("Permissible Sway (H/200)", results.swayCheck.permissibleSway, "mm")}
                    </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>3. Capacity Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {renderResultField("Yielding Capacity (Nc,Rd)", results.yieldingCapacity, "kN")}
                    {renderResultField("Flexural Buckling Capacity", results.flexuralBuckling.capacity, "kN")}
                    {renderResultField("Flexural-Torsional Capacity", results.torsionalBuckling.capacity, "kN")}
                    <Separator/>
                    {renderResultField("Design Axial Capacity", results.designAxialCapacity, "kN")}
                    <Separator/>
                    {renderResultField("Moment Capacity (Mx,Rd)", results.momentCapacityX, "kNm")}
                    {renderResultField("Moment Capacity (My,Rd)", results.momentCapacityY, "kNm")}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Calculation Trace</CardTitle></CardHeader>
                <CardContent>
                    <pre className="text-xs bg-gray-800 text-white p-4 rounded-md overflow-y-auto font-mono">
                        {isLoading ? "Calculating..." : results.calculationSteps.join('\n')}
                    </pre>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
       <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generating Report</DialogTitle>
            <DialogDescription className="pt-4">
              <div className="flex flex-col items-center gap-4 mt-2">
                <span className="text-base font-medium animate-pulse">{reportStep}</span>
                <div className="w-full bg-gray-200 rounded-full h-3"><div className="h-3 rounded-full bg-blue-500 transition-all" style={{ width: `${reportProgress}%` }}/></div>
                <span className="text-xs text-gray-500">This may take a few seconds...</span>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component for structured input sections
const InputSection = ({ title, data, section, onChange, units }: { title: string, data: any, section: InputSection, onChange: Function, units?: {[key: string]: string} }) => (
    <div className="space-y-3">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1.5">
                    <Label htmlFor={`${section}-${key}`} className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()} {units && units[key] ? `[${units[key]}]` : ''}
                    </Label>
                    <Input id={`${section}-${key}`} type="number" value={String(value)} onChange={e => onChange(section, key, e.target.value)} />
                </div>
            ))}
        </div>
    </div>
);