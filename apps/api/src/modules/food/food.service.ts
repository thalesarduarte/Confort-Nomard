import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodEstablishment } from '../../database/entities/food-establishment.entity';
import { City } from '../../database/entities/city.entity';

const OVERPASS_TIMEOUT_MS = 10_000;
const MAX_OSM_RESULTS = 30;

@Injectable()
export class FoodService {
  private readonly logger = new Logger(FoodService.name);

  constructor(
    @InjectRepository(FoodEstablishment)
    private foodRepo: Repository<FoodEstablishment>,
    @InjectRepository(City)
    private cityRepo: Repository<City>,
  ) {}

  async getEstablishments(cityId: string): Promise<FoodEstablishment[]> {
    const existing = await this.foodRepo.find({ where: { cityId } });
    if (existing.length > 0) return existing;

    // ── Fallback: fetch restaurants/cafes from Overpass / OpenStreetMap ──
    try {
      const city = await this.cityRepo.findOne({ where: { id: cityId } });
      if (!city) return [];

      const radiusM = 5000;
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="restaurant"](around:${radiusM},${city.lat},${city.lng});
          node["amenity"="cafe"](around:${radiusM},${city.lat},${city.lng});
        );
        out body ${MAX_OSM_RESULTS};
      `.trim();

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);

      let json: any;
      try {
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
          headers: { 'Content-Type': 'text/plain' },
          signal: controller.signal,
        });
        json = await res.json();
      } finally {
        clearTimeout(timeout);
      }

      const elements: any[] = json?.elements ?? [];
      if (elements.length === 0) return [];

      const records: FoodEstablishment[] = [];
      for (const el of elements.slice(0, MAX_OSM_RESULTS)) {
        const name: string = el.tags?.name ?? el.tags?.['name:en'] ?? 'Unnamed';
        const cuisine: string = el.tags?.cuisine ?? '';
        const cuisines = cuisine ? cuisine.split(';').map((s: string) => s.trim()).filter(Boolean) : ['Restaurant'];
        const amenity: string = el.tags?.amenity ?? 'restaurant';

        const record = this.foodRepo.create({
          cityId,
          name,
          lat: el.lat ?? city.lat,
          lng: el.lon ?? city.lng,
          categories: [amenity === 'cafe' ? 'Cafe' : 'Restaurant'],
          servesCuisines: cuisines,
          comfortFoodTags: [],   // OSM doesn't have comfort food tags
          priceRange: 2,         // default mid-range; no reliable OSM price data
          verifiedOrigin: false,
          address: el.tags?.['addr:street'] ?? '',
        });
        records.push(record);
      }

      await this.foodRepo.save(records);
      this.logger.log(`Fetched and cached ${records.length} Overpass establishments for city ${city.name}`);
      return records;
    } catch (err) {
      this.logger.warn(`Overpass fallback failed for city ${cityId}: ${err?.message ?? err}`);
      return [];
    }
  }

  async calculateFoodCompatibility(cityId: string, comfortFoods: string[]) {
    if (!comfortFoods || comfortFoods.length === 0) return { score: 100, matchedTags: [] };

    const establishments = await this.getEstablishments(cityId);

    const availableTags = new Set<string>();
    establishments.forEach(est => {
      est.comfortFoodTags.forEach(tag => availableTags.add(tag));
    });

    let matched = 0;
    const matchedTags: string[] = [];
    comfortFoods.forEach(food => {
      if (availableTags.has(food)) {
        matched++;
        matchedTags.push(food);
      }
    });

    const score = comfortFoods.length > 0 ? (matched / comfortFoods.length) * 100 : 100;
    return { score, matchedTags };
  }
}
