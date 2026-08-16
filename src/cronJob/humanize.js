// lib/humanizer.js
import fs from "fs";
import path from "path";
// Helper to clean up API response artifacts
function cleanHumanizedContent(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/\s+/g, ' ').trim();
}

export async function humanizeContent(content, options = {}) {
    const {
        skipRealtime = 1,
        humanizerReadability = 'High School',
        humanizerPurpose = 'General Writing',
        humanizerStrength = 'Balanced',
        humanizerModel = 'v11',
        timeout = 30000 // 30 seconds
    } = options;

    if (!content || typeof content !== 'string' || !content.trim()) {
        return { success: false, error: 'Content is required and must be a non-empty string' };
    }

    // Use AbortController for proper timeout handling in Node.js/Next.js
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch('https://api.zerogpt.com/api/transform/humanize', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json',
                'Origin': 'https://www.zerogpt.com',
                'Referer': 'https://www.zerogpt.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                string: content,
                skipRealtime,
                humanizerReadability,
                humanizerPurpose,
                humanizerStrength,
                humanizerModel
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ZeroGPT API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        let humanizedContent = null;

        if (data.success && data.data) humanizedContent = data.data;
        else if (data.data) humanizedContent = data.data;
        else if (typeof data === 'string') humanizedContent = data;
        else if (data.result) humanizedContent = data.result;

        if (!humanizedContent) {
            return { success: false, error: 'No humanized content returned', original: content };
        }

        return {
            success: true,
            content: cleanHumanizedContent(humanizedContent),
            original: content,
        };
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Humanization error:', error.message);
        return { success: false, error: error.message, original: content };
    }
}

export async function humanizeJson(data, options = {}) {
    const HUMANIZE_KEYS = new Set([
        "description", "metaDescription", "description2", "metaTitle", "ogTitle", "ogDescription", "description2", "question", "answer"
    ]);

    // Prevent rate-limiting by limiting concurrent API calls (e.g., max 2 at a time)
    const concurrencyLimit = 10;
    let activePromises = 0;

    async function traverse(value, key = "") {
        if (typeof value === "string") {
            if (HUMANIZE_KEYS.has(key) && value.trim().length > 30) {

                while (activePromises >= concurrencyLimit) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }

                activePromises++;

                console.log(value)
                try {
                    const result = await humanizeContent(value, options);
                    if (result.success && result.content) {

                        console.log(result?.content?.output)
                        return result.content?.output || value;
                    }
                    console.warn(`⚠️ Failed to humanize "${key}", using original. Error:`, result.error);
                    return value; // Fallback to original
                } catch (err) {
                    console.error(`❌ Exception while humanizing "${key}"`, err);
                    return value;
                } finally {
                    activePromises--;
                }
            }
            return value;
        }

        if (Array.isArray(value)) {
            const result = [];
            for (const item of value) {
                result.push(await traverse(item));
            }
            return result;
        }

        if (value && typeof value === "object") {
            const result = {};
            for (const [k, v] of Object.entries(value)) {
                result[k] = await traverse(v, k);
            }
            return result;
        }

        return value;
    }

    return await traverse(data);
}

console.log("jai hoo")
export default async function KKKmain() {
    console.log("🚀 Starting...");

    const inputPath = path.join(
        process.cwd(),
        "src",
        "data",
        "services.json"
    );

    const outputPath = path.join(
        process.cwd(),
        "src",
        "data",
        "humanized-services.json"
    );

    const rawData = JSON.parse(fs.readFileSync(inputPath, "utf8"));

    // Create empty output structure
    let output = {
        ...rawData,
        services: []
    };

    if (fs.existsSync(outputPath)) {
        output = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    }

    const startIndex = output.services.length;

    for (let i = startIndex; i < rawData.services.length; i++) {
        console.log(
            `\n==============================`
        );
        console.log(`Humanizing service ${i + 1}/${rawData.services.length}`);
        console.log(rawData.services[i].slug);

        const humanizedService = await humanizeJson(rawData.services[i], {
            humanizerReadability: "High School",
            humanizerStrength: "Balanced"
        });

        output.services.push(humanizedService);

        // Save after every completed service
        fs.writeFileSync(
            outputPath,
            JSON.stringify(output, null, 2),
            "utf8"
        );

        console.log(
            `✅ Saved ${output.services.length}/${rawData.services.length}`
        );
    }

    console.log("🎉 All services completed.");
}