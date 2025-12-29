import { motion } from "framer-motion";
import { CheckCircle2, User, FileText, PenTool, MessageSquare, Briefcase, Mail, Phone, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Tell Us About You",
    description: "During our initial consultation, we'll sit down with you to gain a comprehensive understanding of your career aspirations, achievements, and desired roles.",
    icon: User
  },
  {
    title: "Gather Your Info",
    description: "We'll work closely with you to gather all the necessary materials, including your current resume and job descriptions of your target positions.",
    icon: FileText
  },
  {
    title: "Resume Preparation",
    description: "Our skilled writers will craft a compelling, customized resume that showcases your strengths, leveraging industry expertise to capture attention.",
    icon: PenTool
  },
  {
    title: "Your Feedback Matters",
    description: "We'll present the draft for your review. Whether you want to add achievements or adjust formatting, we're here to accommodate your needs.",
    icon: MessageSquare
  },
  {
    title: "Ready for Success",
    description: "Once you're thrilled, we'll deliver your resume in your preferred format, plus guidance on how to effectively utilize it in applications.",
    icon: Briefcase
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-slate-50" id="how-it-works">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">5 Simple Steps to Success</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Our proven process ensures your resume stands out from the crowd.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-slate-200 -z-10" />

          <div className="grid md:grid-cols-5 gap-8">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative bg-white md:bg-transparent p-6 md:p-0 rounded-xl shadow-sm md:shadow-none border md:border-none"
              >
                <div className="w-24 h-24 bg-white rounded-full border-4 border-slate-100 flex items-center justify-center mx-auto mb-6 shadow-sm z-10">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <step.icon className="w-8 h-8" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Step {i + 1}</div>
                  <h3 className="font-bold text-lg mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhyChooseUs() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold font-display">Why Use a Professional Resume Writing Service?</h2>
            <p className="text-lg text-muted-foreground">
              In today's competitive Canadian job market, generic resumes get lost. We combine local market expertise with advanced ATS technology to give you the edge.
            </p>
            
            <div className="space-y-6">
              {[
                { title: "Canadian Market Experts", desc: "We know what Toronto, Vancouver, and Montreal employers are looking for." },
                { title: "Beat the ATS Bots", desc: "Our proprietary scanner ensures your resume gets past the automated filters." },
                { title: "Direct Writer Access", desc: "Chat directly with your writer anytime. No middlemen, no confusion." },
                { title: "Full Career Platform", desc: "Access our Job Tracker, Targeting tools, and Live Preview dashboard." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <h3 className="text-2xl font-bold mb-8 relative z-10">What Sets Us Apart</h3>
            
            <div className="space-y-6 relative z-10">
              <Card className="bg-white/10 border-white/10 text-white backdrop-blur-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-blue-500/20 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <div className="font-bold">Job Tracker Dashboard</div>
                    <div className="text-sm text-white/60">Organize your entire search</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/10 text-white backdrop-blur-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-purple-500/20 flex items-center justify-center">
                    <PenTool className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <div className="font-bold">Targeted Optimization</div>
                    <div className="text-sm text-white/60">Tailored for specific job URLs</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/10 text-white backdrop-blur-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-green-500/20 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-green-300" />
                  </div>
                  <div>
                    <div className="font-bold">Unlimited Revisions</div>
                    <div className="text-sm text-white/60">We work until you're happy</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground" id="contact">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 font-display">Ready to Land Your Dream Job?</h2>
        <div className="flex flex-col md:flex-row justify-center gap-8 mb-12">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
              <Phone className="w-6 h-6" />
            </div>
            <p className="font-bold">Call Us</p>
            <p className="opacity-80">1-800-555-0123</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
              <MessageCircle className="w-6 h-6" />
            </div>
            <p className="font-bold">Live Chat</p>
            <p className="opacity-80">Available 9am - 5pm EST</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
              <Mail className="w-6 h-6" />
            </div>
            <p className="font-bold">Email</p>
            <p className="opacity-80">support@proresumes.ca</p>
          </div>
        </div>
        <Button size="lg" variant="secondary" className="text-primary font-bold">
          Get Started Today
        </Button>
      </div>
    </section>
  );
}
