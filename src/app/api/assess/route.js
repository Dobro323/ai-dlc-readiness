export async function POST(req) {
  try {
    const { process: devProcess, teamType, predictability, aiUsage, oversight } = await req.json()

    if (!devProcess?.trim()) {
      return Response.json({ error: 'Process description required' }, { status: 400 })
    }

    const prompt = `You are an AI-DLC expert. Return ONLY valid JSON, no markdown, no explanation.

Team: ${teamType}, predictability: ${predictability}, AI usage: ${aiUsage}, human oversight: ${oversight}
Process: "${devProcess}"

Return exactly:
{"score":50,"level":"Aware","summary":"Two sentences here.","stages":[{"name":"Workspace Detection","status":"required","note":"Short note here"},{"name":"Requirements Analysis","status":"critical","note":"Short note here"},{"name":"Functional Design","status":"required","note":"Short note here"},{"name":"Architecture","status":"skip","note":"Short note here"},{"name":"Construction","status":"critical","note":"Short note here"},{"name":"Testing","status":"required","note":"Short note here"}],"roadmap":[{"title":"Action 1","desc":"One sentence action.","timeline":"Week 1-2"},{"title":"Action 2","desc":"One sentence action.","timeline":"Week 3-4"},{"title":"Action 3","desc":"One sentence action.","timeline":"Month 2"},{"title":"Action 4","desc":"One sentence action.","timeline":"Month 3"}],"expected_gain":"3-5x velocity"}`

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      return Response.json({ error: `Groq error ${groqRes.status}: ${errText}` }, { status: 500 })
    }

    const data = await groqRes.json()
    const raw = data.choices?.[0]?.message?.content || ''

    if (!raw) {
      return Response.json({ error: 'Empty response', debug: JSON.stringify(data) }, { status: 500 })
    }

    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    const auditEntry = {
      timestamp: new Date().toISOString(),
      teamType, predictability, aiUsage, oversight,
      processSnippet: devProcess.substring(0, 120),
      score: result.score,
      level: result.level,
      expectedGain: result.expected_gain,
    }

    return Response.json({ result, audit: auditEntry })

  } catch (e) {
    return Response.json({ error: e.message || 'Unknown error' }, { status: 500 })
  }
}
