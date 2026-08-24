import 'dotenv/config';
import { DataSource } from 'typeorm';
import { City } from '../entities/city.entity';
import { Neighborhood } from '../entities/neighborhood.entity';
import { CostOfLiving } from '../entities/cost-of-living.entity';
import { ClimateData } from '../entities/climate-data.entity';
import { FoodEstablishment } from '../entities/food-establishment.entity';
import { CulturalInsight } from '../entities/cultural-insight.entity';
import { CostTier, CulturalInsightCategory, InsightSeverity } from '@comfort-nomad/shared-types';

const entities = [City, Neighborhood, CostOfLiving, ClimateData, FoodEstablishment, CulturalInsight];
const useSQLite = process.env.USE_SQLITE === 'true' || !process.env.DB_HOST;

const AppDataSource = new DataSource(
  useSQLite
    ? { type: 'better-sqlite3', database: 'comfort_nomad_demo.sqlite', entities, synchronize: true } as any
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'comfort_nomad_db',
        entities,
        synchronize: true,
      }
);

async function runSeed() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const cityRepo = AppDataSource.getRepository(City);
  const neighborhoodRepo = AppDataSource.getRepository(Neighborhood);
  const costRepo = AppDataSource.getRepository(CostOfLiving);
  const climateRepo = AppDataSource.getRepository(ClimateData);
  const foodRepo = AppDataSource.getRepository(FoodEstablishment);
  const insightRepo = AppDataSource.getRepository(CulturalInsight);

  // 1. São Paulo
  let sp = await cityRepo.findOne({ where: { name: 'São Paulo' } });
  if (!sp) {
    sp = await cityRepo.save({
      name: 'São Paulo',
      country: 'Brasil',
      countryCode: 'BR',
      state: 'SP',
      lat: -23.5505,
      lng: -46.6333,
      timezone: 'America/Sao_Paulo',
      population: 12300000,
    });
    console.log('Created SP');

    // Neighborhoods
    const pinheiros = await neighborhoodRepo.save({ cityId: sp.id, name: 'Pinheiros', costTier: CostTier.MEDIUM, lat: -23.5615, lng: -46.6953 });
    await costRepo.save({ neighborhoodId: pinheiros.id, rentStudio: 2500, rentOneBedroom: 3800, groceriesMonthly: 1200, transportMonthly: 220, diningOut: 35, utilities: 280, monthlyTotal: 4035, currency: 'BRL' });

    const itaim = await neighborhoodRepo.save({ cityId: sp.id, name: 'Itaim Bibi', costTier: CostTier.HIGH, lat: -23.5835, lng: -46.6782 });
    await costRepo.save({ neighborhoodId: itaim.id, rentStudio: 4500, rentOneBedroom: 7000, groceriesMonthly: 1800, transportMonthly: 220, diningOut: 65, utilities: 350, monthlyTotal: 7070, currency: 'BRL' });

    const santoAndre = await neighborhoodRepo.save({ cityId: sp.id, name: 'Santo André', costTier: CostTier.LOW, lat: -23.6666, lng: -46.5322 });
    await costRepo.save({ neighborhoodId: santoAndre.id, rentStudio: 1400, rentOneBedroom: 2000, groceriesMonthly: 900, transportMonthly: 180, diningOut: 20, utilities: 200, monthlyTotal: 2480, currency: 'BRL' });

    // Climate
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const temps = [
      {min:22,max:29,hum:85,rain:15}, {min:22,max:29,hum:85,rain:12}, {min:21,max:28,hum:82,rain:14},
      {min:19,max:26,hum:79,rain:9}, {min:17,max:24,hum:77,rain:7}, {min:16,max:23,hum:76,rain:5},
      {min:15,max:23,hum:72,rain:4}, {min:16,max:25,hum:70,rain:4}, {min:17,max:26,hum:74,rain:8},
      {min:19,max:27,hum:79,rain:10}, {min:20,max:28,hum:82,rain:12}, {min:21,max:28,hum:84,rain:14}
    ];
    for (let i=0; i<12; i++) {
      await climateRepo.save({ cityId: sp.id, month: i+1, monthName: months[i], avgTempMin: temps[i].min, avgTempMax: temps[i].max, avgHumidity: temps[i].hum, avgRainDays: temps[i].rain });
    }

    // Food
    const spFoods = [
      { name: 'Restaurante Brasil Sabor', cats: ['Restaurant'], cuis: ['Brazilian'], tags: ['RICE_BEANS'], price: 2 },
      { name: 'Temakeria Sushi SP', cats: ['Restaurant'], cuis: ['Japanese'], tags: ['SUSHI'], price: 3 },
      { name: 'Cantina Bella Italia', cats: ['Restaurant'], cuis: ['Italian'], tags: ['PASTA'], price: 3 },
      { name: "Habib's Pinheiros", cats: ['FastFood'], cuis: ['Middle Eastern'], tags: ['SNACKS'], price: 1 },
      { name: 'Mercado Municipal de SP', cats: ['Market'], cuis: ['Various'], tags: ['ALL'], price: 2 },
      { name: 'La Guarita', cats: ['Restaurant'], cuis: ['Mexican'], tags: ['TACOS'], price: 2 },
      { name: 'Padaria Pão Quente', cats: ['Bakery'], cuis: ['Brazilian'], tags: ['BREAD'], price: 1 },
      { name: 'Green Station', cats: ['Restaurant'], cuis: ['Vegan'], tags: ['VEGAN'], price: 2 },
    ];
    for (const f of spFoods) {
      await foodRepo.save({ cityId: sp.id, name: f.name, lat: -23.5, lng: -46.6, categories: f.cats, servesCuisines: f.cuis, comfortFoodTags: f.tags, priceRange: f.price });
    }

    // Culture
    await insightRepo.save([
      { cityId: sp.id, category: CulturalInsightCategory.SOCIAL, title: 'Receptividade a Estrangeiros', description: 'São Paulo é uma das cidades mais diversas do mundo. A população é geralmente acolhedora com estrangeiros, especialmente em bairros como Pinheiros e Vila Madalena.', severity: InsightSeverity.INFO, sourceType: 'CURATED', upvotes: 42, downvotes: 3 },
      { cityId: sp.id, category: CulturalInsightCategory.SAFETY, title: 'Segurança por Bairro', description: 'A segurança varia muito entre bairros. Itaim Bibi e Pinheiros são mais seguros. Centro histórico e regiões da Cracolândia requerem atenção, especialmente à noite.', severity: InsightSeverity.CAUTION, sourceType: 'CURATED', upvotes: 87, downvotes: 5 },
      { cityId: sp.id, category: CulturalInsightCategory.CUSTOMS, title: 'Cultura de Transporte', description: 'O metrô é excelente, limpo e seguro. Uber/99 são muito usados. Evite apps de mototáxi em horários de pico. O trânsito de carro pode ser caótico.', severity: InsightSeverity.INFO, sourceType: 'CURATED', upvotes: 65, downvotes: 2 },
      { cityId: sp.id, category: CulturalInsightCategory.BUREAUCRACY, title: 'CPF é Essencial', description: 'Providencie o CPF assim que chegar. Sem ele você não consegue abrir conta bancária, assinar contratos de aluguel ou comprar um chip de celular.', severity: InsightSeverity.CAUTION, sourceType: 'CURATED', upvotes: 120, downvotes: 1 },
      { cityId: sp.id, category: CulturalInsightCategory.SOCIAL, title: 'Cultura de Final de Semana', description: 'Paulistanos adoram restaurantes, bares e eventos culturais. Parque do Ibirapuera é o ponto de encontro favorito. A vida noturna em Pinheiros e Vila Madalena é vibrante.', severity: InsightSeverity.INFO, sourceType: 'CURATED', upvotes: 55, downvotes: 4 },
      { cityId: sp.id, category: CulturalInsightCategory.LANGUAGE, title: 'Dialeto Paulistano', description: 'O sotaque paulistano é neutro e bem compreendido por falantes de português de qualquer região. Você não terá barreiras linguísticas com brasileiros.', severity: InsightSeverity.INFO, sourceType: 'CURATED', upvotes: 33, downvotes: 0 },
    ]);
  }

  // 2. Lisboa
  let lx = await cityRepo.findOne({ where: { name: 'Lisboa' } });
  if (!lx) {
    lx = await cityRepo.save({
      name: 'Lisboa',
      country: 'Portugal',
      countryCode: 'PT',
      lat: 38.7169,
      lng: -9.1399,
      timezone: 'Europe/Lisbon',
      population: 550000,
    });
    console.log('Created LX');

    // Neighborhoods
    const mouraria = await neighborhoodRepo.save({ cityId: lx.id, name: 'Mouraria', costTier: CostTier.MEDIUM, lat: 38.715, lng: -9.135 });
    await costRepo.save({ neighborhoodId: mouraria.id, rentStudio: 950, rentOneBedroom: 1400, groceriesMonthly: 400, transportMonthly: 40, diningOut: 15, utilities: 120, monthlyTotal: 1570, currency: 'EUR' });

    const chiado = await neighborhoodRepo.save({ cityId: lx.id, name: 'Chiado', costTier: CostTier.HIGH, lat: 38.710, lng: -9.141 });
    await costRepo.save({ neighborhoodId: chiado.id, rentStudio: 1800, rentOneBedroom: 2800, groceriesMonthly: 600, transportMonthly: 40, diningOut: 30, utilities: 180, monthlyTotal: 3010, currency: 'EUR' });

    const benfica = await neighborhoodRepo.save({ cityId: lx.id, name: 'Benfica', costTier: CostTier.MEDIUM, lat: 38.750, lng: -9.198 });
    await costRepo.save({ neighborhoodId: benfica.id, rentStudio: 800, rentOneBedroom: 1200, groceriesMonthly: 350, transportMonthly: 40, diningOut: 12, utilities: 110, monthlyTotal: 1510, currency: 'EUR' });

    // Climate
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const temps = [
      {min:8,max:14,hum:85,rain:12}, {min:9,max:15,hum:82,rain:10}, {min:11,max:17,hum:78,rain:9},
      {min:13,max:20,hum:72,rain:8}, {min:14,max:23,hum:67,rain:7}, {min:17,max:27,hum:60,rain:5},
      {min:19,max:30,hum:55,rain:2}, {min:19,max:30,hum:55,rain:2}, {min:18,max:27,hum:62,rain:5},
      {min:15,max:22,hum:73,rain:8}, {min:11,max:16,hum:80,rain:10}, {min:9,max:14,hum:84,rain:12}
    ];
    for (let i=0; i<12; i++) {
      await climateRepo.save({ cityId: lx.id, month: i+1, monthName: months[i], avgTempMin: temps[i].min, avgTempMax: temps[i].max, avgHumidity: temps[i].hum, avgRainDays: temps[i].rain });
    }

    // Food
    const lxFoods = [
      { name: 'Taberna da Mouraria', cats: ['Restaurant'], cuis: ['Portuguese'], tags: ['BACCALHAU'], price: 2 },
      { name: 'Cantinho do Avillez', cats: ['Restaurant'], cuis: ['Portuguese'], tags: ['FINE_DINING'], price: 4 },
      { name: 'Restaurante Brilhante', cats: ['Restaurant'], cuis: ['Brazilian'], tags: ['RICE_BEANS'], price: 2 },
      { name: 'Zé da Mouraria', cats: ['Restaurant'], cuis: ['African'], tags: ['HEARTY'], price: 2 },
      { name: 'Mercado de Campo de Ourique', cats: ['Market'], cuis: ['Various'], tags: ['ALL'], price: 2 },
      { name: 'Honorato', cats: ['Restaurant'], cuis: ['International'], tags: ['BURGER'], price: 2 },
      { name: 'Pastelaria Versailles', cats: ['Bakery'], cuis: ['Portuguese'], tags: ['BREAD'], price: 2 },
      { name: 'Jardim dos Sentidos', cats: ['Restaurant'], cuis: ['Vegan'], tags: ['VEGAN'], price: 2 },
    ];
    for (const f of lxFoods) {
      await foodRepo.save({ cityId: lx.id, name: f.name, lat: 38.7, lng: -9.1, categories: f.cats, servesCuisines: f.cuis, comfortFoodTags: f.tags, priceRange: f.price });
    }

    // Culture
    await insightRepo.save([
      { cityId: lx.id, category: CulturalInsightCategory.LANGUAGE, title: 'Português Europeu vs Brasileiro', description: 'O sotaque e vocabulário diferem bastante. Palavras como "fixe" (legal), "puto" (rapaz) e "bicha" (fila) têm significados completamente diferentes. Prepare-se para um período de adaptação linguística.', severity: InsightSeverity.INFO, sourceType: 'CURATED', upvotes: 95, downvotes: 2 },
      { cityId: lx.id, category: CulturalInsightCategory.BUREAUCRACY, title: 'Mercado Imobiliário Aquecido', description: 'Encontrar arrendamento de longa duração em Lisboa é muito difícil. Comece a procurar com 2-3 meses de antecedência. Plataformas como Idealista e OLX são as mais usadas.', severity: InsightSeverity.CAUTION, sourceType: 'CURATED', upvotes: 145, downvotes: 8 },
      { cityId: lx.id, category: CulturalInsightCategory.CUSTOMS, title: 'Impacto do Visto Gold', description: 'O programa de Golden Visa e a entrada de investimento estrangeiro elevaram muito os preços de imóveis. Chiado e Bairro Alto são os mais impactados. Considere bairros como Benfica ou Odivelas.', severity: InsightSeverity.CAUTION, sourceType: 'CURATED', upvotes: 78, downvotes: 6 },
      { cityId: lx.id, category: CulturalInsightCategory.SOCIAL, title: 'Receptividade a Brasileiros', description: 'Em geral, portugueses são acolhedores com brasileiros, especialmente fora de Lisboa. Na capital, a crescente imigração brasileira criou alguma tensão pontual, mas é exceção, não regra.', severity: InsightSeverity.INFO, sourceType: 'CURATED', upvotes: 88, downvotes: 12 },
      { cityId: lx.id, category: CulturalInsightCategory.BUREAUCRACY, title: 'AIMA (ex-SEF): Burocracia Lenta', description: 'O processo de regularização migratória em Portugal é lento. Agende um atendimento da AIMA o mais cedo possível. A espera pode ser de 6 a 12 meses. Considere contratar um advogado de imigração.', severity: InsightSeverity.WARNING, sourceType: 'CURATED', upvotes: 210, downvotes: 3 },
      { cityId: lx.id, category: CulturalInsightCategory.SAFETY, title: 'Segurança nas Zonas Turísticas', description: 'Lisboa é uma cidade muito segura. Atenção a carteiristas em Alfama, Baixa e no Tram 28. Não deixe objetos à vista nos carros. O transporte público é seguro a qualquer hora.', severity: InsightSeverity.INFO, sourceType: 'CURATED', upvotes: 67, downvotes: 1 },
    ]);
  }

  console.log('Seed completed');
  process.exit(0);
}

runSeed().catch(err => {
  console.error(err);
  process.exit(1);
});
