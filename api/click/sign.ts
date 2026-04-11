import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLICKSIGN_API_URL = 'https://api.clicksign.com/api/v3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiToken, documentKey, signers, message, urlAccess } = req.body;

    if (!apiToken || !documentKey || !signers || signers.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Criar envelope
    const envelopeResponse = await fetch(`${CLICKSIGN_API_URL}/envelopes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        envelope: {
          name: `InovaSys - Documento ${documentKey}`,
          message: message || 'Por favor, assine o documento.',
          url_access: urlAccess || true,
        },
      }),
    });

    if (!envelopeResponse.ok) {
      const error = await envelopeResponse.json();
      return res.status(envelopeResponse.status).json({ error });
    }

    const envelope = await envelopeResponse.json();
    const envelopeKey = envelope.envelope.key;

    // 2. Verificar se o documento existe
    const documentResponse = await fetch(`${CLICKSIGN_API_URL}/documents/${documentKey}`, {
      headers: { 'Authorization': `Bearer ${apiToken}` },
    });

    if (!documentResponse.ok) {
      return res.status(404).json({ error: 'Document not found in Clicksign' });
    }

    // 3. Inserir documento no envelope
    await fetch(`${CLICKSIGN_API_URL}/envelopes/${envelopeKey}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document: {
          key: documentKey,
        },
      }),
    });

    // 4. Adicionar signatários
    for (const signer of signers) {
      const signerRes = await fetch(`${CLICKSIGN_API_URL}/signers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signer: {
            name: signer.name,
            email: signer.email,
            documentation: signer.documentation,
            birthday: signer.birthday,
            phone_number: signer.phone,
          },
        }),
      });
      const signerData = await signerRes.json();

      await fetch(`${CLICKSIGN_API_URL}/envelopes/${envelopeKey}/signers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signer: {
            key: signerData.signer.key,
            sign_as: 'sign',
          },
        }),
      });
    }

    // 5. Ativar envelope
    await fetch(`${CLICKSIGN_API_URL}/envelopes/${envelopeKey}/activate`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    return res.status(200).json({
      success: true,
      envelopeKey,
      statusUrl: `https://app.clicksign.com/envelopes/${envelopeKey}`,
    });
  } catch (error) {
    console.error('Clicksign API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}