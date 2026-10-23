import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = "https://mustakuusi-3d-content.vercel.app/assets";
const outputDir = path.join(__dirname, "../public/assets");

if (!fs.existsSync(outputDir))
    fs.mkdirSync(outputDir, { recursive: true });

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let body = "";
            res.on("data", chunk => body += chunk);
            res.on("end", () => resolve(body));
        }).on("error", reject);
    });
}

function downloadAndCompress(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            const chunks = [];
            res.on("data", chunk => chunks.push(chunk));
            res.on("end", async () => {
                const buffer = Buffer.concat(chunks);
                await sharp(buffer)
                    .png({ compressionLevel: 9, quality: 80 })
                    .toFile(dest);
                resolve();
            });
        }).on("error", reject);
    });
}

async function main() {
    const body = await get(`${baseUrl}/index.json`);
    const files = JSON.parse(body);

    for (const file of files) {
        const dest = path.join(outputDir, file);
        if (fs.existsSync(dest)) {
            console.log(`Skipped: ${file}`);
            continue;
        }
        await downloadAndCompress(`${baseUrl}/${file}`, dest);
        console.log(`Downloaded & compressed: ${file}`);
    }
}

main();