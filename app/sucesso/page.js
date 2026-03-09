'use client';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function SucessoPage() {
  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md animate-in zoom-in duration-500">
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

        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-8 py-4 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-indigo-500/25"
        >
          Ir para o app
        </Link>
      </div>
    </div>
  );
}
