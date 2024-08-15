import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = path.join(process.cwd(), 'src', 'routes', 'api', 'info.json');

const readInfo = async () => {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    return data;
};

const writeInfo = async (data) => {
    try {
        await fs.promises.writeFile(filePath, JSON.stringify(data), 'utf-8');
        return true;
    } catch (err) {
        return false;
    }
};

export async function GET({ params }) {
    const { slug1 } = params;

    if (slug1 === 'tags') {
        try {
            const data = await readInfo();

            return new Response(JSON.stringify(data.tags), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (err) {
            console.error('File read error:', err);
            return new Response('File Not Found', { status: 404 });
        }
    } else if (slug1 === 'items') {
        return new Response('Please add tag name', { status: 404 });
    } else {
        return new Response('File Not Found', { status: 404 });
    }
}

export async function POST({ request, params }) {
    const { slug1 } = params;

    if (slug1 === 'addTag') {
        const requestData = await request.json();
        const tagName = requestData.tagName;

        const data = await readInfo();

        data.tags.push(tagName);
        data.items[tagName] = [];

        if (await writeInfo(data)) {
            return new Response('Success');
        } else {
            return new Response('Error');
        }
    } else {
        return new Response('File Not Found', { status: 404 });
    }
}
