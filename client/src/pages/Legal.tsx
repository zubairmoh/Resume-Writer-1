import { Navbar } from "@/components/layout/Navbar";
import { useLocation } from "wouter";

export function LegalPage() {
  const [location] = useLocation();
  const isPrivacy = location.includes("privacy");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">
          {isPrivacy ? "Privacy Policy" : "Terms and Conditions"}
        </h1>
        <div className="prose prose-slate dark:prose-invert">
          <p>Last updated: December 29, 2024</p>
          <p>
            This is a placeholder for the legal content. In a production environment, 
            this page would contain the full legal text required for compliance.
          </p>
          <h3>1. Introduction</h3>
          <p>
            Welcome to ProResumes.ca. By accessing our website, you agree to be bound by these terms.
          </p>
          <h3>2. {isPrivacy ? "Data Collection" : "Services"}</h3>
          <p>
            {isPrivacy 
              ? "We collect information you provide directly to us, such as when you create an account or upload a resume." 
              : "We provide resume writing and career coaching services as described on our website."}
          </p>
        </div>
      </div>
    </div>
  );
}
