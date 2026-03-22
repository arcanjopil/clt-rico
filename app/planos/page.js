'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle2, Loader2, Wallet, ArrowLeft, Crown } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PlanosPage() {
  const [loading, setLoading] = useState(null); // 'mensal' | 'anual' | 'vitalicio'
  const [priceInfo, setPriceInfo] = useState({ mensal: null, anual: null, vitalicio: null });
  const [pricesLoading, setPricesLoading] = useState(true);
  const searchParams = useSearchParams();
  const didAutoCheckout = useRef(false);

  const formatBRL = useCallback((cents) => {
    if (typeof cents !== 'number') return null;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  }, []);

  const pricing = useMemo(() => {
    const mensal = priceInfo.mensal?.unit_amount;
    const anual = priceInfo.anual?.unit_amount;
    const vitalicio = priceInfo.vitalicio?.unit_amount;

    const anualMensalEq = typeof anual === 'number' ? Math.round(anual / 12) : null;
    const anualDe = typeof mensal === 'number' ? mensal * 12 : null;
    const anualEconomia = typeof anual === 'number' && typeof anualDe === 'number'
      ? Math.max(0, Math.round(((anualDe - anual) / anualDe) * 100))
      : null;

    return {
      mensal: mensal,
      anual: anual,
      vitalicio: vitalicio,
      anualMensalEq,
      anualDe,
      anualEconomia,
    };
  }, [priceInfo]);

  useEffect(() => {
    (async () => {
      try {
        setPricesLoading(true);
        const res = await fetch('/api/prices');
        const data = await res.json();
        if (res.ok && data?.prices) {
          setPriceInfo({
            mensal: data.prices.mensal,
            anual: data.prices.anual,
            vitalicio: data.prices.vitalicio,
          });
        }
      } finally {
        setPricesLoading(false);
      }
    })();
  }, []);

  const handleSubscribe = useCallback(async (plan) => {
    setLoading(plan);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        const next = `/planos?plan=${encodeURIComponent(plan)}`;
        window.location.href = `/app?auth=login&next=${encodeURIComponent(next)}`;
        return;
      }

      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'InitiateCheckout', { content_name: plan });
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        console.error('Checkout API Error:', data);
        const details = data?.details ? `\n\nDetalhes: ${data.details}` : '';
        alert(`Erro ao iniciar checkout: ${data.error || 'Erro desconhecido'} (Status: ${res.status})${details}`);
        setLoading(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Erro: URL de checkout não retornada.');
        setLoading(null);
      }
    } catch (error) {
      console.error(error);
      alert(`Erro de conexão: ${error.message}`);
      setLoading(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', { content_name: 'Planos' });
    }
  }, []);

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (!plan || didAutoCheckout.current) return;

    if (plan !== 'mensal' && plan !== 'anual' && plan !== 'vitalicio') return;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      didAutoCheckout.current = true;
      handleSubscribe(plan);
    })();
  }, [handleSubscribe, searchParams]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <Link href="/oferta" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
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

        <div className="grid gap-8 max-w-5xl mx-auto md:grid-cols-2 lg:grid-cols-3">
          {/* Plano Mensal */}
          <div className="order-2 lg:order-1 bg-[#121218] border border-gray-800 rounded-3xl p-8 relative flex flex-col hover:border-gray-700 transition-colors">
            <div className="absolute -top-3 left-8 bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full">
              Mais Flexível
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Mensal</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{formatBRL(pricing.mensal) || 'R$ 9,90'}</span>
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
                  <CheckCircle2 size={18} className="text-[#22c55e]" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe('mensal')}
              disabled={!!loading}
              className="w-full py-4 rounded-xl font-bold bg-[#22c55e] hover:bg-[#16a34a] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              {(loading === 'mensal' || (pricesLoading && !priceInfo.mensal)) && <Loader2 className="animate-spin" />}
              Assinar Mensal
            </button>
          </div>

          {/* Plano Vitalício (Destaque) */}
          <div className="order-1 md:col-span-2 lg:col-span-1 lg:order-2 relative rounded-3xl p-[2px] bg-gradient-to-br from-indigo-500/70 via-fuchsia-500/40 to-indigo-500/10 shadow-[0_0_50px_-18px_rgba(99,102,241,0.75)]">
            <div className="bg-[#0f0f16] rounded-3xl p-8 pt-10 relative overflow-visible flex flex-col h-full">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-sm font-extrabold px-4 py-1.5 rounded-full shadow-lg shadow-indigo-500/30 whitespace-nowrap">
                Melhor custo-benefício
              </div>
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />

              <div className="mb-6 relative">
                <div className="flex items-center gap-2">
                  <Crown className="text-indigo-300" size={22} />
                  <h3 className="text-2xl font-extrabold">Vitalício</h3>
                </div>
                <p className="text-gray-300 mt-2">
                  Pagamento único. Acesso para sempre.
                </p>
              </div>

              <div className="flex items-baseline gap-2 mb-6 relative">
                <span className="text-5xl font-extrabold">{formatBRL(pricing.vitalicio) || 'R$ 297,00'}</span>
                <span className="text-gray-400">pagamento único</span>
              </div>

              <ul className="space-y-3 text-gray-200 text-sm flex-1 relative">
                {[
                  'Acesso vitalício ao CLT Rico Premium',
                  'Atualizações inclusas',
                  'Sem mensalidade',
                  'Suporte prioritário',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-indigo-300" />
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe('vitalicio')}
                disabled={!!loading}
                className="mt-8 w-full py-4 rounded-xl font-extrabold bg-indigo-500 hover:bg-indigo-600 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(loading === 'vitalicio' || (pricesLoading && !priceInfo.vitalicio)) && <Loader2 className="animate-spin" />}
                Comprar Vitalício
              </button>
            </div>
          </div>

          {/* Plano Anual */}
          <div className="order-3 lg:order-3 bg-[#121218] border border-[#f59e0b]/40 rounded-3xl p-8 relative flex flex-col hover:border-[#f59e0b]/60 transition-colors">
            <div className="absolute -top-3 left-8 bg-[#f59e0b] text-black text-xs font-bold px-3 py-1 rounded-full">
              Economize 16%
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 text-[#f59e0b]">Anual</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{formatBRL(pricing.anual) || 'R$ 99,90'}</span>
                <span className="text-gray-400">/ano</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {pricing.anualDe ? (
                  <>
                    De <span className="line-through">{formatBRL(pricing.anualDe)}</span>{' '}
                    ({pricing.anualMensalEq ? `${formatBRL(pricing.anualMensalEq)}/mês` : ''})
                  </>
                ) : (
                  <>Pagamento anual</>
                )}
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
              {(loading === 'anual' || (pricesLoading && !priceInfo.anual)) && <Loader2 className="animate-spin" />}
              Assinar Anual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
