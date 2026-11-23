# Comfort Nomad Mobile

Aplicativo Expo independente da workspace web. Ele consome somente a API Flask e não inclui dados de cidade locais.

## Requisitos e execução

- Node.js 22.13 ou superior, compatível com a versão do Expo definida neste app.
- Instale as dependências dentro de `apps/mobile` com `npm install`.
- Inicie a API local e aplique as migrations; a aplicação ainda não terá cidades até existir uma fonte de conteúdo aprovada.
- Defina `EXPO_PUBLIC_API_URL` para um endereço acessível pelo simulador/dispositivo (o padrão local é `http://127.0.0.1:8000`). No Android Emulator, `127.0.0.1` não aponta para o host; use o endereço de host exposto pelo emulador.
- Rode `npm run start` e escolha o dispositivo no Expo.

O cliente permite trocar entre português, inglês e espanhol. Estados de carregamento, erro e catálogo vazio possuem texto acessível. A URL da API é configuração pública do cliente; nunca coloque segredos nela.
