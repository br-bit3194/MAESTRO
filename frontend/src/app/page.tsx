'use client';

import { SplineScene } from "@/components/ui/spline-scene";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black to-gray-900">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
              MAESTRO
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              AI-powered IT Operations Platform that automates incident resolution with intelligent agent workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild className="gap-2 group">
                <Link href="/demo">
                  View Demo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <a href="https://github.com/br-bit3194/MAESTRO.git" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4" /> GitHub
                </a>
              </Button>
            </div>
          </div>

          {/* Right Column - 3D Spline */}
          <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden border border-gray-800 bg-black/50 backdrop-blur-sm">
            <SplineScene 
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'AI-Powered Resolution',
              description: 'Automatically resolves IT incidents using intelligent agent workflows and learns from past solutions.'
            },
            {
              title: 'Multi-Agent Architecture',
              description: 'Specialized agents for ticketing, memory management, and technical domains work in concert.'
            },
            {
              title: 'Self-Learning System',
              description: 'Continuously improves by learning from resolved incidents and operator feedback.'
            }
          ].map((feature, index) => (
            <div key={index} className="p-6 bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p> {new Date().getFullYear()} MAESTRO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
