'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle2, Loader2, Wallet, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PlanosPage() {
  const [loading, setLoading] = useState(null); // 'mensal' or 'anual'

  const handleSubscribe = async (plan) => {
    setLoading(plan);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Você precisa estar logado para assinar.');
        setLoading(null);
        return;
      }

      const priceId = plan === 'mensal' 
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_MENSAL 
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_ANUAL;

      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        alert('Erro ao iniciar checkout.');
        setLoading(null);
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao processar.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            Voltar
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Wallet className="w-6 h-6 text-indigo-500" />
            </div>
            <span className="font-bold text-xl">CLT Rico</span>
          </div>
        </header>

        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Escolha seu plano
          </h1>
          <p className="text-gray-400 text-lg">
            Invista no seu futuro financeiro com as melhores ferramentas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plano Mensal */}
          <div className="bg-[#121218] border border-gray-800 rounded-3xl p-8 relative flex flex-col hover:border-gray-700 transition-colors">
            <div className="absolute -top-3 left-8 bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full">
              Mais Flexível
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Mensal</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">R$ 9,90</span>
                <span className="text-gray-400">/mês</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                'Controle total de gastos',
                'Carteira de investimentos',
                'Simulador de juros compostos',
                'Sincronização na nuvem',
                'Suporte prioritário'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={18} className="text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe('mensal')}
              disabled={!!loading}
              className="w-full py-4 rounded-xl font-bold bg-[#22c55e] hover:bg-[#16a34a] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'mensal' && <Loader2 className="animate-spin" />}
              Assinar Mensal
            </button>
          </div>

          {/* Plano Anual */}
          <div className="bg-[#121218] border-2 border-[#f59e0b] rounded-3xl p-8 relative flex flex-col shadow-[0_0_30px_-10px_rgba(245,158,11,0.3)]">
            <div className="absolute -top-3 left-8 bg-[#f59e0b] text-black text-xs font-bold px-3 py-1 rounded-full">
              Economize 16%
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 text-[#f59e0b]">Anual</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">R$ 99,90</span>
                <span className="text-gray-400">/ano</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                De <span className="line-through">R$ 118,80</span> (R$ 8,33/mês)
              </p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                'Controle total de gastos',
                'Carteira de investimentos',
                'Simulador de juros compostos',
                'Sincronização na nuvem',
                'Suporte prioritário',
                '2 meses grátis'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={18} className="text-[#f59e0b]" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe('anual')}
              disabled={!!loading}
              className="w-full py-4 rounded-xl font-bold bg-[#f59e0b] text-black hover:bg-[#d97706] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'anual' && <Loader2 className="animate-spin" />}
              Assinar Anual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
