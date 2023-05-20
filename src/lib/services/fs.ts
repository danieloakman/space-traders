import { Directory, Filesystem as fs, Encoding } from '@capacitor/filesystem';

export async function writeFile(path: string, data: any, directory = Directory.Data) {
	try {
		const result = await fs.writeFile({
			path,
			directory,
			data: typeof data === 'string' ? data : JSON.stringify(data),
			encoding: Encoding.UTF8
		});
		return result.uri;
	} catch (err) {
		console.error('writeFile err:', err);
		return null;
	}
}

export async function readFile<T = any>(
	path: string,
	directory = Directory.Data,
): Promise<T | null> {
	try {
		const file = await fs.readFile({
			path,
			directory,
			encoding: Encoding.UTF8
		});
		return JSON.parse(file.data) as T;
	} catch (err) {
		console.error('readFile err:', err);
		return null;
	}
}
