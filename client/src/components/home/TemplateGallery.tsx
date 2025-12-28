import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const templates = [
  {
    id: "toronto",
    name: "The Toronto",
    style: "Modern & Clean",
    color: "bg-blue-500",
    preview: (
      <div className="w-full h-full bg-white p-4 text-[6px] space-y-2 overflow-hidden relative shadow-sm">
        <div className="flex justify-between items-center border-b pb-2">
          <div className="font-bold text-lg text-blue-900">ALEX SMITH</div>
          <div className="text-right text-gray-500">Toronto, ON</div>
        </div>
        <div className="grid grid-cols-3 gap-2 h-full">
          <div className="col-span-1 bg-slate-50 p-2 space-y-2">
            <div className="font-bold text-blue-900">SKILLS</div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-slate-200 rounded"></div>
              <div className="w-3/4 h-1 bg-slate-200 rounded"></div>
              <div className="w-5/6 h-1 bg-slate-200 rounded"></div>
            </div>
            <div className="font-bold text-blue-900 mt-2">EDUCATION</div>
            <div className="w-full h-1 bg-slate-200 rounded"></div>
            <div className="w-full h-1 bg-slate-200 rounded"></div>
          </div>
          <div className="col-span-2 space-y-2">
            <div className="font-bold text-blue-900">EXPERIENCE</div>
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <div className="w-1/3 h-1.5 bg-slate-800 rounded"></div>
                  <div className="w-1/4 h-1 bg-slate-300 rounded"></div>
                </div>
                <div className="w-full h-1 bg-slate-200 rounded"></div>
                <div className="w-full h-1 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    id: "vancouver",
    name: "The Vancouver",
    style: "Creative & Bold",
    color: "bg-emerald-500",
    preview: (
      <div className="w-full h-full bg-white flex text-[6px] overflow-hidden shadow-sm">
        <div className="w-1/3 bg-slate-900 text-white p-4 space-y-4">
          <div className="w-12 h-12 bg-white/10 rounded-full mx-auto"></div>
          <div className="space-y-2 text-center">
            <div className="font-bold text-xs">SARAH J.</div>
            <div className="text-white/60">Designer</div>
          </div>
          <div className="space-y-1">
             <div className="w-full h-0.5 bg-white/20"></div>
             <div className="w-full h-0.5 bg-white/20"></div>
          </div>
        </div>
        <div className="w-2/3 p-4 space-y-3">
          <div className="font-bold text-lg text-slate-900 mb-2">EXPERIENCE</div>
          {[1, 2].map(i => (
             <div key={i} className="space-y-1">
               <div className="w-1/2 h-2 bg-slate-800 rounded"></div>
               <div className="w-full h-1 bg-slate-200 rounded"></div>
               <div className="w-5/6 h-1 bg-slate-200 rounded"></div>
               <div className="w-full h-1 bg-slate-200 rounded"></div>
             </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: "montreal",
    name: "The Montreal",
    style: "Executive & Serif",
    color: "bg-purple-500",
    preview: (
      <div className="w-full h-full bg-white p-6 text-[6px] space-y-3 overflow-hidden shadow-sm text-center">
        <div className="space-y-1 mb-4">
          <div className="font-serif text-xl tracking-widest text-slate-900">JAMES WILSON</div>
          <div className="text-slate-500 uppercase tracking-widest text-[4px]">Senior Director</div>
          <div className="w-10 h-0.5 bg-slate-900 mx-auto mt-2"></div>
        </div>
        
        <div className="text-left space-y-3">
           <div className="flex justify-center gap-4 mb-2">
             <div className="w-1/4 h-1 bg-slate-100 rounded"></div>
             <div className="w-1/4 h-1 bg-slate-100 rounded"></div>
           </div>
           
           {[1, 2, 3].map(i => (
             <div key={i} className="space-y-1">
               <div className="flex justify-between items-end border-b border-slate-100 pb-1 mb-1">
                 <div className="w-1/3 h-1.5 bg-slate-800 font-serif"></div>
                 <div className="w-1/6 h-1 bg-slate-400"></div>
               </div>
               <div className="w-full h-1 bg-slate-200"></div>
               <div className="w-11/12 h-1 bg-slate-200"></div>
             </div>
           ))}
        </div>
      </div>
    )
  }
];

export function TemplateGallery() {
  const [selected, setSelected] = useState(templates[0].id);

  return (
    <section className="py-24 bg-slate-50">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">Proven Canadian Templates</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose from our library of ATS-optimized designs. Our writers will tailor the content to fit your chosen aesthetic perfectly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {templates.map((template) => (
            <motion.div 
              key={template.id}
              whileHover={{ y: -8 }}
              className="group relative"
              onClick={() => setSelected(template.id)}
            >
              <div className={`absolute -inset-2 bg-gradient-to-r ${
                selected === template.id ? 'from-primary/50 to-purple-500/50' : 'from-transparent to-transparent'
              } rounded-xl blur-lg opacity-75 transition-all duration-500 group-hover:opacity-100`} />
              
              <Card className={`relative h-[400px] overflow-hidden border-2 transition-all cursor-pointer ${
                selected === template.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-slate-200'
              }`}>
                <div className="h-full bg-slate-100 p-4 flex items-center justify-center">
                  <div className="w-[85%] h-[95%] shadow-2xl transition-transform duration-500 group-hover:scale-105">
                    {template.preview}
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4 border-t translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{template.name}</h3>
                      <p className="text-xs text-muted-foreground">{template.style}</p>
                    </div>
                    <Button size="sm" variant={selected === template.id ? "default" : "secondary"}>
                      {selected === template.id ? <Check className="w-4 h-4 mr-1" /> : null}
                      {selected === template.id ? "Selected" : "Use Template"}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
