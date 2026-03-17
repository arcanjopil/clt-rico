import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '../../../lib/stripe';

const PLANS = {
    mensal: {
          priceId: process.env.STRIPE_PRICE_ID_MENSAL,
          mode: 'subscription',
    },
    anual: {
          priceId: process.env.STRIPE_PRICE_ID_ANUAL,
          mode: 'subscription',
    },
    vitalicio: {
          priceId: process.env.STRIPE_PRICE_ID_VITALICIO,
          mode: 'payment',
    },
};

export async function POST(req) {
    try {
          const { plan } = await req.json();
          const planConfig = PLANS[plan];

      if (!planConfig) {
              return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
      }

      // Verificar Usuário Logado via Authorization header
      const authHeader = req.headers.get('authorization');
          if (!authHeader) {
                  return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
          }

      const token = authHeader.replace('Bearer ', '');
          const supabase = createClient(
                  process.env.NEXT_PUBLIC_SUPABASE_URL,
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                );

      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
              return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
      }

      const session = await stripe.checkout.sessions.create({
              payment_method_types: ['card'],
              line_items: [{ price: planConfig.priceId, quantity: 1 }],
              mode: planConfig.mode,
              success_url: `${process.env.NEXT_PUBLIiCm_pBoArStE _{U RNLe}x/tsRuecsepsosnos?es e}s sfiroonm_ i'dn=e{xCtH/EsCeKrOvUeTr_'S;E
                              SiSmIpOoNr_tI D{} `c,r
        e a t e C l iceanntc e}l _furrolm:  '`@$s{uppraobcaesses/.seunpva.bNaEsXeT-_jPsU'B;L
  IiCm_pBoArStE _{U RsLt}r/ipplea n}o sf`r,o
  m   ' . . / .c.u/s.t.o/mleirb_/esmtariilp:e 'u;s
  e
  rc.oenmsati lP,L
  A N S   =   {m
  e t amdeantsaa:l :{  {u
  s e r I dp:r iucseeIrd.:i dp,r opcleasns .}e,n
  v . S T R}I)P;E
  _
  P R I C Er_eItDu_rMnE NNSeAxLt,R
  e s p o nmsoed.ej:s o'ns(u{b sucrrli:p tsieosns'i,o
  n . u}r,l
    } )a;n
    u a l}:  c{a
    t c h   (perrircoerI)d :{ 
    p r o c ecsosn.seonlve..SeTrRrIoPrE(_'PCRhIeCcEk_oIuDt_ AeNrUrAoLr,:
    ' ,   e rmroodre):; 
    ' s u b srcertiuprtni oNne'x,t
    R e s}p,o
    n s ev.ijtsaolni(c{i oe:r r{o
    r :   ' Eprrrioc eiIndt:e rpnroo'c e}s,s .{e nsvt.aStTuRsI:P E5_0P0R I}C)E;_
    I D _}V
    I}TALICIO,
        mode: 'payment',
          },
          };

          export async function POST(req) {
            try {
                const { plan } = await req.json();
                    const planConfig = PLANS[plan];

                        if (!planConfig) {
                              return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
                                  }

                                      // Verificar Usuário Logado via Authorization header
                                          const authHeader = req.headers.get('authorization');
                                              if (!authHeader) {
                                                    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
                                                        }

                                                            const token = authHeader.replace('Bearer ', '');
                                                                const supabase = createClient(
                                                                      process.env.NEXT_PUBLIC_SUPABASE_URL,
                                                                            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                                                                                );

                                                                                    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

                                                                                        if (userError || !user) {
                                                                                              return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
                                                                                                  }

                                                                                                      const session = await stripe.checkout.sessions.create({
                                                                                                            payment_method_types: ['card'],
                                                                                                                  line_items: [{ price: planConfig.priceId, quantity: 1 }],
                                                                                                                        mode: planConfig.mode,
                                                                                                                              success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/planos`,
              customer_email: user.email,
              metadata: { userId: user.id, plan },
});

    return NextResponse.json({ url: session.url });
} catch (error) {
      console.error('Checkout error:', error);
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
}
}
