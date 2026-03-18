import CarSizeConfig from "../models/CarSizeConfig.js";
import type { CarSize } from "../types/index";

const FALLBACK_DURATIONS: Record<CarSize, number> = {
    small: 60,
    regular: 90,
    big: 105,
};

let cache: Record<string, number> | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 60_000; // 60 seconds

export async function getDurationMinutes(carSize: CarSize): Promise<number> {
    const now = Date.now();
    if (cache && now < cacheExpiry) {
        return cache[carSize] ?? FALLBACK_DURATIONS[carSize];
    }

    const configs = await CarSizeConfig.find();
    cache = {};
    for (const config of configs) {
        cache[config.key] = config.durationMinutes;
    }
    cacheExpiry = now + CACHE_TTL;

    return cache[carSize] ?? FALLBACK_DURATIONS[carSize];
}

export function clearDurationCache(): void {
    cache = null;
    cacheExpiry = 0;
}
