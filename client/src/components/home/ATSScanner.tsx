import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, Loader2, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";
import { useNavigate } from "react-router-dom";

// Configure worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function ATSScanner() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile?.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }
    setFile(selectedFile);
    startScan(selectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const startScan = async (file: File) => {
    setScanning(true);
    setScore(null);
    
    try {
      // Mock scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simple mock logic: Score based on file size/name just to vary it
      // In real app: Parse text with pdfjsLib and analyze
      const randomScore = Math.floor(Math.random() * (85 - 40) + 40); 
      setScore(randomScore);
      
      toast({
        title: "Scan Complete",
        description: "Your resume has been analyzed.",
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Could not parse the PDF.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setUnlocked(true);
    toast({
      title: "Result Unlocked",
      description: "Redirecting to your full report...",
    });
    // In a real app, we'd save the lead here
    
    // Redirect to signup to "save" the result
    setTimeout(() => {
        navigate("/signup");
    }, 1500);
  };

  return (
    <section className="py-24 bg-secondary/30" id="ats-scanner">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Does Your Resume Pass the 6-Second Test?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Recruiters and ATS bots scan your resume in seconds. Upload yours to see how you score against the competition.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="p-8 shadow-xl bg-card border-primary/10">
            {!file ? (
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Drag & Drop your Resume (PDF)</h3>
                <p className="text-sm text-muted-foreground">or click to browse files</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                  <div className="w-12 h-12 bg-white rounded flex items-center justify-center border">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setFile(null); setScore(null); setUnlocked(false); }}>
                    Change
                  </Button>
                </div>

                {scanning ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                    <p className="text-lg font-medium animate-pulse">Analyzing keywords...</p>
                  </div>
                ) : score !== null && (
                  <div className="relative">
                    {/* Blurred Result Overlay */}
                    <AnimatePresence>
                      {!unlocked && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-10 backdrop-blur-md bg-white/50 flex flex-col items-center justify-center rounded-lg border border-white/20"
                        >
                          <Lock className="w-10 h-10 text-primary mb-4" />
                          <h3 className="text-2xl font-bold mb-2">Unlock Your ATS Score</h3>
                          <p className="text-muted-foreground mb-6 text-center max-w-xs">
                            Enter your email to reveal your detailed score and improvement tips.
                          </p>
                          <form onSubmit={handleUnlock} className="flex gap-2 w-full max-w-sm">
                            <Input 
                              type="email" 
                              placeholder="you@example.com" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="bg-white"
                            />
                            <Button type="submit">Reveal</Button>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Actual Content (Blurred or Clear) */}
                    <div className={!unlocked ? "filter blur-sm select-none" : ""}>
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-primary/20 mb-4 relative">
                          <span className="text-4xl font-bold text-primary">{score}/100</span>
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                              cx="60"
                              cy="60"
                              r="56"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="8"
                              strokeDasharray="351"
                              strokeDashoffset={351 - (351 * score) / 100}
                              className="text-primary"
                            />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold">
                          {score < 50 ? "Needs Work" : score < 75 ? "Good Start" : "Excellent"}
                        </h3>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        {[
                          { label: "Keywords", val: 40 },
                          { label: "Formatting", val: 80 },
                          { label: "Impact", val: 30 }
                        ].map((item, i) => (
                          <div key={i} className="bg-secondary p-4 rounded-lg">
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">{item.label}</span>
                              <span className="text-muted-foreground">{unlocked ? item.val : "??"}%</span>
                            </div>
                            <Progress value={unlocked ? item.val : 30} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
