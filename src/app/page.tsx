"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import LandingLayout from '@/components/layout/LandingLayout';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

export default function Home() {
  const router = useRouter();

  return (
    <LandingLayout>
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative">
        <div className="absolute inset-0 -z-10 cursor-move">
          <Canvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[2, 2, 2]} intensity={1} />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
            <Sphere visible args={[1, 100, 200]} scale={2}>
              <MeshDistortMaterial color="#00d9ff" attach="material" distort={0.4} speed={1.5} roughness={0} />
            </Sphere>
          </Canvas>
        </div>
        
        <div className="bg-background/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-border max-w-2xl pointer-events-auto mt-20">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Welcome to <span className="text-primary">HealthNex</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A simplified, interactive platform for real-time health surveillance.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/register')}>
              Join the Network
            </Button>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
