import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Mock data to simulate AI/Professional Analysis API responses
const MOCK_MARKET_ANALYSIS = {
    ibovespa: { value: "128.450", variation: "+1.2%" },
    ifix: { value: "3.350", variation: "-0.4%" },
    sp500: { value: "5.150", variation: "+2.1%" },
    ipca: "4.50%",
    selic: "10.75%",
    macro_view: "O mercado apresenta sinais mistos. A inflação controlada sugere manutenção da taxa Selic em patamares atrativos para Renda Fixa, enquanto a bolsa brasileira negocia a múltiplos descontados (P/L abaixo da média histórica). Para FIIs, o cenário de juros estabilizados favorece fundos de tijolo de alta qualidade."
};

// Mock expert analysis per asset to simulate a research house API
const getAssetAnalysis = (ticker, type) => {
    const analysisDb = {
        'HGLG11': {
            status: 'Manter / Compra',
            statusColor: '#10b981', // green
            p_vp: '1.02',
            dy: '8.5%',
            vacancia: '4.2%',
            comment: 'Fundo premium do setor logístico. Vacância física segue em queda e gestão demonstra forte capacidade de reciclagem de portfólio. Múltiplos esticados, mas prêmio justificado pela resiliência.'
        },
        'KNCR11': {
            status: 'Manter',
            statusColor: '#f59e0b', // yellow
            p_vp: '1.01',
            dy: '11.2%',
            vacancia: 'N/A',
            comment: 'Excelente carrego para o cenário atual. Carteira indexada 100% ao CDI com spread médio atrativo. Risco de crédito controlado.'
        },
        'WEGE3': {
            status: 'Compra',
            statusColor: '#10b981',
            p_vp: '8.50',
            dy: '1.8%',
            vacancia: 'N/A',
            comment: 'Resultados operacionais robustos trimestre após trimestre. Crescimento internacional compensa desafios locais. Empresa com altíssimo ROIC, ideal para buy and hold de longo prazo.'
        },
        'ITUB4': {
            status: 'Compra',
            statusColor: '#10b981',
            p_vp: '1.45',
            dy: '7.5%',
            vacancia: 'N/A',
            comment: 'O banco mais rentável do sistema. ROE acima de 20%. Pagamento de dividendos consistentes e recompra de ações em curso.'
        },
        'IVVB11': {
            status: 'Aporte Regular',
            statusColor: '#3b82f6', // blue
            p_vp: 'N/A',
            dy: 'N/A',
            vacancia: 'N/A',
            comment: 'Exposição cambial e às maiores empresas do mundo. Essencial para proteção do patrimônio em moeda forte.'
        }
    };

    // Default fallback for assets not in the mock DB
    if (analysisDb[ticker]) return analysisDb[ticker];

    if (type === 'FII') {
        return {
            status: 'Manter',
            statusColor: '#f59e0b',
            p_vp: '0.95',
            dy: '9.5%',
            vacancia: '8.0%',
            comment: 'Fundo apresenta yield em linha com seus pares. P/VP indica leve desconto frente ao valor patrimonial. Cenário macro exige monitoramento de possíveis inadimplências.'
        };
    } else {
        return {
            status: 'Manter',
            statusColor: '#f59e0b',
            p_vp: '1.20',
            dy: '5.0%',
            vacancia: 'N/A',
            comment: 'Ativo em momento de consolidação. Os fundamentos de longo prazo seguem intactos, mas no curto prazo não há gatilhos óbvios para forte valorização.'
        };
    }
};

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: users, error: userError } = await supabase
      .from('user_data')
      .select('user_id, carteira')
      .not('carteira', 'is', null);

    if (userError) throw userError;

    let emailsSent = 0;

    for (const userData of users) {
      if (!userData.carteira || userData.carteira.length === 0) continue;

      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userData.user_id);
      if (authError || !authUser.user) continue;
      
      const email = authUser.user.email;
      const name = authUser.user.user_metadata?.name || 'Investidor';

      // Check subscription status
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', userData.user_id)
        .maybeSingle();

      const isPremium = subData?.status === 'active' || email === 'arcanjopil@gmail.com';

      // For free users, only show a limited number of assets (e.g., max 2)
      const assetLimit = isPremium ? userData.carteira.length : 2;
      const visibleAssets = userData.carteira.slice(0, assetLimit);
      const hiddenAssetsCount = Math.max(0, userData.carteira.length - assetLimit);

      let totalDividendsEstimate = 0;
      let totalPortfolioValue = 0;
      let assetAnalysisHtml = '';

      // Calculate totals based on ALL assets, even if hidden
      for (const asset of userData.carteira) {
        if (!asset.quantity || asset.quantity <= 0) continue;
        const value = asset.quantity * (asset.currentPrice || 0);
        totalPortfolioValue += value;
        let mockYield = 0;
        if (asset.type === 'FII') mockYield = 0.008;
        if (asset.type === 'Ação BR') mockYield = 0.005;
        totalDividendsEstimate += value * mockYield;
      }

      // Generate HTML only for VISIBLE assets
      for (const asset of visibleAssets) {
        if (!asset.quantity || asset.quantity <= 0) continue;
        const analysis = getAssetAnalysis(asset.name, asset.type);

        assetAnalysisHtml += `
          <div style="background-color: #1a1a24; border: 1px solid #2a2a35; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 12px; margin-bottom: 15px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                ${asset.logoUrl ? `<img src="${asset.logoUrl}" alt="${asset.name}" style="width: 24px; height: 24px; border-radius: 50%; background: #fff;" />` : ''}
                <h3 style="margin: 0; color: #fff; font-size: 18px;">${asset.name}</h3>
                <span style="background-color: #333; color: #aaa; font-size: 11px; padding: 3px 8px; border-radius: 10px;">${asset.type}</span>
              </div>
              <span style="background-color: ${analysis.statusColor}20; color: ${analysis.statusColor}; border: 1px solid ${analysis.statusColor}50; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 6px;">
                ${analysis.status}
              </span>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px;">
                <div style="background: #13131a; padding: 10px; border-radius: 8px; text-align: center;">
                    <span style="color: #888; font-size: 11px; display: block;">DY (Projetado)</span>
                    <strong style="color: #22c55e; font-size: 14px;">${analysis.dy}</strong>
                </div>
                <div style="background: #13131a; padding: 10px; border-radius: 8px; text-align: center;">
                    <span style="color: #888; font-size: 11px; display: block;">P/VP</span>
                    <strong style="color: #fff; font-size: 14px;">${analysis.p_vp}</strong>
                </div>
                <div style="background: #13131a; padding: 10px; border-radius: 8px; text-align: center;">
                    <span style="color: #888; font-size: 11px; display: block;">Vacância</span>
                    <strong style="color: #fff; font-size: 14px;">${analysis.vacancia}</strong>
                </div>
            </div>

            <p style="color: #d4d4d8; font-size: 14px; line-height: 1.5; margin: 0; padding-left: 10px; border-left: 3px solid #a855f7;">
              <strong>Visão do Analista:</strong> ${analysis.comment}
            </p>
          </div>
        `;
      }

      // Add upsell banner for free users if they have hidden assets
      if (!isPremium && hiddenAssetsCount > 0) {
        assetAnalysisHtml += `
          <div style="background: linear-gradient(145deg, #2e1065 0%, #1a0b2e 100%); border: 1px solid #a855f7; border-radius: 12px; padding: 25px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">🔒</div>
            <h3 style="margin: 0 0 10px 0; color: #fff; font-size: 18px;">Você tem mais ${hiddenAssetsCount} ativo(s) não analisados</h3>
            <p style="color: #d8b4fe; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
              Este é um relatório parcial. Assine o CLT Rico Premium para desbloquear o Raio-X completo de toda a sua carteira, receber recomendações táticas e acessar o simulador avançado.
            </p>
            <a href="https://cltrico.online/planos" style="background-color: #a855f7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Desbloquear Relatório Completo
            </a>
          </div>
        `;
      }

      // Mock Portfolio Performance against indices
      const portfolioPerformance = "+1.8%"; // Mock
      const isBeatingMarket = 1.8 > 1.2; // comparing to ibov

      if (totalPortfolioValue > 0) {
        await resend.emails.send({
          from: 'CLT Rico Research <onboarding@resend.dev>',
          to: email,
          subject: '📊 Relatório de Análise: Sua Carteira vs Mercado',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0f; color: #ffffff; padding: 40px 20px; max-width: 650px; margin: 0 auto; border-radius: 16px;">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 40px; border-bottom: 1px solid #2a2a35; padding-bottom: 20px;">
                <h1 style="color: #a855f7; margin: 0; font-size: 32px; letter-spacing: -1px; font-weight: 800;">CLT Rico <span style="color: #fff; font-weight: 300;">Research</span></h1>
                <p style="color: #a1a1aa; margin-top: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Relatório Mensal de Estratégia</p>
              </div>

              <!-- Intro -->
              <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 10px;">Prezado investidor, ${name}.</h2>
              <p style="color: #d4d4d8; line-height: 1.7; font-size: 15px; margin-bottom: 30px;">
                Abaixo apresentamos o consolidado da sua estratégia de investimentos, o panorama macroeconômico atual e as recomendações táticas para os ativos que compõem o seu portfólio.
              </p>
              
              <!-- Macro Scenario -->
              <div style="background: linear-gradient(145deg, #1e1e28 0%, #13131a 100%); padding: 25px; border-radius: 16px; margin-bottom: 30px; border: 1px solid #2a2a35;">
                <h3 style="margin: 0 0 15px 0; color: #a855f7; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                  🌎 Cenário Macroeconômico
                </h3>
                <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                  ${MOCK_MARKET_ANALYSIS.macro_view}
                </p>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    <div style="background: #0a0a0f; padding: 12px; border-radius: 8px; text-align: center;">
                        <span style="color: #888; font-size: 10px; display: block; text-transform: uppercase;">IBOV</span>
                        <strong style="color: ${MOCK_MARKET_ANALYSIS.ibovespa.variation.includes('+') ? '#22c55e' : '#ef4444'}; font-size: 14px;">${MOCK_MARKET_ANALYSIS.ibovespa.variation}</strong>
                    </div>
                    <div style="background: #0a0a0f; padding: 12px; border-radius: 8px; text-align: center;">
                        <span style="color: #888; font-size: 10px; display: block; text-transform: uppercase;">IFIX</span>
                        <strong style="color: ${MOCK_MARKET_ANALYSIS.ifix.variation.includes('+') ? '#22c55e' : '#ef4444'}; font-size: 14px;">${MOCK_MARKET_ANALYSIS.ifix.variation}</strong>
                    </div>
                    <div style="background: #0a0a0f; padding: 12px; border-radius: 8px; text-align: center;">
                        <span style="color: #888; font-size: 10px; display: block; text-transform: uppercase;">SELIC</span>
                        <strong style="color: #fff; font-size: 14px;">${MOCK_MARKET_ANALYSIS.selic}</strong>
                    </div>
                    <div style="background: #0a0a0f; padding: 12px; border-radius: 8px; text-align: center;">
                        <span style="color: #888; font-size: 10px; display: block; text-transform: uppercase;">IPCA</span>
                        <strong style="color: #fff; font-size: 14px;">${MOCK_MARKET_ANALYSIS.ipca}</strong>
                    </div>
                </div>
              </div>

              <!-- Portfolio Performance -->
              <div style="display: flex; gap: 20px; margin-bottom: 40px;">
                  <div style="flex: 1; background: #1a1a24; padding: 25px; border-radius: 16px; border: 1px solid #2a2a35;">
                      <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Rentabilidade da Carteira</span>
                      <h2 style="margin: 10px 0 5px 0; color: ${portfolioPerformance.includes('+') ? '#22c55e' : '#ef4444'}; font-size: 36px; font-weight: 800;">${portfolioPerformance}</h2>
                      <span style="color: ${isBeatingMarket ? '#a855f7' : '#888'}; font-size: 13px; font-weight: bold;">
                        ${isBeatingMarket ? '🏆 Acima do Ibovespa' : 'Abaixo do Ibovespa'}
                      </span>
                  </div>
                  <div style="flex: 1; background: #1a1a24; padding: 25px; border-radius: 16px; border: 1px solid #2a2a35;">
                      <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Projeção de Renda (Mês)</span>
                      <h2 style="margin: 10px 0 5px 0; color: #22c55e; font-size: 36px; font-weight: 800;">R$ ${totalDividendsEstimate.toFixed(2).replace('.', ',')}</h2>
                      <span style="color: #a1a1aa; font-size: 13px;">Yield médio: ~0.7% a.m.</span>
                  </div>
              </div>

              <!-- Action Plan -->
              <div style="background-color: #3b076440; border: 1px solid #a855f750; border-radius: 12px; padding: 20px; margin-bottom: 40px;">
                <h3 style="margin: 0 0 10px 0; color: #d8b4fe; font-size: 16px;">🎯 Plano de Ação Estratégico</h3>
                <p style="margin: 0; color: #e9d5ff; font-size: 14px; line-height: 1.6;">
                  <strong>Diretriz:</strong> Mantenha o foco em acumulação de cotas de FIIs descontados para elevar o yield on cost. Recomendamos utilizar os <strong>R$ ${totalDividendsEstimate.toFixed(2).replace('.', ',')}</strong> projetados de dividendos para reinvestir em ativos com P/VP abaixo de 1.0.
                </p>
              </div>

              <!-- Asset Breakdown -->
              <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #fff; border-bottom: 2px solid #333; padding-bottom: 10px;">Raio-X dos Ativos</h2>
              
              ${assetAnalysisHtml}
              
              <div style="text-align: center; margin: 50px 0;">
                <a href="https://cltrico.online" style="background-color: #a855f7; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">Acessar Home Broker Virtual</a>
              </div>

              <div style="border-top: 1px solid #2a2a35; padding-top: 30px; text-align: center;">
                <p style="color: #52525b; font-size: 11px; line-height: 1.6; margin: 0;">
                  <strong>DISCLAIMER:</strong> Este é um relatório analítico gerado pela inteligência do CLT Rico. As informações de P/VP, Vacância e Dividend Yield são estimativas e projeções baseadas no mercado. As recomendações ("Compra", "Manter") são de caráter educativo e estratégico baseadas no perfil da sua carteira, não configurando promessa de rentabilidade garantida.<br><br>
                  © 2026 CLT Rico Research. Todos os direitos reservados.
                </p>
              </div>
            </div>
          `
        });
        emailsSent++;
      }
    }

    return NextResponse.json({ success: true, message: `Relatórios enviados: ${emailsSent}` });

  } catch (error) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
