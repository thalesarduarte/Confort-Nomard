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

  // ── 1. São Paulo ──────────────────────────────────────────────────────────
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
      imageUrl: 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?w=800',
    });
    console.log('Created SP');

    const pinheiros = await neighborhoodRepo.save({ cityId: sp.id, name: 'Pinheiros', costTier: CostTier.MEDIUM, lat: -23.5615, lng: -46.6953 });
    await costRepo.save({ neighborhoodId: pinheiros.id, rentStudio: 2500, rentOneBedroom: 3800, groceriesMonthly: 1200, transportMonthly: 220, diningOut: 35, utilities: 280, monthlyTotal: 4035, currency: 'BRL' });

    const itaim = await neighborhoodRepo.save({ cityId: sp.id, name: 'Itaim Bibi', costTier: CostTier.HIGH, lat: -23.5835, lng: -46.6782 });
    await costRepo.save({ neighborhoodId: itaim.id, rentStudio: 4500, rentOneBedroom: 7000, groceriesMonthly: 1800, transportMonthly: 220, diningOut: 65, utilities: 350, monthlyTotal: 7070, currency: 'BRL' });

    const santoAndre = await neighborhoodRepo.save({ cityId: sp.id, name: 'Santo André', costTier: CostTier.LOW, lat: -23.6666, lng: -46.5322 });
    await costRepo.save({ neighborhoodId: santoAndre.id, rentStudio: 1400, rentOneBedroom: 2000, groceriesMonthly: 900, transportMonthly: 180, diningOut: 20, utilities: 200, monthlyTotal: 2480, currency: 'BRL' });

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

    await insightRepo.save([
      { cityId: sp.id, category: CulturalInsightCategory.SOCIAL, title: 'Receptividade a Estrangeiros', description: 'São Paulo é uma das cidades mais diversas do mundo. A população é geralmente acolhedora com estrangeiros, especialmente em bairros como Pinheiros e Vila Madalena.', severity: InsightSeverity.INFO, sourceType: 'CURATED', upvotes: 42, downvotes: 3 },
      { cityId: sp.id, category: CulturalInsightCategory.SAFETY, title: 'Segurança por Bairro', description: 'A segurança varia muito entre bairros. Itaim Bibi e Pinheiros são mais seguros. Centro histórico e regiões da Cracolândia requerem atenção, especialmente à noite.', severity: InsightSeverity.CAUTION, sourceType: 'CURATED', upvotes: 87, downvotes: 5 },
      { cityId: sp.id, category: CulturalInsightCategory.CUSTOMS, title: 'Cultura de Transporte', description: 'O metrô é excelente, limpo e seguro. Uber/99 são muito usados. Evite apps de mototáxi em horários de pico. O trânsito de carro pode ser caótico.', severity: InsightSeverity.INFO, sourceType: 'CURATED', upvotes: 65, downvotes: 2 },
      { cityId: sp.id, category: CulturalInsightCategory.BUREAUCRACY, title: 'CPF é Essencial', description: 'Providencie o CPF assim que chegar. Sem ele você não consegue abrir conta bancária, assinar contratos de aluguel ou comprar um chip de celular.', severity: InsightSeverity.CAUTION, sourceType: 'CURATED', upvotes: 120, downvotes: 1 },
      { cityId: sp.id, category: CulturalInsightCategory.SOCIAL, title: 'Cultura de Final de Semana', description: 'Paulistanos adoram restaurantes, bares e eventos culturais. Parque do Ibirapuera é o ponto de encontro favorito. A vida noturna em Pinheiros e Vila Madalena é vibrante.', severity: InsightSeverity.INFO, sourceType: 'CURATED', upvotes: 55, downvotes: 4 },
      { cityId: sp.id, category: CulturalInsightCategory.LANGUAGE, title: 'Dialeto Paulistano', description: 'O sotaque paulistano é neutro e bem compreendido por falantes de português de qualquer região. Você não terá barreiras linguísticas com brasileiros.', severity: InsightSeverity.INFO, sourceType: 'CURATED', upvotes: 33, downvotes: 0 },
    ]);
  }

  // ── 2. Lisboa ─────────────────────────────────────────────────────────────
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
      imageUrl: 'https://images.unsplash.com/photo-1585218356057-dc0e8d355888?w=800',
    });
    console.log('Created LX');

    const mouraria = await neighborhoodRepo.save({ cityId: lx.id, name: 'Mouraria', costTier: CostTier.MEDIUM, lat: 38.715, lng: -9.135 });
    await costRepo.save({ neighborhoodId: mouraria.id, rentStudio: 950, rentOneBedroom: 1400, groceriesMonthly: 400, transportMonthly: 40, diningOut: 15, utilities: 120, monthlyTotal: 1570, currency: 'EUR' });

    const chiado = await neighborhoodRepo.save({ cityId: lx.id, name: 'Chiado', costTier: CostTier.HIGH, lat: 38.710, lng: -9.141 });
    await costRepo.save({ neighborhoodId: chiado.id, rentStudio: 1800, rentOneBedroom: 2800, groceriesMonthly: 600, transportMonthly: 40, diningOut: 30, utilities: 180, monthlyTotal: 3010, currency: 'EUR' });

    const benfica = await neighborhoodRepo.save({ cityId: lx.id, name: 'Benfica', costTier: CostTier.MEDIUM, lat: 38.750, lng: -9.198 });
    await costRepo.save({ neighborhoodId: benfica.id, rentStudio: 800, rentOneBedroom: 1200, groceriesMonthly: 350, transportMonthly: 40, diningOut: 12, utilities: 110, monthlyTotal: 1510, currency: 'EUR' });

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

    await insightRepo.save([
      { cityId: lx.id, category: CulturalInsightCategory.LANGUAGE, title: 'Português Europeu vs Brasileiro', description: 'O sotaque e vocabulário diferem bastante. Palavras como "fixe" (legal), "puto" (rapaz) e "bicha" (fila) têm significados completamente diferentes. Prepare-se para um período de adaptação linguística.', severity: InsightSeverity.INFO, sourceType: 'CURATED', upvotes: 95, downvotes: 2 },
      { cityId: lx.id, category: CulturalInsightCategory.BUREAUCRACY, title: 'Mercado Imobiliário Aquecido', description: 'Encontrar arrendamento de longa duração em Lisboa é muito difícil. Comece a procurar com 2-3 meses de antecedência. Plataformas como Idealista e OLX são as mais usadas.', severity: InsightSeverity.CAUTION, sourceType: 'CURATED', upvotes: 145, downvotes: 8 },
      { cityId: lx.id, category: CulturalInsightCategory.CUSTOMS, title: 'Impacto do Visto Gold', description: 'O programa de Golden Visa e a entrada de investimento estrangeiro elevaram muito os preços de imóveis. Chiado e Bairro Alto são os mais impactados. Considere bairros como Benfica ou Odivelas.', severity: InsightSeverity.CAUTION, sourceType: 'CURATED', upvotes: 78, downvotes: 6 },
      { cityId: lx.id, category: CulturalInsightCategory.SOCIAL, title: 'Receptividade a Brasileiros', description: 'Em geral, portugueses são acolhedores com brasileiros, especialmente fora de Lisboa. Na capital, a crescente imigração brasileira criou alguma tensão pontual, mas é exceção, não regra.', severity: InsightSeverity.INFO, sourceType: 'CURATED', upvotes: 88, downvotes: 12 },
      { cityId: lx.id, category: CulturalInsightCategory.BUREAUCRACY, title: 'AIMA (ex-SEF): Burocracia Lenta', description: 'O processo de regularização migratória em Portugal é lento. Agende um atendimento da AIMA o mais cedo possível. A espera pode ser de 6 a 12 meses. Considere contratar um advogado de imigração.', severity: InsightSeverity.WARNING, sourceType: 'CURATED', upvotes: 210, downvotes: 3 },
      { cityId: lx.id, category: CulturalInsightCategory.SAFETY, title: 'Segurança nas Zonas Turísticas', description: 'Lisboa é uma cidade muito segura. Atenção a carteiristas em Alfama, Baixa e no Tram 28. Não deixe objetos à vista nos carros. O transporte público é seguro a qualquer hora.', severity: InsightSeverity.INFO, sourceType: 'CURATED', upvotes: 67, downvotes: 1 },
    ]);
  }

  // ── Helper to seed cities without climate/food (fetched automatically via Open-Meteo/Overpass) ──

  async function seedCity(data: {
    name: string; country: string; countryCode: string; state?: string;
    lat: number; lng: number; timezone: string; population: number; imageUrl: string;
    neighborhoods: { name: string; tier: CostTier; lat: number; lng: number; rent1br: number; groceries: number; transport: number; utilities: number; currency: string }[];
    insights: { category: CulturalInsightCategory; title: string; description: string; severity: InsightSeverity }[];
  }) {
    let city = await cityRepo.findOne({ where: { name: data.name } });
    if (city) return;

    city = await cityRepo.save({
      name: data.name, country: data.country, countryCode: data.countryCode,
      state: data.state, lat: data.lat, lng: data.lng, timezone: data.timezone,
      population: data.population, imageUrl: data.imageUrl,
    });
    console.log(`Created ${data.name}`);

    for (const nb of data.neighborhoods) {
      const n = await neighborhoodRepo.save({ cityId: city.id, name: nb.name, costTier: nb.tier, lat: nb.lat, lng: nb.lng });
      const total = nb.rent1br + nb.groceries + nb.transport + nb.utilities;
      await costRepo.save({ neighborhoodId: n.id, rentStudio: Math.round(nb.rent1br * 0.7), rentOneBedroom: nb.rent1br, groceriesMonthly: nb.groceries, transportMonthly: nb.transport, diningOut: Math.round(nb.groceries * 0.3), utilities: nb.utilities, monthlyTotal: total, currency: nb.currency });
    }

    await insightRepo.save(data.insights.map(ins => ({ ...ins, cityId: city!.id, sourceType: 'CURATED', upvotes: 0, downvotes: 0 })));
  }

  // ── 3. Rio de Janeiro ──────────────────────────────────────────────────────
  await seedCity({
    name: 'Rio de Janeiro', country: 'Brasil', countryCode: 'BR', state: 'RJ',
    lat: -22.9068, lng: -43.1729, timezone: 'America/Sao_Paulo', population: 6700000,
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
    neighborhoods: [
      { name: 'Ipanema', tier: CostTier.HIGH, lat: -22.9835, lng: -43.2044, rent1br: 5500, groceries: 1600, transport: 200, utilities: 320, currency: 'BRL' },
      { name: 'Santa Teresa', tier: CostTier.MEDIUM, lat: -22.9196, lng: -43.1811, rent1br: 2800, groceries: 1100, transport: 200, utilities: 250, currency: 'BRL' },
      { name: 'Madureira', tier: CostTier.LOW, lat: -22.8676, lng: -43.3345, rent1br: 1500, groceries: 800, transport: 180, utilities: 180, currency: 'BRL' },
    ],
    insights: [
      { category: CulturalInsightCategory.SAFETY, title: 'Segurança por Zona', description: 'A Zona Sul (Ipanema, Leblon, Copacabana) é relativamente segura. Evite favelas sem guia local e nunca exiba celular ou carteira em praias lotadas. O transporte público é menos seguro à noite.', severity: InsightSeverity.WARNING },
      { category: CulturalInsightCategory.SOCIAL, title: 'Cultura da Praia', description: 'A praia não é só lazer — é o centro social do carioca. Funcionam como praças: academia, mercado de trabalho informal, festas. Aprenda a se comportar em cada trecho (famílias, esportes, LGBT+).', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Horário Carioca', description: 'No Rio, "agora" pode significar qualquer coisa. Reuniões e compromissos informais raramente começam no horário. Atrasos de 20-30 minutos são normais e esperados socialmente.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.BUREAUCRACY, title: 'Moradia: Fiador ou Seguro', description: 'Para alugar, você precisa de fiador carioca ou seguro-fiança (que custa 1-2 meses extras). Airbnb de longo prazo pode ser mais prático para os primeiros meses.', severity: InsightSeverity.CAUTION },
    ],
  });

  // ── 4. Buenos Aires ────────────────────────────────────────────────────────
  await seedCity({
    name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR',
    lat: -34.6037, lng: -58.3816, timezone: 'America/Argentina/Buenos_Aires', population: 3000000,
    imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',
    neighborhoods: [
      { name: 'Palermo', tier: CostTier.HIGH, lat: -34.5889, lng: -58.4220, rent1br: 650, groceries: 200, transport: 30, utilities: 60, currency: 'USD' },
      { name: 'San Telmo', tier: CostTier.MEDIUM, lat: -34.6218, lng: -58.3716, rent1br: 450, groceries: 160, transport: 30, utilities: 50, currency: 'USD' },
      { name: 'Floresta', tier: CostTier.LOW, lat: -34.6327, lng: -58.4729, rent1br: 280, groceries: 130, transport: 25, utilities: 40, currency: 'USD' },
    ],
    insights: [
      { category: CulturalInsightCategory.BUREAUCRACY, title: 'Dólar Blue vs Oficial', description: 'A Argentina tem múltiplas taxas de câmbio. O "dólar blue" (câmbio paralelo) pode ser 2x o oficial. Trocar em casas de câmbio informais ("cuevas") é tecnicamente ilegal mas amplamente praticado. Informe-se bem antes de chegar.', severity: InsightSeverity.WARNING },
      { category: CulturalInsightCategory.SOCIAL, title: 'Cultura do Asado', description: 'O asado (churrasco argentino) é uma instituição social. Recusar um convite é descortês. A refeição pode durar 3-5 horas e é sempre acompanhada de vinho Malbec. Aprecie o ritual — não é só comida, é comunidade.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Horário Noturno Extremo', description: 'Portenhos jantam entre 21h e 23h. Restaurantes lotam depois das 22h. Boates abrem às 2h e ficam cheias a partir das 3h. Se você sai às 23h, é considerado cedo demais.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.BUREAUCRACY, title: 'Inflação e Preços Voláteis', description: 'A inflação argentina pode superar 100% ao ano. Preços de aluguel são frequentemente negociados em dólar. Guarde dólares físicos — são a moeda de reserva real da população.', severity: InsightSeverity.CAUTION },
    ],
  });

  // ── 5. Santiago ────────────────────────────────────────────────────────────
  await seedCity({
    name: 'Santiago', country: 'Chile', countryCode: 'CL',
    lat: -33.4489, lng: -70.6693, timezone: 'America/Santiago', population: 6200000,
    imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
    neighborhoods: [
      { name: 'Providencia', tier: CostTier.HIGH, lat: -33.4311, lng: -70.6115, rent1br: 700, groceries: 250, transport: 50, utilities: 70, currency: 'USD' },
      { name: 'Ñuñoa', tier: CostTier.MEDIUM, lat: -33.4553, lng: -70.5970, rent1br: 500, groceries: 200, transport: 50, utilities: 60, currency: 'USD' },
      { name: 'Puente Alto', tier: CostTier.LOW, lat: -33.5846, lng: -70.5759, rent1br: 300, groceries: 160, transport: 50, utilities: 45, currency: 'USD' },
    ],
    insights: [
      { category: CulturalInsightCategory.SAFETY, title: 'Smog e Qualidade do Ar', description: 'Santiago fica numa bacia rodeada pela Cordilheira. No inverno (maio-agosto), episódios de smog são comuns. Acompanhe o Índice de Calidad del Aire (ICA). Pessoas com problemas respiratórios devem ter cuidado extra.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.SOCIAL, title: 'Formalidade Chilena', description: 'Chilenos são mais reservados do que outros sul-americanos. O relacionamento se aprofunda lentamente — não espere intimidade imediata. "Compadre" é um termo de afeto para amigos próximos, nunca para conhecidos.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.BUREAUCRACY, title: 'RUT: o CPF Chileno', description: 'O Rol Único Tributario (RUT) é necessário para alugar apartamentos, abrir conta bancária e assinar qualquer contrato. Solicite logo nos primeiros dias — requer um processo no Registro Civil.', severity: InsightSeverity.CAUTION },
    ],
  });

  // ── 6. Bogotá ──────────────────────────────────────────────────────────────
  await seedCity({
    name: 'Bogotá', country: 'Colômbia', countryCode: 'CO',
    lat: 4.7110, lng: -74.0721, timezone: 'America/Bogota', population: 7400000,
    imageUrl: 'https://images.unsplash.com/photo-1561832772-d01a2c4dd7cb?w=800',
    neighborhoods: [
      { name: 'Chapinero', tier: CostTier.HIGH, lat: 4.6473, lng: -74.0655, rent1br: 550, groceries: 200, transport: 30, utilities: 60, currency: 'USD' },
      { name: 'La Candelaria', tier: CostTier.LOW, lat: 4.5981, lng: -74.0761, rent1br: 250, groceries: 130, transport: 25, utilities: 40, currency: 'USD' },
      { name: 'Usaquén', tier: CostTier.HIGH, lat: 4.6944, lng: -74.0315, rent1br: 700, groceries: 230, transport: 30, utilities: 70, currency: 'USD' },
    ],
    insights: [
      { category: CulturalInsightCategory.SAFETY, title: 'Altitude e Aclimatação', description: 'Bogotá fica a 2.600m de altitude. Nos primeiros dias, é comum sentir dor de cabeça, falta de ar e tontura (soroche). Descanse bastante, beba muita água e evite álcool e exercícios intensos na primeira semana.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.SOCIAL, title: 'Rolo (trânsito) e Ciclovias', description: 'O congestionamento em Bogotá é legendário. A cidade tem uma das maiores redes de ciclovias da América Latina — usar bicicleta é prático e cultural. Aos domingos, a Ciclovía fecha 120km de ruas para ciclistas e caminhantes.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Tinto: Café Colombiano', description: '"Tinto" é o nome dado ao café coado simples. Recusar um tinto oferecido é descortês. O café colombiano é motivo de orgulho nacional — aproveite para se encantar com a diversidade de regiões produtoras.', severity: InsightSeverity.INFO },
    ],
  });

  // ── 7. Lima ────────────────────────────────────────────────────────────────
  await seedCity({
    name: 'Lima', country: 'Peru', countryCode: 'PE',
    lat: -12.0464, lng: -77.0428, timezone: 'America/Lima', population: 10000000,
    imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
    neighborhoods: [
      { name: 'Miraflores', tier: CostTier.HIGH, lat: -18.1184, lng: -70.2937, rent1br: 700, groceries: 250, transport: 40, utilities: 70, currency: 'USD' },
      { name: 'Barranco', tier: CostTier.MEDIUM, lat: -12.1522, lng: -77.0213, rent1br: 500, groceries: 200, transport: 35, utilities: 60, currency: 'USD' },
      { name: 'San Miguel', tier: CostTier.LOW, lat: -12.0835, lng: -77.0857, rent1br: 350, groceries: 160, transport: 35, utilities: 50, currency: 'USD' },
    ],
    insights: [
      { category: CulturalInsightCategory.SOCIAL, title: 'Gastronomia Mundial', description: 'Lima é reconhecida como capital gastronômica da América Latina. Ceviche, lomo saltado e causa são patrimônios culturais. A cena de restaurantes é diversa — de mercados populares a restaurantes estrelados por preços acessíveis.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Garúa: A Névoa de Lima', description: 'De maio a novembro, Lima fica coberta por uma neblina (garúa) que traz frio úmido sem chuva. O céu fica cinza por meses. Quem vem do Brasil pode sentir um impacto emocional — prepare-se emocionalmente para a ausência de sol.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.SAFETY, title: 'Transporte Urbano', description: 'O trânsito em Lima é caótico. O Metropolitano (BRT) e o Metro são as opções mais seguras. Táxis sem aplicativo podem ser perigosos — prefira InDrive, Beat ou Cabify. Nunca aceite carona de táxi que parou espontaneamente.', severity: InsightSeverity.WARNING },
    ],
  });

  // ── 8. Ciudad de México ────────────────────────────────────────────────────
  await seedCity({
    name: 'Ciudad de México', country: 'México', countryCode: 'MX',
    lat: 19.4326, lng: -99.1332, timezone: 'America/Mexico_City', population: 9200000,
    imageUrl: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800',
    neighborhoods: [
      { name: 'Condesa', tier: CostTier.HIGH, lat: 19.4118, lng: -99.1772, rent1br: 800, groceries: 280, transport: 40, utilities: 80, currency: 'USD' },
      { name: 'Roma Norte', tier: CostTier.HIGH, lat: 19.4194, lng: -99.1641, rent1br: 750, groceries: 260, transport: 40, utilities: 75, currency: 'USD' },
      { name: 'Tepito', tier: CostTier.LOW, lat: 19.4453, lng: -99.1213, rent1br: 280, groceries: 150, transport: 30, utilities: 50, currency: 'USD' },
    ],
    insights: [
      { category: CulturalInsightCategory.CUSTOMS, title: 'Chilangos e Tacos de Canasta', description: '"Chilango" é o gentílico para quem nasce na CDMX — nem sempre considerado ofensivo, mas use com cuidado. Os tacos de canasta são um ritual de café da manhã. Aprenda a pedir "sin cilantro" se necessário.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.SAFETY, title: 'Sismos', description: 'Cidade do México fica em zona sísmica altamente ativa. Cada edifício tem pontos de evacuação marcados. Aprenda onde fica a saída de emergência do seu apartamento. O alerta sísmico (Alerta Sísmica) é testado mensalmente.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.BUREAUCRACY, title: 'CURP e RFC', description: 'Para trabalhar ou morar legalmente, você precisará do CURP (Clave Única de Registro de Población) e eventualmente do RFC fiscal. O processo de regularização migratória exige marcar atendimento no INM com meses de antecedência.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.SOCIAL, title: 'Altitude e Aclimatação (2240m)', description: 'A CDMX fica a 2.240m acima do nível do mar. Exercícios intensos nos primeiros dias causam cansaço excessivo. Bebidas alcoólicas afetam mais do que em altitude zero. Hidrate-se bem.', severity: InsightSeverity.INFO },
    ],
  });

  // ── 9. New York ────────────────────────────────────────────────────────────
  await seedCity({
    name: 'New York', country: 'United States', countryCode: 'US', state: 'NY',
    lat: 40.7128, lng: -74.0060, timezone: 'America/New_York', population: 8300000,
    imageUrl: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800',
    neighborhoods: [
      { name: 'Brooklyn', tier: CostTier.MEDIUM, lat: 40.6501, lng: -73.9496, rent1br: 2800, groceries: 600, transport: 127, utilities: 150, currency: 'USD' },
      { name: 'Queens', tier: CostTier.MEDIUM, lat: 40.7282, lng: -73.7949, rent1br: 2200, groceries: 550, transport: 127, utilities: 140, currency: 'USD' },
      { name: 'Manhattan', tier: CostTier.HIGH, lat: 40.7831, lng: -73.9712, rent1br: 4200, groceries: 800, transport: 127, utilities: 200, currency: 'USD' },
    ],
    insights: [
      { category: CulturalInsightCategory.BUREAUCRACY, title: 'SSN e Crédito: o Paradoxo do Imigrante', description: 'Para alugar apartamento precisa de histórico de crédito. Para ter crédito precisa de SSN. Para ter SSN precisa de visto de trabalho. Solução comum: pagar 2-3 meses de depósito adiantado ou ter um fiador americano.', severity: InsightSeverity.WARNING },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Gorjeta é Obrigatória', description: 'Em restaurantes, bares e táxis, gorjeta de 18-20% é socialmente obrigatória — não é opcional. Garçons nos EUA recebem salário mínimo abaixo do padrão nacional porque a gorjeta é considerada parte do salário.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.SOCIAL, title: 'Metrô 24h: um Mundo Paralelo', description: 'O metrô de NYC funciona 24 horas por dia, 7 dias por semana — único do mundo. Às 3h da manhã, você encontrará artistas, trabalhadores de turno noturno e todos os tipos de nova-iorquinos. É seguro na maior parte das linhas.', severity: InsightSeverity.INFO },
    ],
  });

  // ── 10. Toronto ────────────────────────────────────────────────────────────
  await seedCity({
    name: 'Toronto', country: 'Canada', countryCode: 'CA', state: 'ON',
    lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto', population: 2900000,
    imageUrl: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800',
    neighborhoods: [
      { name: 'Kensington Market', tier: CostTier.MEDIUM, lat: 43.6547, lng: -79.4009, rent1br: 1900, groceries: 500, transport: 156, utilities: 130, currency: 'CAD' },
      { name: 'Scarborough', tier: CostTier.LOW, lat: 43.7731, lng: -79.2575, rent1br: 1400, groceries: 400, transport: 156, utilities: 110, currency: 'CAD' },
      { name: 'Yorkville', tier: CostTier.HIGH, lat: 43.6726, lng: -79.3919, rent1br: 3200, groceries: 700, transport: 156, utilities: 180, currency: 'CAD' },
    ],
    insights: [
      { category: CulturalInsightCategory.CUSTOMS, title: 'A Cultura do "Sorry"', description: 'Canadenses pedem desculpas por absolutamente tudo — inclusive se você esbarra neles. O "sorry" canadense é um lubrificante social, não necessariamente um pedido de desculpas genuíno. Não se surpreenda.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.SOCIAL, title: 'Multiculturalismo Real', description: 'Toronto é uma das cidades mais diversas do mundo — quase metade da população nasceu fora do Canadá. Kensington Market, Chinatown, Little Portugal e Little Italy são bairros vibrantes e acessíveis. O multiculturalismo aqui é uma política de Estado, não retórica.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Inverno de -20°C', description: 'De dezembro a março, temperaturas abaixo de -15°C são comuns, com sensação térmica chegando a -25°C. Invista em casaco parka com capuz de pele, botas impermeáveis e luvas grossas. O PATH (rede subterrânea) permite andar pelo centro sem sair para o frio.', severity: InsightSeverity.CAUTION },
    ],
  });

  // ── 11. San Francisco ──────────────────────────────────────────────────────
  await seedCity({
    name: 'San Francisco', country: 'United States', countryCode: 'US', state: 'CA',
    lat: 37.7749, lng: -122.4194, timezone: 'America/Los_Angeles', population: 870000,
    imageUrl: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800',
    neighborhoods: [
      { name: 'Mission District', tier: CostTier.HIGH, lat: 37.7599, lng: -122.4148, rent1br: 3200, groceries: 700, transport: 100, utilities: 150, currency: 'USD' },
      { name: 'Tenderloin', tier: CostTier.MEDIUM, lat: 37.7831, lng: -122.4133, rent1br: 2200, groceries: 600, transport: 100, utilities: 130, currency: 'USD' },
      { name: 'Sunset District', tier: CostTier.MEDIUM, lat: 37.7519, lng: -122.4935, rent1br: 2600, groceries: 620, transport: 100, utilities: 140, currency: 'USD' },
    ],
    insights: [
      { category: CulturalInsightCategory.SOCIAL, title: 'Cultura Tech e Gentrificação', description: 'SF é o epicentro global da tecnologia. Isso criou uma fissura social profunda: trabalhadores tech com salários de 6 dígitos compartilham calçadas com uma das maiores populações de sem-teto dos EUA. A tensão é palpável e frequente tema de debate.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Microclimaas e o "Karl"', description: 'SF tem microclimaas hyper-locais. O bairro Mission pode estar com 25°C enquanto o Sunset District está a 12°C com neblina. "Karl the Fog" é o nome carinhoso da névoa famosa da cidade. Sempre carregue uma jaqueta.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.BUREAUCRACY, title: 'Custo de Vida Extremo', description: 'SF é uma das cidades mais caras dos EUA. Aluguel de 1 quarto raramente fica abaixo de $2.500. Muitos profissionais de tech moram em Oakland ou Berkeley e tomam BART. Calcule com cuidado antes de se mudar.', severity: InsightSeverity.WARNING },
    ],
  });

  // ── 12. Berlin ─────────────────────────────────────────────────────────────
  await seedCity({
    name: 'Berlin', country: 'Germany', countryCode: 'DE',
    lat: 52.5200, lng: 13.4050, timezone: 'Europe/Berlin', population: 3700000,
    imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800',
    neighborhoods: [
      { name: 'Kreuzberg', tier: CostTier.MEDIUM, lat: 52.4996, lng: 13.4074, rent1br: 1100, groceries: 350, transport: 86, utilities: 130, currency: 'EUR' },
      { name: 'Prenzlauer Berg', tier: CostTier.HIGH, lat: 52.5390, lng: 13.4233, rent1br: 1400, groceries: 400, transport: 86, utilities: 150, currency: 'EUR' },
      { name: 'Marzahn', tier: CostTier.LOW, lat: 52.5411, lng: 13.5689, rent1br: 750, groceries: 280, transport: 86, utilities: 100, currency: 'EUR' },
    ],
    insights: [
      { category: CulturalInsightCategory.SOCIAL, title: 'Berliner Schnauze', description: 'Os berlinenses têm fama de diretos ao ponto de parecer rudes. Não é grosseria — é eficiência cultural. Cumprimentos longos são vistos como perda de tempo. Com o tempo, você descobre uma lealdade e humor irônicos únicos.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Ruhe: Silêncio é Lei', description: 'Há regras rígidas de silêncio: sem barulho após 22h, sem lavanderia ou furadeira aos domingos e feriados (Ruhezeiten). Seus vizinhos podem chamar a polícia — e vão. Conheça o regulamento do seu prédio (Hausordnung).', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.LANGUAGE, title: 'Alemão é Necessário', description: 'Burocracia, médicos, contratos e cartórios: tudo em alemão. Inglês funciona em startups e bares, mas o sistema oficial raramente acomoda quem não fala alemão. Invista no idioma desde o início — aulas de A1 a B1 são acessíveis (e subsidiadas para residentes).', severity: InsightSeverity.WARNING },
      { category: CulturalInsightCategory.BUREAUCRACY, title: 'Anmeldung: Registro Obrigatório', description: 'Você deve se registrar (Anmeldung) na prefeitura do seu distrito em até 2 semanas após mudar de endereço. Sem isso, você não consegue abrir conta bancária, receber salário ou acessar serviços públicos. Leve seu contrato de aluguel e passaporte.', severity: InsightSeverity.WARNING },
    ],
  });

  // ── 13. Barcelona ──────────────────────────────────────────────────────────
  await seedCity({
    name: 'Barcelona', country: 'Spain', countryCode: 'ES',
    lat: 41.3851, lng: 2.1734, timezone: 'Europe/Madrid', population: 1600000,
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
    neighborhoods: [
      { name: 'Gràcia', tier: CostTier.MEDIUM, lat: 41.4027, lng: 2.1558, rent1br: 1100, groceries: 350, transport: 80, utilities: 120, currency: 'EUR' },
      { name: 'Eixample', tier: CostTier.HIGH, lat: 41.3930, lng: 2.1606, rent1br: 1600, groceries: 420, transport: 80, utilities: 150, currency: 'EUR' },
      { name: 'Sant Andreu', tier: CostTier.LOW, lat: 41.4343, lng: 2.1876, rent1br: 800, groceries: 290, transport: 80, utilities: 100, currency: 'EUR' },
    ],
    insights: [
      { category: CulturalInsightCategory.LANGUAGE, title: 'Catalão vs Castelhano', description: 'Barcelona é bilíngue: catalão e espanhol (castelhano). Placas, menus e atendimento público usam catalão. Falar espanhol funciona bem, mas aprender algumas palavras em catalão ("gràcies", "bon dia") é muito valorizado pelos locais.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Horário Espanhol Extremo', description: 'Almoço das 14h-16h (com siesta em alguns comércios), jantar às 21h-23h. Muitos restaurantes só abrem para jantar após as 20h30. Se você tentar comer às 18h, estará sozinho — ou o restaurante estará fechado.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.SOCIAL, title: 'Turismo de Massa e Tensão Local', description: 'Barcelona recebe mais de 30 milhões de turistas ao ano para uma cidade de 1,6 milhão. Há uma tensão real entre moradores e turistas — manifestações contra o turismo de massa são frequentes. Evite se comportar como turista clássico em bairros residenciais.', severity: InsightSeverity.CAUTION },
    ],
  });

  // ── 14. Amsterdam ──────────────────────────────────────────────────────────
  await seedCity({
    name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL',
    lat: 52.3676, lng: 4.9041, timezone: 'Europe/Amsterdam', population: 870000,
    imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
    neighborhoods: [
      { name: 'De Pijp', tier: CostTier.HIGH, lat: 52.3545, lng: 4.8986, rent1br: 1700, groceries: 450, transport: 100, utilities: 160, currency: 'EUR' },
      { name: 'Oost', tier: CostTier.MEDIUM, lat: 52.3614, lng: 4.9401, rent1br: 1300, groceries: 380, transport: 100, utilities: 140, currency: 'EUR' },
      { name: 'Noord', tier: CostTier.MEDIUM, lat: 52.3926, lng: 4.9211, rent1br: 1100, groceries: 350, transport: 100, utilities: 130, currency: 'EUR' },
    ],
    insights: [
      { category: CulturalInsightCategory.CUSTOMS, title: 'Bicicleta: Lei Suprema', description: 'Em Amsterdã, pedestres são cidadãos de segunda classe na hierarquia do trânsito. A bicicleta reina. Nunca ande nas ciclovias — você levará um susto ou uma bronca. Sempre olhe para os dois lados antes de cruzar qualquer faixa.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.SOCIAL, title: 'Diretidade Holandesa', description: 'Holandeses são brutalmente diretos — isso não é grosseria, é cultura. Se perguntarem o que você acha de algo, espere uma opinião honesta. Elogios vagos são suspeitos. A franqueza é sinal de respeito, não de hostilidade.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.BUREAUCRACY, title: 'Crise de Moradia Real', description: 'Amsterdã tem uma das crises de moradia mais graves da Europa. A fila para apartamentos sociais pode ter 15+ anos. O mercado privado é caro e competitivo — listas de espera com centenas de candidatos por anúncio são normais. Chegue com solução temporária garantida.', severity: InsightSeverity.WARNING },
    ],
  });

  // ── 15. Rome ───────────────────────────────────────────────────────────────
  await seedCity({
    name: 'Rome', country: 'Italy', countryCode: 'IT',
    lat: 41.9028, lng: 12.4964, timezone: 'Europe/Rome', population: 2800000,
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    neighborhoods: [
      { name: 'Trastevere', tier: CostTier.HIGH, lat: 41.8896, lng: 12.4704, rent1br: 1300, groceries: 400, transport: 35, utilities: 140, currency: 'EUR' },
      { name: 'Pigneto', tier: CostTier.MEDIUM, lat: 41.8869, lng: 12.5417, rent1br: 850, groceries: 320, transport: 35, utilities: 110, currency: 'EUR' },
      { name: 'Laurentino', tier: CostTier.LOW, lat: 41.8282, lng: 12.5140, rent1br: 650, groceries: 270, transport: 35, utilities: 90, currency: 'EUR' },
    ],
    insights: [
      { category: CulturalInsightCategory.CUSTOMS, title: 'Hora Italiana', description: '"Subito" (imediatamente) em Roma pode significar amanhã, na semana que vem, ou nunca. A pontualidade é uma sugestão. Reuniões de trabalho atrasam, obras demoram o dobro do previsto. Adapte suas expectativas de prazo radicalmente.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.BUREAUCRACY, title: 'Burocracia Kafkiana', description: 'A burocracia italiana é famosa por sua complexidade. Documentos frequentemente precisam ser autenticados em cartório, traduzidos e apostilados. Nada é online — espere filas presenciais. Tenha paciência e um contador/advogado italiano de confiança.', severity: InsightSeverity.WARNING },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Regras do Café', description: 'Cappuccino é bebida de manhã — jamais após as 11h. Espresso na banca (em pé no balcão) é mais barato e mais autêntico. Pedir "latte" em italiano significa só leite. A cultura do café aqui é uma forma de arte social com regras não escritas mas rigorosas.', severity: InsightSeverity.INFO },
    ],
  });

  // ── 16. Warsaw ─────────────────────────────────────────────────────────────
  await seedCity({
    name: 'Warsaw', country: 'Poland', countryCode: 'PL',
    lat: 52.2297, lng: 21.0122, timezone: 'Europe/Warsaw', population: 1800000,
    imageUrl: 'https://images.unsplash.com/photo-1559541919-e79bc157a657?w=800',
    neighborhoods: [
      { name: 'Śródmieście', tier: CostTier.HIGH, lat: 52.2370, lng: 21.0122, rent1br: 1000, groceries: 300, transport: 50, utilities: 120, currency: 'EUR' },
      { name: 'Praga-Południe', tier: CostTier.LOW, lat: 52.2310, lng: 21.0651, rent1br: 550, groceries: 230, transport: 50, utilities: 90, currency: 'EUR' },
      { name: 'Mokotów', tier: CostTier.MEDIUM, lat: 52.1943, lng: 21.0122, rent1br: 800, groceries: 270, transport: 50, utilities: 105, currency: 'EUR' },
    ],
    insights: [
      { category: CulturalInsightCategory.SOCIAL, title: 'Receptividade a Estrangeiros', description: 'Varsóvia é cada vez mais cosmopolita graças à imigração ucraniana e a comunidade de ex-pats da UE. Inglês funciona bem em restaurantes, cafés e empresas de tech. Poloneses são reservados inicialmente, mas muito leais depois de estabelecer confiança.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.LANGUAGE, title: 'Polonês: Difícil mas Valorizado', description: 'O polonês é considerado um dos idiomas europeus mais difíceis para falantes de línguas latinas. Aprender o básico (obrigado = dziękuję, bom dia = dzień dobry) causa reações extremamente positivas nos locais.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Inverno Rigoroso', description: 'De novembro a março, temperaturas negativas são normais (-5°C a -15°C). A cidade funciona normalmente no frio — ônibus, metrô e comércio não param. Invista em roupas térmicas reais, não apenas um casaco mais grosso.', severity: InsightSeverity.CAUTION },
    ],
  });

  // ── 17. Tokyo ──────────────────────────────────────────────────────────────
  await seedCity({
    name: 'Tokyo', country: 'Japan', countryCode: 'JP',
    lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo', population: 13960000,
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800',
    neighborhoods: [
      { name: 'Shinjuku', tier: CostTier.HIGH, lat: 35.6897, lng: 139.6919, rent1br: 130000, groceries: 40000, transport: 10000, utilities: 12000, currency: 'JPY' },
      { name: 'Shimokitazawa', tier: CostTier.MEDIUM, lat: 35.6614, lng: 139.6682, rent1br: 90000, groceries: 35000, transport: 10000, utilities: 10000, currency: 'JPY' },
      { name: 'Adachi', tier: CostTier.LOW, lat: 35.7758, lng: 139.8036, rent1br: 65000, groceries: 30000, transport: 10000, utilities: 8000, currency: 'JPY' },
    ],
    insights: [
      { category: CulturalInsightCategory.CUSTOMS, title: 'Dinheiro Físico é Essencial', description: 'Tóquio é surpreendentemente dependente de dinheiro em espécie. Muitos restaurantes, templos e estabelecimentos menores não aceitam cartão. Caixas eletrônicos do 7-Eleven e Japan Post aceitam cartões estrangeiros. Sempre tenha yens físicos.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Etiqueta no Trem', description: 'Silêncio absoluto: não atenda ligações, fale baixo, não coma. Telefones em modo silencioso são norma. Fones de ouvido sempre. Você nunca ouvirá ninguém falar alto no metrô de Tóquio — é uma forma de respeito coletivo inviolável.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.LANGUAGE, title: 'Barreira do Idioma Real', description: 'Japonês é obrigatório para vida cotidiana fora de círculos turísticos. Menus, burocracia, médicos, contratos de aluguel — tudo em japonês. Inglês existe em zonas turísticas mas não em escritórios governamentais nem na maioria dos comércios locais.', severity: InsightSeverity.WARNING },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Veneração pelo Trabalho', description: 'O conceito de "karoshi" (morte por excesso de trabalho) é real e reconhecido legalmente. Muitos escritórios esperam que funcionários fiquem até o chefe ir embora. O equilíbrio trabalho-vida é um desafio sério, especialmente em empresas japonesas tradicionais.', severity: InsightSeverity.CAUTION },
    ],
  });

  // ── 18. Bangkok ────────────────────────────────────────────────────────────
  await seedCity({
    name: 'Bangkok', country: 'Thailand', countryCode: 'TH',
    lat: 13.7563, lng: 100.5018, timezone: 'Asia/Bangkok', population: 10500000,
    imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800',
    neighborhoods: [
      { name: 'Silom', tier: CostTier.HIGH, lat: 13.7237, lng: 100.5282, rent1br: 20000, groceries: 8000, transport: 2500, utilities: 3000, currency: 'THB' },
      { name: 'Ari', tier: CostTier.MEDIUM, lat: 13.7763, lng: 100.5503, rent1br: 12000, groceries: 6000, transport: 2500, utilities: 2500, currency: 'THB' },
      { name: 'On Nut', tier: CostTier.LOW, lat: 13.7011, lng: 100.5979, rent1br: 8000, groceries: 5000, transport: 2000, utilities: 2000, currency: 'THB' },
    ],
    insights: [
      { category: CulturalInsightCategory.CUSTOMS, title: 'Respeito à Monarquia', description: 'Crítica à família real é crime com pena de prisão de até 15 anos (lei de lèse-majesté). Evite qualquer comentário negativo sobre o Rei ou a família real em qualquer contexto — público, privado ou online. Esta regra é aplicada rigorosamente.', severity: InsightSeverity.WARNING },
      { category: CulturalInsightCategory.SOCIAL, title: 'Sorrir é uma Linguagem', description: 'Tailandeses usam diferentes tipos de sorriso para diferentes situações — há um sorriso de concordância, um de desconforto, um de riso etc. Levantar a voz ou demonstrar raiva publicamente causa grande constrangimento. Mantenha a calma e sorria.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Trânsito Caótico mas Tuk-Tuks', description: 'O trânsito em Bangkok é legendariamente caótico. BTS Skytrain e MRT são eficientes e evitam o problema. Tuk-tuks são para turistas e cobram bem mais — use Grab (equivalente ao Uber) para preços justos.', severity: InsightSeverity.INFO },
    ],
  });

  // ── 19. Singapore ──────────────────────────────────────────────────────────
  await seedCity({
    name: 'Singapore', country: 'Singapore', countryCode: 'SG',
    lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore', population: 5900000,
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
    neighborhoods: [
      { name: 'Tiong Bahru', tier: CostTier.HIGH, lat: 1.2834, lng: 103.8271, rent1br: 2800, groceries: 700, transport: 100, utilities: 200, currency: 'SGD' },
      { name: 'Jurong East', tier: CostTier.MEDIUM, lat: 1.3330, lng: 103.7436, rent1br: 1800, groceries: 550, transport: 100, utilities: 150, currency: 'SGD' },
      { name: 'Woodlands', tier: CostTier.LOW, lat: 1.4382, lng: 103.7890, rent1br: 1400, groceries: 480, transport: 100, utilities: 130, currency: 'SGD' },
    ],
    insights: [
      { category: CulturalInsightCategory.CUSTOMS, title: 'Multas por Tudo', description: 'Singapura é famosa por suas multas rigorosas: comer/beber no metrô (SGD $500), jogar lixo na rua ($300), mascar chiclete (proibido de importar). A cidade é incrivelmente limpa — e permanece assim porque as regras são cumpridas.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.SOCIAL, title: 'Hawker Centers: Coração Social', description: 'Os hawker centers são centros de alimentação coletivos com comida local a partir de SGD $3-5. São o coração social da cidade — toda etnia, classe social e geração se encontra nesses lugares. Comer em hawker centers é como participar da cultura local.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.BUREAUCRACY, title: 'Visto de Trabalho: EP vs S-Pass', description: 'Para trabalhar legalmente em Singapura, você precisa de um Employment Pass (EP) ou S-Pass, solicitado pelo empregador. O processo é digital e relativamente rápido (1-3 semanas), mas exige salário mínimo comprovado (SGD $5.000+/mês para EP).', severity: InsightSeverity.CAUTION },
    ],
  });

  // ── 20. Seoul ──────────────────────────────────────────────────────────────
  await seedCity({
    name: 'Seoul', country: 'South Korea', countryCode: 'KR',
    lat: 37.5665, lng: 126.9780, timezone: 'Asia/Seoul', population: 9700000,
    imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
    neighborhoods: [
      { name: 'Hongdae', tier: CostTier.MEDIUM, lat: 37.5563, lng: 126.9219, rent1br: 700, groceries: 300, transport: 70, utilities: 80, currency: 'USD' },
      { name: 'Gangnam', tier: CostTier.HIGH, lat: 37.4979, lng: 127.0276, rent1br: 1400, groceries: 420, transport: 70, utilities: 120, currency: 'USD' },
      { name: 'Dobong', tier: CostTier.LOW, lat: 37.6688, lng: 127.0471, rent1br: 500, groceries: 250, transport: 70, utilities: 65, currency: 'USD' },
    ],
    insights: [
      { category: CulturalInsightCategory.SOCIAL, title: 'Cultura do Nunchi', description: '"Nunchi" é a habilidade coreana de ler o ambiente social e agir de acordo. Quem tem bom nunchi percebe quando alguém está desconfortável e ajusta o comportamento. É uma habilidade social extremamente valorizada e uma chave para se integrar.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.LANGUAGE, title: 'Coreano: Hierarquia Linguística', description: 'O coreano tem formas gramaticais distintas para diferentes níveis de formalidade — você fala diferente com um superior, um igual e uma criança. Falar o nível errado é uma gafe social séria. Inglês funciona em Seul, mas aprender o alfabeto (Hangul) em 2 dias é acessível e muito valorizado.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Cultura do Ppali-Ppali', description: '"Ppali-ppali" (rápido, rápido) é o ethos coreano. Delivery em 30 minutos, internet de 1Gbps generalizado, conveniências 24h — a Coreia do Sul tem uma das infraestruturas de serviços mais rápidas do mundo. Se você estava acostumado com burocracia lenta, isso vai surpreender positivamente.', severity: InsightSeverity.INFO },
    ],
  });

  // ── 21. Ho Chi Minh City ──────────────────────────────────────────────────
  await seedCity({
    name: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN',
    lat: 10.8231, lng: 106.6297, timezone: 'Asia/Ho_Chi_Minh', population: 9000000,
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    neighborhoods: [
      { name: 'District 1', tier: CostTier.HIGH, lat: 10.7769, lng: 106.7009, rent1br: 700, groceries: 250, transport: 30, utilities: 60, currency: 'USD' },
      { name: 'District 3', tier: CostTier.MEDIUM, lat: 10.7779, lng: 106.6849, rent1br: 450, groceries: 180, transport: 30, utilities: 50, currency: 'USD' },
      { name: 'Bình Thạnh', tier: CostTier.LOW, lat: 10.8110, lng: 106.7064, rent1br: 300, groceries: 140, transport: 25, utilities: 40, currency: 'USD' },
    ],
    insights: [
      { category: CulturalInsightCategory.CUSTOMS, title: 'Trânsito de Motos: Uma Arte', description: 'HCMC tem mais de 8 milhões de motos. Para atravessar a rua: não pare, ande devagar e com ritmo constante — os motociclistas desviam de você. Parar abruptamente é mais perigoso do que continuar. Levará alguns dias para se acostumar; depois se torna intuitivo.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.SOCIAL, title: 'Custo de Vida Acessível', description: 'HCMC é um dos destinos mais baratos da Ásia para nomads digitais. Refeição completa em banh mi shop por $1, almoço em restaurante local por $2-4, café especial por $1. O custo de vida é 3-4x menor que cidades europeias com qualidade de vida equivalente.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.BUREAUCRACY, title: 'Visto: e-Visa 90 Dias', description: 'Brasileiros podem solicitar e-Visa online por US$25, válido por 90 dias, não renovável no país. Para estadas mais longas, é necessário sair e retornar (visa run) ou obter visto de negócios com empresa patrocinadora. O processo é simples e 100% digital.', severity: InsightSeverity.INFO },
    ],
  });

  // ── 22. Bali / Denpasar ────────────────────────────────────────────────────
  await seedCity({
    name: 'Bali', country: 'Indonesia', countryCode: 'ID',
    lat: -8.4095, lng: 115.1889, timezone: 'Asia/Makassar', population: 4200000,
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    neighborhoods: [
      { name: 'Canggu', tier: CostTier.MEDIUM, lat: -8.6478, lng: 115.1385, rent1br: 600, groceries: 200, transport: 50, utilities: 80, currency: 'USD' },
      { name: 'Seminyak', tier: CostTier.HIGH, lat: -8.6914, lng: 115.1609, rent1br: 1000, groceries: 280, transport: 50, utilities: 100, currency: 'USD' },
      { name: 'Ubud', tier: CostTier.MEDIUM, lat: -8.5069, lng: 115.2624, rent1br: 450, groceries: 170, transport: 60, utilities: 70, currency: 'USD' },
    ],
    insights: [
      { category: CulturalInsightCategory.CUSTOMS, title: 'Hinduísmo Balinês: Respeito Obrigatório', description: 'Bali é a única ilha majoritariamente hindu da Indonésia. Cerimônias e procissões ocorrem diariamente e têm prioridade sobre o trânsito. Ao entrar em templos, use sarong (disponível na entrada) e respeite os espaços sagrados. Fotografar rituais sem permissão é ofensivo.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.BUREAUCRACY, title: 'Visto Social e "Visa Run"', description: 'Brasileiros recebem 30 dias de visto na chegada (VOA) que pode ser estendido por mais 30 dias. Para estadias mais longas, a estratégia do "visa run" (sair para Singapura ou Malásia e retornar) é comum na comunidade de nomads. O visto de investidor (KITAS) existe mas é caro.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.SOCIAL, title: 'Gotong Royong: Comunidade', description: '"Gotong royong" é o princípio indonésio de trabalho comunitário mútuo. Em Bali, isso se manifesta nas cerimônias de templo, na manutenção de subaks (sistemas de irrigação) e no cuidado com espaços públicos. Participar ou respeitar esses rituais é fundamental para uma convivência harmoniosa.', severity: InsightSeverity.INFO },
    ],
  });

  // ── 23. Dubai ──────────────────────────────────────────────────────────────
  await seedCity({
    name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE',
    lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai', population: 3300000,
    imageUrl: 'https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=800',
    neighborhoods: [
      { name: 'Downtown Dubai', tier: CostTier.HIGH, lat: 25.1972, lng: 55.2797, rent1br: 2200, groceries: 600, transport: 100, utilities: 200, currency: 'USD' },
      { name: 'Jumeirah Village Circle', tier: CostTier.MEDIUM, lat: 25.0657, lng: 55.2131, rent1br: 1200, groceries: 420, transport: 120, utilities: 160, currency: 'USD' },
      { name: 'Deira', tier: CostTier.LOW, lat: 25.2701, lng: 55.3095, rent1br: 700, groceries: 320, transport: 80, utilities: 120, currency: 'USD' },
    ],
    insights: [
      { category: CulturalInsightCategory.CUSTOMS, title: 'Ramadã: Mudanças Radicais', description: 'Durante o Ramadã (mês lunar variável), comer, beber e fumar em público durante o dia é proibido — inclusive para não-muçulmanos. Horários de restaurantes e negócios mudam completamente. A vida social e muitas atividades migram para a madrugada.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Leis de Conduta Pública', description: 'Beijos e afeto público (mesmo entre casados) podem resultar em advertência ou prisão. Vestimenta deve ser modesta em espaços públicos — ombros e joelhos cobertos fora de praias/piscinas. Consumo de álcool só em locais licenciados. Xingamentos (mesmo em conversas privadas) podem gerar detenção.', severity: InsightSeverity.WARNING },
      { category: CulturalInsightCategory.SOCIAL, title: 'Sem Impostos, Mas Taxas Ocultas', description: 'Dubai não tem imposto de renda — isso atrai muitos expatriados. No entanto, há taxas sobre serviços (VAT de 5%), tarifas municipais de água/energia e custos de saúde privada elevados. O custo real de vida pode surpreender quem calcula só pelo salário bruto.', severity: InsightSeverity.CAUTION },
    ],
  });

  // ── 24. Sydney ─────────────────────────────────────────────────────────────
  await seedCity({
    name: 'Sydney', country: 'Australia', countryCode: 'AU', state: 'NSW',
    lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney', population: 5300000,
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
    neighborhoods: [
      { name: 'Newtown', tier: CostTier.MEDIUM, lat: -33.8978, lng: 151.1794, rent1br: 1800, groceries: 500, transport: 200, utilities: 150, currency: 'AUD' },
      { name: 'Bondi', tier: CostTier.HIGH, lat: -33.8915, lng: 151.2767, rent1br: 2800, groceries: 650, transport: 200, utilities: 180, currency: 'AUD' },
      { name: 'Parramatta', tier: CostTier.LOW, lat: -33.8148, lng: 151.0017, rent1br: 1200, groceries: 400, transport: 200, utilities: 120, currency: 'AUD' },
    ],
    insights: [
      { category: CulturalInsightCategory.CUSTOMS, title: 'Cultura do BBQ e da Praia', description: 'O "barbie" (churrasco) é um ritual social australiano. Praias públicas têm churrasqueiras gratuitas. Bondi Beach não é só turismo — é onde sydney-siders vão de manhã cedo para surf e café. A vida ao ar livre é central na identidade local.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.BUREAUCRACY, title: 'TFN e Conta Bancária', description: 'O Tax File Number (TFN) é o primeiro documento a solicitar. Sem ele, você paga a taxa máxima de impostos retida na fonte. O processo é online e leva 1-4 semanas. Com TFN, abrir conta bancária em bancos como Commonwealth ou NAB é simples.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Gorjeta Não É Obrigatória', description: 'Diferente dos EUA, gorjeta em restaurantes e bares australianos é opcional — o salário mínimo para trabalhadores de serviços é alto (AUD $23+/hora). Se o serviço foi excelente, arredondar a conta é apreciado. Nunca se sinta pressionado.', severity: InsightSeverity.INFO },
    ],
  });

  // ── 25. Cape Town ──────────────────────────────────────────────────────────
  await seedCity({
    name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', state: 'WC',
    lat: -33.9249, lng: 18.4241, timezone: 'Africa/Johannesburg', population: 4600000,
    imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
    neighborhoods: [
      { name: 'De Waterkant', tier: CostTier.HIGH, lat: -33.9198, lng: 18.4173, rent1br: 12000, groceries: 5000, transport: 1500, utilities: 2000, currency: 'ZAR' },
      { name: 'Observatory', tier: CostTier.MEDIUM, lat: -33.9376, lng: 18.4723, rent1br: 7000, groceries: 3500, transport: 1200, utilities: 1500, currency: 'ZAR' },
      { name: 'Mitchell\'s Plain', tier: CostTier.LOW, lat: -34.0449, lng: 18.6231, rent1br: 3500, groceries: 2500, transport: 1000, utilities: 1000, currency: 'ZAR' },
    ],
    insights: [
      { category: CulturalInsightCategory.SAFETY, title: 'Desigualdade e Segurança', description: 'Cape Town tem índices elevados de criminalidade. Os bairros turísticos (V&A Waterfront, Green Point, Sea Point) são seguros. Evite áreas periféricas sem conhecimento local. Use Uber em vez de táxis de rua. Não exiba eletrônicos caros em público.', severity: InsightSeverity.WARNING },
      { category: CulturalInsightCategory.SOCIAL, title: 'A Montanha como Vizinha', description: 'A Table Mountain é o símbolo e o quintal da cidade. Caminhadas até o topo são parte da vida social local. O Boulders Beach (pinguins) fica a 45 minutos. A natureza é acessível, gratuita e central na identidade capetowniana.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.CUSTOMS, title: 'Load Shedding: Apagões Programados', description: 'A África do Sul tem um programa oficial de apagões rotativos (load shedding) de 2-12 horas diárias quando a demanda supera a oferta da Eskom (estatal de energia). Baixe o app EskomSePush para prever os horários. Restaurantes e supermercados têm geradores — a cidade se adapta, mas exige planejamento.', severity: InsightSeverity.CAUTION },
    ],
  });

  // ── 26. Nairobi ────────────────────────────────────────────────────────────
  await seedCity({
    name: 'Nairobi', country: 'Kenya', countryCode: 'KE',
    lat: -1.2921, lng: 36.8219, timezone: 'Africa/Nairobi', population: 4700000,
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    neighborhoods: [
      { name: 'Westlands', tier: CostTier.HIGH, lat: -1.2672, lng: 36.8077, rent1br: 700, groceries: 250, transport: 50, utilities: 80, currency: 'USD' },
      { name: 'Kilimani', tier: CostTier.MEDIUM, lat: -1.2921, lng: 36.7824, rent1br: 450, groceries: 180, transport: 40, utilities: 60, currency: 'USD' },
      { name: 'Eastleigh', tier: CostTier.LOW, lat: -1.2710, lng: 36.8534, rent1br: 180, groceries: 100, transport: 30, utilities: 40, currency: 'USD' },
    ],
    insights: [
      { category: CulturalInsightCategory.SOCIAL, title: 'Hub Tech da África', description: 'Nairobi é conhecida como "Silicon Savannah" — o maior polo de tecnologia e startups da África Subsaariana. M-Pesa (pagamento móvel) foi inventado aqui e é onipresente. A cena de inovação é vibrante e em rápida expansão, com escritórios de Google, Microsoft e Meta.', severity: InsightSeverity.INFO },
      { category: CulturalInsightCategory.SAFETY, title: 'Segurança por Área', description: 'Westlands, Kilimani e Karen são os bairros mais seguros e utilizados por expats. O CBD (Centro) requer atenção durante o dia e deve ser evitado à noite. Matatu (transporte coletivo colorido) é econômico mas caótico — Uber e Bolt são mais seguros para estrangeiros.', severity: InsightSeverity.CAUTION },
      { category: CulturalInsightCategory.CUSTOMS, title: 'M-Pesa: Pagamento Universal', description: 'Quase todas as transações no Quênia ocorrem via M-Pesa (dinheiro móvel pelo celular). Alugar apartamento, pagar supermercado, dividir conta — tudo via M-Pesa. Solicite uma linha SIM local da Safaricom nos primeiros dias; é fundamental para funcionar no cotidiano.', severity: InsightSeverity.CAUTION },
    ],
  });

  console.log('Seed completed');
  process.exit(0);
}

runSeed().catch(err => {
  console.error(err);
  process.exit(1);
});


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
