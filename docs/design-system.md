# Comfort Nomad — sistema visual v2

## Intenção

Uma assessoria acolhedora e precisa: calor humano sem perder clareza quando o assunto é custo, segurança ou adaptação. Interface em pt-BR, mobile-first, dados simulados sempre identificados.

## Tokens

- **Cores claras:** fundo `#f6f4ee`, superfície `#fffefa`, texto `#20352f`, secundário `#5e7068`, verde profundo `#1b5b49`, menta `#dceee4`, açafrão `#e9a851`, alerta `#9b4c3c`.
- **Cores escuras:** fundo `#111b18`, superfície `#1c2924`, texto `#eff6f0`, secundário `#b4c4ba`, verde `#8bc9a5`, menta `#29463a`, alerta `#f0a08e`.
- **Tipografia:** sistema sans-serif para leitura e títulos; tamanhos baseados em `clamp()` para adaptação fluida.
- **Espaçamento:** escala de 4, 8, 12, 16, 24, 32 e 48 px.
- **Raios:** 10 px controles, 16 px cartões, 24 px painéis, 999 px chips.
- **Sombras:** leves, difusas e reservadas a menus, cartões elevados e diálogos.

## Componentes e comportamento

Botões e links têm foco de teclado bem visível; cartões têm contorno e elevação discretos; abas usam `aria-selected`; diálogos mantêm foco e podem ser fechados por teclado; scores exibem rótulo e valor textual além da cor. Movimento respeita `prefers-reduced-motion`.

## Acessibilidade e responsividade

Contraste de texto busca WCAG AA. Layout usa uma coluna em 360 px, duas colunas quando há espaço e até três em 1280 px. Alvos de toque têm pelo menos 44 px. Estados de loading, vazio e erro mantêm contexto acessível.

## Dados e confiança

O seed é sintético. Custo, clima e segurança sempre mostram que são ilustrativos; nunca usar verde/vermelho como único sinal de score ou risco.
