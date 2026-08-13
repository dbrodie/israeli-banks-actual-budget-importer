import process from 'node:process';
import {readFileSync} from 'node:fs';
import type {Config} from './config.d.ts';

type JsonObject = Record<string, unknown>;

function isJsonObject(value: unknown): value is JsonObject {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function mergeConfig(base: JsonObject, overrides: JsonObject): JsonObject {
	const merged: JsonObject = {...base};
	for (const [key, value] of Object.entries(overrides)) {
		merged[key] = isJsonObject(value) && isJsonObject(merged[key])
			? mergeConfig(merged[key], value)
			: value;
	}

	return merged;
}

function readJson(path: string): JsonObject {
	const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
	if (!isJsonObject(parsed)) {
		throw new Error(`${path} must contain a JSON object`);
	}

	return parsed;
}

export function loadConfig(): Config {
	const settingsPath = process.env.CONFIG_PATH ?? './config.json';
	const credentialsPath = process.env.CREDENTIALS_PATH;
	const settings = readJson(settingsPath);
	const combined = credentialsPath
		? mergeConfig(settings, readJson(credentialsPath))
		: settings;
	return combined as Config;
}
