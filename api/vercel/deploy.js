export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.VERCEL_API_KEY;
    const projectId = process.env.VERCEL_PROJECT_ID;

    if (!apiKey || !projectId) {
      return res.status(400).json({ error: "Vercel API Key or Project ID missing in environment variables." });
    }

    const response = await fetch(`https://api.vercel.com/v13/deployments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "inovasys",
        project: projectId,
        target: "production"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error triggering Vercel deploy:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
