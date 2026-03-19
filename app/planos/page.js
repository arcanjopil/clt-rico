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
        window.location.href = `/?auth=login&next=${encodeURIComponent(next)}`;
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
        alert(`Erro ao iniciar checkout: ${data.error || 'Erro desconhecido'} (Status: ${res.status})`);
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

          {/* Plano Anual */}
          <div className="bg-[#121218] border-2 border-[#f59e0b] rounded-3xl p-8 relative flex flex-col shadow-[0_0_30px_-10px_rgba(245,158,11,0.3)]">
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

        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-[#121218] border border-indigo-500/40 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute -top-3 left-8 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Melhor Custo-Benefício
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="text-indigo-400" size={22} />
                  <h3 className="text-2xl font-bold">Vitalício</h3>
                </div>
                <p className="text-gray-400">
                  Pagamento único. Acesso para sempre.
                </p>
                <ul className="space-y-2 text-gray-300 text-sm">
                  {[
                    'Acesso vitalício ao CLT Rico Premium',
                    'Atualizações inclusas',
                    'Sem mensalidade',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-indigo-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col items-stretch gap-3 md:w-[280px]">
                <div className="text-center">
                  <div className="text-4xl font-extrabold">
                    {formatBRL(pricing.vitalicio) || 'R$ 297,00'}
                  </div>
                  <div className="text-sm text-gray-500">pagamento único</div>
                </div>
                <button
                  onClick={() => handleSubscribe('vitalicio')}
                  disabled={!!loading}
                  className="w-full py-4 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(loading === 'vitalicio' || (pricesLoading && !priceInfo.vitalicio)) && <Loader2 className="animate-spin" />}
                  Comprar Vitalício
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
