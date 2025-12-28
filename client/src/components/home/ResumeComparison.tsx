import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { MoveHorizontal } from "lucide-react";

export function ResumeComparison() {
  const [sliderValue, setSliderValue] = useState(50);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">See the Difference</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Drag the slider to see how we transform cluttered, generic resumes into polished, ATS-friendly documents that get interviews.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl shadow-2xl border bg-slate-100">
            {/* "Before" Image (Left Side) */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-white text-slate-300">
               {/* Placeholder for Before Resume Image */}
               <div className="w-full h-full p-8 text-xs font-mono opacity-50 space-y-2 select-none">
                 <div className="w-1/3 h-4 bg-slate-200 mb-8" />
                 <div className="w-full h-2 bg-slate-200" />
                 <div className="w-full h-2 bg-slate-200" />
                 <div className="w-3/4 h-2 bg-slate-200" />
                 <div className="w-1/2 h-2 bg-slate-200 mb-6" />
                 
                 <div className="w-1/4 h-4 bg-slate-200 mb-4" />
                 {[...Array(10)].map((_, i) => (
                   <div key={i} className="w-full h-2 bg-slate-200" />
                 ))}
                 
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-bold border border-red-200 transform -rotate-12 shadow-lg">
                     BEFORE: Cluttered & Generic
                   </div>
                 </div>
               </div>
            </div>

            {/* "After" Image (Right Side - Masked) */}
            <div 
              className="absolute inset-0 bg-white border-l border-white/20"
              style={{ clipPath: `inset(0 0 0 ${sliderValue}%)` }}
            >
               {/* Placeholder for After Resume Image */}
               <div className="w-full h-full p-8 flex flex-col items-center bg-slate-50 select-none">
                 <div className="w-full max-w-3xl bg-white shadow-lg h-full p-8 space-y-4">
                    <div className="flex justify-between border-b pb-6 mb-6">
                      <div className="space-y-2">
                        <div className="w-48 h-6 bg-primary/20 rounded" />
                        <div className="w-32 h-4 bg-slate-100 rounded" />
                      </div>
                      <div className="w-16 h-16 bg-primary/10 rounded-full" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-8 h-full">
                      <div className="col-span-2 space-y-4">
                        <div className="w-32 h-5 bg-slate-200 rounded" />
                        <div className="space-y-2">
                          <div className="w-full h-3 bg-slate-100 rounded" />
                          <div className="w-full h-3 bg-slate-100 rounded" />
                          <div className="w-5/6 h-3 bg-slate-100 rounded" />
                        </div>
                        <div className="w-32 h-5 bg-slate-200 rounded mt-6" />
                        <div className="space-y-2">
                          <div className="w-full h-3 bg-slate-100 rounded" />
                          <div className="w-full h-3 bg-slate-100 rounded" />
                        </div>
                      </div>
                      <div className="col-span-1 bg-slate-50 p-4 rounded h-3/4">
                        <div className="w-20 h-4 bg-slate-200 rounded mb-4" />
                        <div className="w-full h-2 bg-slate-100 rounded mb-2" />
                        <div className="w-full h-2 bg-slate-100 rounded mb-2" />
                        <div className="w-3/4 h-2 bg-slate-100 rounded mb-2" />
                      </div>
                    </div>
                 </div>
                 
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold border border-green-200 transform rotate-6 shadow-lg" style={{ marginLeft: `${sliderValue}%` }}>
                     AFTER: Polished & Impactful
                   </div>
                 </div>
               </div>
            </div>

            {/* Slider Control */}
            <div 
              className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center group"
              style={{ left: `${sliderValue}%` }}
            >
              <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-primary group-hover:scale-110 transition-transform">
                <MoveHorizontal className="w-5 h-5 text-primary" />
              </div>
            </div>
            
            {/* Invisible Range Input for Interaction */}
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderValue} 
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
