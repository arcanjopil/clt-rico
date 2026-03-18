'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, BookOpen, Target, PieChart, ShieldCheck, Zap, Star } from 'lucide-react';

const pages = [
  {
    title: "Bem-vindo ao CLT Rico!",
    icon: <BookOpen className="w-12 h-12 text-[#6366f1] mb-4" />,
    content: (
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>
          Parabéns pela excelente decisão! Você acaba de dar o primeiro passo para transformar sua realidade financeira.
        </p>
        <p>
          O <strong>CLT Rico</strong> não é apenas um anotador de gastos; é um sistema de direcionamento de riqueza feito para quem trabalha duro e quer ver o dinheiro trabalhar ainda mais.
        </p>
        <p>
          Neste E-book rápido, vamos te mostrar exatamente como extrair 100% do potencial da ferramenta. Preparado?
        </p>
      </div>
    )
  },
  {
    title: "1. A Base: Regra 50/30/20",
    icon: <PieChart className="w-12 h-12 text-[#eab308] mb-4" />,
    content: (
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>
          Todo o sistema do app é desenhado ao redor de um conceito simples e poderoso: a divisão ideal da sua renda.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm mt-4">
          <li><strong className="text-white">50% Essenciais:</strong> Moradia, mercado, contas fixas. É o mínimo para você viver.</li>
          <li><strong className="text-white">30% Livres (Variáveis):</strong> Lazer, restaurantes, compras. Você merece aproveitar o seu dinheiro hoje!</li>
          <li><strong className="text-white">20% Futuro (Investimentos):</strong> A sua passagem para a independência financeira. Pague-se primeiro!</li>
        </ul>
        <p>
          O painel inicial do app calcula esses limites automaticamente assim que você insere sua Renda.
        </p>
      </div>
    )
  },
  {
    title: "2. Alimentando o Sistema",
    icon: <Target className="w-12 h-12 text-[#ec4899] mb-4" />,
    content: (
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>
          Para os gráficos (Pizza e Barras) funcionarem a seu favor, você precisa criar o hábito de registrar suas movimentações.
        </p>
        <p>
          No menu esquerdo, você encontrará a área de <strong>Transações</strong>. Sempre que gastar, registre e coloque na categoria correta (Lazer, Saúde, Alimentação...).
        </p>
        <p>
          No Dashboard Principal, você poderá ver em tempo real se o seu gasto na categoria "Lazer" já estourou o seu orçamento ou se ainda tem saldo livre.
        </p>
      </div>
    )
  },
  {
    title: "3. O Segredo: Rebalanceamento",
    icon: <ShieldCheck className="w-12 h-12 text-[#22c55e] mb-4" />,
    content: (
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>
          Você já ouviu falar em "comprar na baixa e vender na alta"? É isso que a aba de <strong>Ativos & Metas</strong> faz por você automaticamente.
        </p>
        <p>
          Lá você cadastra seus investimentos (Ações, FIIs, Cripto, Renda Fixa) e define um percentual <em>ideal</em> para cada um (ex: quero ter 30% em FIIs).
        </p>
        <p>
          O CLT Rico calcula a diferença entre o que você tem hoje e o seu ideal, e <strong>te diz exatamente o que você deve comprar no mês</strong> para manter a carteira blindada.
        </p>
      </div>
    )
  },
  {
    title: "4. Gamificação (Subindo de Nível)",
    icon: <Zap className="w-12 h-12 text-[#3b82f6] mb-4" />,
    content: (
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>
          Nós sabemos que investir no longo prazo pode parecer chato. Por isso, trouxemos um sistema de RPG para o seu dinheiro!
        </p>
        <p>
          A cada ação positiva (bater meta de aporte, fechar o mês no azul), você ganha <strong>XP (Experiência)</strong>.
        </p>
        <p>
          Ao acumular XP, o seu "Rato CLT" evolui de nível, destravando novas conquistas e frases motivacionais. Quanto maior o nível, mais próximo da riqueza você está.
        </p>
      </div>
    )
  },
  {
    title: "Tudo Pronto!",
    icon: <Star className="w-12 h-12 text-yellow-400 mb-4" />,
    content: (
      <div className="space-y-4 text-gray-300 leading-relaxed text-center">
        <p className="text-xl text-white font-medium">
          O controle agora está nas suas mãos.
        </p>
        <p>
          Explore as abas, configure o seu salário atual, defina a sua meta de R$ 1 Milhão e comece a registrar.
        </p>
        <p className="pb-6">
          Nos vemos no topo! 🚀
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center w-full px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#ec4899] hover:opacity-90 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-indigo-500/25"
        >
          Acessar o App Agora
        </Link>
      </div>
    )
  }
];

export default function GuiaPage() {
  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = () => {
    if (currentPage < pages.length - 1) setCurrentPage(p => p + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(p => p - 1);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-2xl bg-[#12121a] border border-[#2a2a35] rounded-2xl shadow-2xl overflow-hidden relative flex flex-col min-h-[500px]">
        
        <div className="bg-[#1a1a24] border-b border-[#2a2a35] p-4 flex items-center justify-between">
          <div className="text-sm font-bold text-[#6366f1] tracking-widest uppercase">
            E-book Oficial
          </div>
          <div className="text-xs text-gray-500">
            Página {currentPage + 1} de {pages.length}
          </div>
        </div>

        <div className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-500 key={currentPage}">
          {pages[currentPage].icon}
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            {pages[currentPage].title}
          </h1>
          <div className="text-left w-full">
            {pages[currentPage].content}
          </div>
        </div>

        <div className="bg-[#1a1a24] border-t border-[#2a2a35] p-4 flex items-center justify-between mt-auto">
          <button 
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${currentPage === 0 ? 'opacity-0 cursor-default' : 'text-gray-400 hover:text-white hover:bg-[#2a2a35]'}`}
          >
            <ChevronLeft size={20} /> Anterior
          </button>
          
          <div className="flex gap-2">
            {pages.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all ${idx === currentPage ? 'w-6 bg-[#6366f1]' : 'w-2 bg-[#2a2a35]'}`}
              />
            ))}
          </div>

          {currentPage < pages.length - 1 ? (
            <button 
              onClick={nextPage}
              className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20"
            >
              Próximo <ChevronRight size={20} />
            </button>
          ) : (
            <div className="px-4 py-2 w-[100px]"></div>
          )}
        </div>
      </div>
    </div>
  );
}
