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
    const { slug1, slug2 } = params;

    if (slug1 === 'items') {
        try {
            const data = await readInfo();

            if (data.tags.includes(slug2)) {
                return new Response(JSON.stringify(data.items[slug2]), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                return new Response('use valid tag name', { status: 404 });
            }
        } catch (err) {
            return new Response('File Not Found', { status: 404 });
        }
    } else {
        return new Response('File Not Found', { status: 404 });
    }
}

export async function POST({ request, params }) {
    const { slug1, slug2 } = params;

    if (slug1 === 'addItem') {
        try {
            const data = await readInfo();

            if (data.tags.includes(slug2)) {
                const requestData = await request.json();

                const data = await readInfo();

                data.items[slug2].push(requestData)

                if (await writeInfo(data)) {
                    return new Response('Success');
                } else {
                    return new Response('Error');
                }
            }
        } catch (err) {
            return new Response('File Not Found', { status: 404 });
        }
    } else {
        return new Response('File Not Found', { status: 404 });
    }
}
