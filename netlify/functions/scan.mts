import { GoogleGenAI, Type } from '@google/genai'
import type { Config } from '@netlify/functions'

const ai = new GoogleGenAI({})

const MAX_BASE64_LENGTH = 6_000_000

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  let body: { image?: string; mimeType?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { image, mimeType = 'image/jpeg' } = body
  if (!image || typeof image !== 'string' || image.length > MAX_BASE64_LENGTH || !mimeType.startsWith('image/')) {
    return Response.json({ error: 'Missing or invalid image' }, { status: 400 })
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: image } },
            {
              text:
                'You help people find 3D-printable models. Identify the main object in this photo. ' +
                'Return a short English search query (2-5 words) that would find a matching or similar printable model ' +
                'on sites like Printables or Thingiverse, a short Polish label of the object, and 2-3 alternative English queries.',
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING },
            labelPl: { type: Type.STRING },
            alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['query', 'labelPl', 'alternatives'],
        },
      },
    })

    const result = JSON.parse(response.text ?? '{}')
    return Response.json({
      query: String(result.query || '3d model').slice(0, 80),
      labelPl: String(result.labelPl || '').slice(0, 80),
      alternatives: Array.isArray(result.alternatives)
        ? result.alternatives.slice(0, 3).map((a: unknown) => String(a).slice(0, 80))
        : [],
    })
  } catch (err) {
    console.error('Scan failed', err)
    return Response.json({ error: 'Scan failed' }, { status: 502 })
  }
}

export const config: Config = {
  path: '/api/scan',
}
