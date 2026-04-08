export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html } = req.body;
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
       console.log(`[Mock Email] E-mail que seria enviado para ${to}: ${subject}`);
       return res.status(200).json({ mock: true, message: "E-mail capturado nos logs. Chave RESEND_API_KEY não configurada na Vercel." });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'InovaSys Notificações <onboarding@resend.dev>', // Email teste do Resend; dps trocam p/ domínio verificado
        to: [to],
        subject: subject,
        html: html
      })
    });

    if (!response.ok) {
       const err = await response.json();
       return res.status(response.status).json(err);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro no serverless de email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
