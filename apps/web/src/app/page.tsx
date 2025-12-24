"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {  Shield, Zap, Users } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const session = useSession();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-32 relative overflow-hidden">
        {/* Background Gradient Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--primary)] opacity-10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl w-full text-center space-y-8 z-10">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Connect with your Crew <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
                in Real-Time
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Experience the fastest, most secure way to chat. Collaborate seamlessly with your team, friends, and family.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {session?.data ? (
              <button
                onClick={() => router.push("/chats")}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-lg px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                Go to Chats
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push("/login")}
                  className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-lg px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 bg-[var(--card)] border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why Choose CrewChat?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-[var(--warning)]" />}
              title="Lightning Fast"
              description="Instant message delivery ensuring you never miss a beat in your conversations."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-[var(--accent)]" />}
              title="Secure & Private"
              description="Your conversations are protected. We prioritize your privacy and data security."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-[var(--link)]" />}
              title="Team Collaboration"
              description="Create groups, share files, and collaborate efficiently with your entire crew."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-6xl mx-auto px-4 text-center text-[var(--muted-foreground)]">
          <p>© {new Date().getFullYear()} CrewChat. Built for connection.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors shadow-sm hover:shadow-md">
      <div className="mb-4 inline-block p-3 rounded-lg bg-[var(--muted)]">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-[var(--muted-foreground)] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
