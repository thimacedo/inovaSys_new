export default async function handler(req, res) {
  try {
    const apiKey = process.env.VERCEL_API_KEY;
    const projectId = process.env.VERCEL_PROJECT_ID;

    if (!apiKey || !projectId) {
      return res.status(400).json({ error: "Vercel API Key or Project ID missing in environment variables." });
    }

    const response = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching Vercel deployments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
