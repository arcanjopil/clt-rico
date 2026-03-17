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
    // 1. Authenticate Cron Job (Security to prevent public execution)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Fetch Users (For now, let's target just your email to test)
    const { data: users, error: userError } = await supabase
      .from('user_data')
      .select('user_id, carteira')
      .not('carteira', 'is', null);

    if (userError) throw userError;

    let emailsSent = 0;

    // 3. Process each user's portfolio
    for (const userData of users) {
      if (!userData.carteira || userData.carteira.length === 0) continue;

      // Let's get the user's email from Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userData.user_id);
      
      if (authError || !authUser.user) continue;
      
      const email = authUser.user.email;
      const name = authUser.user.user_metadata?.name || 'Investidor';

      // For testing phase: ONLY send to your email
      if (email !== 'arcanjopil@gmail.com') continue;

      let totalDividendsEstimate = 0;
      let dividendListHtml = '';

      // Simplify for prototype: Mock dividend calculation (e.g. 0.8% of portfolio value)
      // Later we will connect this to an actual API like Brapi or StatusInvest
      for (const asset of userData.carteira) {
        const value = (asset.quantity || 0) * (asset.currentPrice || 0);
        
        // Mock yield logic: FIIs pay ~0.8%, Ações ~0.5% monthly
        let mockYield = 0;
        if (asset.type === 'FII') mockYield = 0.008;
        if (asset.type === 'Ação BR') mockYield = 0.005;
        
        const estimatedDividend = value * mockYield;
        
        if (estimatedDividend > 0) {
            totalDividendsEstimate += estimatedDividend;
            dividendListHtml += `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #333; color: #fff;">${asset.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #333; color: #fff;">${asset.quantity} cotas</td>
                <td style="padding: 8px; border-bottom: 1px solid #333; color: #00ff00; text-align: right;">R$ ${estimatedDividend.toFixed(2).replace('.', ',')}</td>
              </tr>
            `;
        }
      }

      if (totalDividendsEstimate > 0) {
        // 4. Send Email via Resend
        await resend.emails.send({
          from: 'CLT Rico <relatorios@cltrico.online>', // You need to configure this domain in Resend
          to: email,
          subject: '💰 Seu Relatório de Dividendos Chegou!',
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0a0a0f; color: #fff; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px;">
              <h1 style="color: #a855f7; text-align: center;">CLT Rico</h1>
              <h2>Olá, ${name}!</h2>
              <p>O seu dinheiro está trabalhando por você. Aqui está a estimativa dos seus dividendos com base na sua carteira atual:</p>
              
              <div style="background-color: #1a1a24; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; color: #888;">Total Estimado no Mês</p>
                <h2 style="margin: 5px 0 0 0; color: #00ff00; font-size: 32px;">R$ ${totalDividendsEstimate.toFixed(2).replace('.', ',')}</h2>
              </div>

              <h3>Detalhes por Ativo:</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                ${dividendListHtml}
              </table>

              <p style="text-align: center; color: #888; font-size: 12px;">
                Este é um relatório automatizado do seu aplicativo CLT Rico. As projeções são estimativas baseadas no histórico dos ativos.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://cltrico.online" style="background-color: #a855f7; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Acessar minha Carteira</a>
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
