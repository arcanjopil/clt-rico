import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow running without auth if we are in development, or strictly enforce it
        // return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log("Attempting to send email...");

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'arcanjopil@gmail.com',
      subject: 'Teste de E-mail - CLT Rico',
      html: '<p>Se você recebeu isso, a configuração do Resend está funcionando! 🚀</p>'
    });

    console.log("Email sent result:", data);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
