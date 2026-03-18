import Link from 'next/link';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function OfertaPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="flex items-center justify-between mb-12">
          <Link href="/" className="font-bold text-xl">
            CLT Rico
          </Link>
          <Link
            href="/planos"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Ver planos
          </Link>
        </header>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-xs font-semibold">
              <Sparkles size={14} />
              Feito para CLT que quer construir patrimônio
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Organize seu salário, pare de viver no aperto e comece a investir com direção.
            </h1>

            <p className="text-gray-300 text-lg leading-relaxed">
              O CLT Rico te mostra para onde seu dinheiro está indo, define limites inteligentes e te ajuda a manter constância no aporte.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/planos"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#ec4899] hover:opacity-90 transition-all"
              >
                Assinar agora
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/?auth=register&next=%2Fplanos"
                className="inline-flex items-center justify-center px-6 py-4 rounded-xl font-bold bg-[#121218] border border-gray-800 hover:border-gray-700 transition-all"
              >
                Criar conta
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-4">
              {["Gráficos por categoria (pizza e barras)", "Regra 50/30/20 aplicada automaticamente", "Carteira e rebalanceamento de ativos", "Gamificação para manter consistência"].map((item) => (
                <div key={item} className="flex items-start gap-3 bg-[#121218] border border-gray-800 rounded-2xl p-4">
                  <CheckCircle2 size={18} className="text-[#22c55e] mt-0.5" />
                  <div className="text-gray-200 text-sm leading-relaxed">{item}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#121218] border border-gray-800 rounded-3xl p-8">
            <div className="space-y-4">
              <div className="text-sm text-gray-400">Comece em menos de 2 minutos</div>
              <ol className="space-y-3 text-gray-200">
                <li className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-200 text-sm font-bold">1</div>
                  <div>
                    <div className="font-semibold">Crie sua conta</div>
                    <div className="text-gray-400 text-sm">Rápido e seguro com Supabase.</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-200 text-sm font-bold">2</div>
                  <div>
                    <div className="font-semibold">Escolha seu plano</div>
                    <div className="text-gray-400 text-sm">Mensal ou anual.</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-200 text-sm font-bold">3</div>
                  <div>
                    <div className="font-semibold">Pagamento aprovado</div>
                    <div className="text-gray-400 text-sm">Você é redirecionado para o guia dentro do app.</div>
                  </div>
                </li>
              </ol>

              <div className="pt-6">
                <Link
                  href="/planos"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold bg-[#f59e0b] text-black hover:bg-[#d97706] transition-all"
                >
                  Ver preços e assinar
                  <ArrowRight size={18} />
                </Link>
                <div className="text-xs text-gray-500 mt-3 text-center">
                  Se você já tem conta, faça login e assine em seguida.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

