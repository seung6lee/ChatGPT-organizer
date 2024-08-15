import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readInfo = async () => {
    const filePath = path.join(
        process.cwd(),
        'src',
        'routes',
        'api',
        'info.json'
    );
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    return data;
};

export async function GET() {
    try {
        const data = await readInfo();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        console.error('File read error:', err);
        return new Response('File Not Found', { status: 404 });
    }
}