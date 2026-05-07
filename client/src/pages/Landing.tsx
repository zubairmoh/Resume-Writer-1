import React from 'react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white">
      {/* Hero */}
      <section className="pt-24 pb-16 px-6 text-center">
        <h1 className="text-6xl font-bold tracking-tight mb-6">
          AI Resumes That <span className="text-indigo-400">Get You Hired</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          Professional resumes in minutes. ATS optimized. Results guaranteed.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/signup" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-xl text-lg font-semibold">Get Started Free</a>
          <a href="#demo" className="border border-white/30 hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold">Watch Demo</a>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="bg-white/5 py-4">
        <div className="max-w-5xl mx-auto flex justify-center gap-12 text-sm opacity-75">
          <div>✓ Trusted by 10k+ professionals</div>
          <div>✓ 98% Interview Rate Increase</div>
        </div>
      </div>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Feature cards */}
          <div className="bg-white/5 p-8 rounded-3xl">AI Writer</div>
          <div className="bg-white/5 p-8 rounded-3xl">ATS Templates</div>
          <div className="bg-white/5 p-8 rounded-3xl">Live Chat</div>
        </div>
      </section>
    </div>
  );
};

export default Landing;