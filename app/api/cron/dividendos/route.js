import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Needs service role to bypass RLS and read all users
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req) {
  try {
    // 1. Authenticate Cron Job
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Fetch Users
    const { data: users, error: userError } = await supabase
      .from('user_data')
      .select('user_id, carteira')
      .not('carteira', 'is', null);

    if (userError) throw userError;

    let emailsSent = 0;

    // 3. Process each user's portfolio
    for (const userData of users) {
      if (!userData.carteira || userData.carteira.length === 0) continue;

      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userData.user_id);
      
      if (authError || !authUser.user) continue;
      
      const email = authUser.user.email;
      const name = authUser.user.user_metadata?.name || 'Investidor';

      // For testing phase: ONLY send to your email
      if (email !== 'arcanjopil@gmail.com') continue;

      let totalDividendsEstimate = 0;
      let dividendListHtml = '';

      for (const asset of userData.carteira) {
        const value = (asset.quantity || 0) * (asset.currentPrice || 0);
        
        let mockYield = 0;
        if (asset.type === 'FII') mockYield = 0.008;
        if (asset.type === 'Ação BR') mockYield = 0.005;
        
        const estimatedDividend = value * mockYield;
        
        if (estimatedDividend > 0) {
            totalDividendsEstimate += estimatedDividend;
            dividendListHtml += `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #2a2a35; color: #fff;"><strong>${asset.name}</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #2a2a35; color: #a1a1aa; text-align: center;">${asset.quantity} cotas</td>
                <td style="padding: 10px; border-bottom: 1px solid #2a2a35; color: #22c55e; text-align: right; font-weight: bold;">R$ ${estimatedDividend.toFixed(2).replace('.', ',')}</td>
              </tr>
            `;
        }
      }

      if (totalDividendsEstimate > 0) {
        // 4. Send Email via Resend
        await resend.emails.send({
          from: 'CLT Rico <onboarding@resend.dev>', // Using Resend testing domain
          to: email,
          subject: '💰 Seu Relatório de Dividendos Chegou!',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0f; color: #ffffff; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #a855f7; margin: 0; font-size: 28px; letter-spacing: -1px;">CLT Rico</h1>
                <p style="color: #a1a1aa; margin-top: 5px; font-size: 14px;">Seu caminho para a liberdade financeira</p>
              </div>

              <h2 style="font-size: 20px; font-weight: 500;">Olá, ${name}! 👋</h2>
              <p style="color: #d4d4d8; line-height: 1.6; font-size: 16px;">
                O seu dinheiro está trabalhando duro por você. Aqui está a estimativa dos dividendos gerados pela sua carteira neste mês:
              </p>
              
              <div style="background: linear-gradient(145deg, #1e1e28 0%, #13131a 100%); padding: 30px 20px; border-radius: 16px; margin: 30px 0; text-align: center; border: 1px solid #2a2a35;">
                <p style="margin: 0; color: #a1a1aa; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Renda Passiva Estimada</p>
                <h2 style="margin: 10px 0 0 0; color: #22c55e; font-size: 42px; font-weight: 800; letter-spacing: -1px;">R$ ${totalDividendsEstimate.toFixed(2).replace('.', ',')}</h2>
              </div>

              <h3 style="font-size: 16px; color: #a1a1aa; margin-bottom: 15px; border-bottom: 1px solid #2a2a35; padding-bottom: 10px;">Detalhamento por Ativo</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 15px;">
                ${dividendListHtml}
              </table>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://cltrico.online" style="background-color: #a855f7; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Abrir minha Carteira</a>
              </div>

              <div style="border-top: 1px solid #2a2a35; padding-top: 20px; text-align: center;">
                <p style="color: #71717a; font-size: 12px; line-height: 1.5; margin: 0;">
                  Este é um relatório automatizado do CLT Rico.<br>
                  As projeções são estimativas baseadas no yield médio histórico dos ativos e podem variar em relação aos pagamentos reais.
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
