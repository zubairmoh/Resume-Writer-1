import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, Share2, Printer } from "lucide-react";

export function ResumePreview() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 px-1">
        <div>
          <h3 className="font-semibold text-lg">Live Document Preview</h3>
          <p className="text-xs text-muted-foreground">Last updated: Just now by Sarah Jenkins</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
          <Button size="sm" variant="outline"><Printer className="w-4 h-4 mr-2" /> Print</Button>
          <Button size="sm"><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
        </div>
      </div>

      <Card className="flex-1 bg-slate-100 overflow-hidden border shadow-inner flex items-center justify-center p-8">
        <ScrollArea className="h-full w-full max-w-[800px] bg-white shadow-xl rounded-sm">
          <div className="w-full min-h-[1000px] p-12 text-slate-800">
            {/* Resume Content Mockup */}
            <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">JOHN DOE</h1>
                <p className="text-lg text-slate-600 font-medium tracking-wide">SENIOR SOFTWARE ENGINEER</p>
              </div>
              <div className="text-right text-sm text-slate-500 space-y-1">
                <p>Toronto, ON • (647) 555-0123</p>
                <p>john.doe@email.com • linkedin.com/in/johndoe</p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
              {/* Left Column */}
              <div className="col-span-8 space-y-8">
                <section>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Professional Summary</h3>
                  <p className="text-sm leading-relaxed text-slate-700">
                    Results-oriented Senior Software Engineer with 7+ years of experience in full-stack development. 
                    Proven track record of leading high-performance teams and delivering scalable solutions in FinTech and E-commerce sectors. 
                    Expert in React, Node.js, and cloud architecture (AWS). Committed to code quality, agile methodologies, and mentorship.
                  </p>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Experience</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <h4 className="font-bold text-slate-800">Senior Full Stack Developer</h4>
                        <span className="text-sm text-slate-500 font-medium">2021 – Present</span>
                      </div>
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-semibold text-slate-600">TechCorp Solutions</span>
                        <span className="text-sm text-slate-500 italic">Toronto, ON</span>
                      </div>
                      <ul className="list-disc list-outside ml-4 space-y-2 text-sm text-slate-700">
                        <li>Architected and led the development of a microservices-based payment processing platform handling $5M+ daily transactions.</li>
                        <li>Reduced system latency by 40% through code optimization and implementation of Redis caching strategies.</li>
                        <li>Mentored a team of 4 junior developers, conducting code reviews and implementing CI/CD pipelines that increased deployment frequency by 3x.</li>
                      </ul>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <h4 className="font-bold text-slate-800">Software Developer</h4>
                        <span className="text-sm text-slate-500 font-medium">2018 – 2021</span>
                      </div>
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-semibold text-slate-600">Innovate Inc.</span>
                        <span className="text-sm text-slate-500 italic">Vancouver, BC</span>
                      </div>
                      <ul className="list-disc list-outside ml-4 space-y-2 text-sm text-slate-700">
                        <li>Developed responsive frontend components using React and Redux, improving user engagement metrics by 25%.</li>
                        <li>Collaborated with UX designers to implement accessible (WCAG 2.1) interfaces for government clients.</li>
                        <li>Integrated third-party APIs (Stripe, Twilio) to enhance platform functionality.</li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div className="col-span-4 space-y-8">
                <section>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Core Competencies</h3>
                  <div className="flex flex-wrap gap-2">
                    {["React.js", "TypeScript", "Node.js", "AWS", "Docker", "GraphQL", "PostgreSQL", "CI/CD", "Agile/Scrum"].map(skill => (
                      <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md font-normal">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Education</h3>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">B.Sc. Computer Science</h4>
                    <p className="text-sm text-slate-600">University of Waterloo</p>
                    <p className="text-xs text-slate-500 mt-1">2014 – 2018</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Certifications</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>AWS Certified Solutions Architect</li>
                    <li>Meta Front-End Developer Certificate</li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
