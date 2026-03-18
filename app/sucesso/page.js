'use client';

import { CheckCircle2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function SucessoPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    // Confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    // Countdown and redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/guia');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md animate-in zoom-in duration-500 flex flex-col items-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50 shadow-[0_0_30px_-5px_rgba(34,197,94,0.4)]">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Assinatura ativada com sucesso!</h1>
        <p className="text-gray-400 mb-8 text-lg">
          Bem-vindo ao CLT Rico Premium 🎉<br/>
          Você agora tem acesso a todas as ferramentas.
        </p>

        <div className="w-full space-y-4">
          <Link 
            href="/guia" 
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#ec4899] hover:opacity-90 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-indigo-500/25"
          >
            <BookOpen size={24} />
            Ler E-book Guia de Uso
          </Link>
          
          <p className="text-sm text-gray-500 animate-pulse">
            Redirecionando para o guia em {countdown} segundos...
          </p>
        </div>
      </div>
    </div>
  );
}
