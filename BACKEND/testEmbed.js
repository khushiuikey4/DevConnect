require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
//DIHI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
    const result = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: 'How to stop React re-renders',
        config: { outputDimensionality: 768 },
    });

    const vector = result.embeddings[0].values;
    console.log('Length:', vector.length); // should print 768
    console.log('First 5 numbers:', vector.slice(0, 5));
}

main().catch((err) => console.error('Error:', err.message));