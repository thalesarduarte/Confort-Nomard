import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Text,
  View,
} from 'react-native';

type Locale = 'pt-BR' | 'en' | 'es';
type City = {
  id: string;
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  timezone: string;
  language: string;
  currency: string;
};
type ApiResponse = { data: City[] };

const copy: Record<Locale, { subtitle: string; cities: string; loading: string; empty: string; retry: string; error: string }> = {
  'pt-BR': { subtitle: 'Planeje sua próxima mudança com contexto.', cities: 'Cidades', loading: 'Carregando cidades…', empty: 'Nenhuma cidade cadastrada ainda.', retry: 'Tentar novamente', error: 'Não foi possível conectar à API.' },
  en: { subtitle: 'Plan your next move with context.', cities: 'Cities', loading: 'Loading cities…', empty: 'No cities have been added yet.', retry: 'Try again', error: 'Could not connect to the API.' },
  es: { subtitle: 'Planea tu próxima mudanza con contexto.', cities: 'Ciudades', loading: 'Cargando ciudades…', empty: 'Todavía no hay ciudades registradas.', retry: 'Intentar de nuevo', error: 'No se pudo conectar con la API.' },
};

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

function isCity(value: unknown): value is City {
  if (typeof value !== 'object' || value === null) return false;
  const city = value as Record<string, unknown>;
  return ['id', 'slug', 'name', 'country', 'countryCode', 'timezone', 'language', 'currency']
    .every((field) => typeof city[field] === 'string');
}

export default function App() {
  const [locale, setLocale] = useState<Locale>('pt-BR');
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const labels = copy[locale];

  const loadCities = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/cities`, { signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload: unknown = await response.json();
      if (
        typeof payload !== 'object'
        || payload === null
        || !('data' in payload)
        || !Array.isArray(payload.data)
        || !payload.data.every(isCity)
      ) {
        throw new Error('The API returned an invalid city list');
      }
      setCities(payload.data as ApiResponse['data']);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setFailed(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadCities(controller.signal);
    return () => controller.abort();
  }, [loadCities]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        contentContainerStyle={styles.content}
        data={cities}
        keyExtractor={(city) => city.id}
        ListHeaderComponent={(
          <View>
            <View style={styles.localeRow} accessibilityRole="toolbar" accessibilityLabel="Language / Idioma / Idioma">
              {(['pt-BR', 'en', 'es'] as const).map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: locale === option }}
                  onPress={() => setLocale(option)}
                  style={[styles.localeButton, locale === option && styles.localeButtonSelected]}
                >
                  <Text style={[styles.localeText, locale === option && styles.localeTextSelected]}>{option}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.brand}>comfort nomad</Text>
            <Text style={styles.title}>{labels.cities}</Text>
            <Text style={styles.subtitle}>{labels.subtitle}</Text>
            {loading && <View style={styles.message}><ActivityIndicator color="#246b59" /><Text style={styles.messageText}>{labels.loading}</Text></View>}
            {failed && (
              <View style={styles.message} accessibilityRole="alert">
                <Text style={styles.messageText}>{labels.error}</Text>
                <Pressable accessibilityRole="button" onPress={() => void loadCities()} style={styles.retry}>
                  <Text style={styles.retryText}>{labels.retry}</Text>
                </Pressable>
              </View>
            )}
            {!loading && !failed && cities.length === 0 && (
              <View style={styles.message}><Text style={styles.messageText}>{labels.empty}</Text></View>
            )}
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.cityCard} accessible accessibilityLabel={`${item.name}, ${item.country}`}>
            <Text style={styles.cityName}>{item.name}</Text>
            <Text style={styles.cityCountry}>{item.country}</Text>
            <Text style={styles.cityMeta}>{item.timezone} · {item.currency}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f6f2' },
  content: { padding: 24, paddingTop: 18, paddingBottom: 40 },
  localeRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 36 },
  localeButton: { minHeight: 44, minWidth: 52, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#d5ddd7', backgroundColor: '#fff' },
  localeButtonSelected: { backgroundColor: '#246b59', borderColor: '#246b59' },
  localeText: { color: '#3c4b43', fontSize: 13, fontWeight: '600' },
  localeTextSelected: { color: '#fff' },
  brand: { color: '#246b59', fontSize: 14, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: '#18251f', fontSize: 34, fontWeight: '700', marginTop: 8 },
  subtitle: { color: '#54635b', fontSize: 16, lineHeight: 24, marginTop: 8, marginBottom: 24 },
  message: { alignItems: 'center', justifyContent: 'center', gap: 12, padding: 22, borderRadius: 18, backgroundColor: '#fff' },
  messageText: { color: '#3c4b43', fontSize: 15, textAlign: 'center' },
  retry: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#246b59' },
  retryText: { color: '#fff', fontWeight: '700' },
  cityCard: { padding: 20, marginTop: 14, borderRadius: 18, borderWidth: 1, borderColor: '#e2e8e3', backgroundColor: '#fff' },
  cityName: { color: '#18251f', fontSize: 19, fontWeight: '700' },
  cityCountry: { color: '#54635b', fontSize: 15, marginTop: 4 },
  cityMeta: { color: '#246b59', fontSize: 13, fontWeight: '600', marginTop: 14 },
});
