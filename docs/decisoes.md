# Decisões do Comfort Nomad v2

- `apps/web` é a única aplicação ativa. O código anterior foi preservado em `legacy/v1` e pode ser consultado sem integrar serviços antigos.
- Toda leitura e gravação da demonstração ocorre em serviços tipados locais e no armazenamento do navegador. Não há API, login remoto, envio de formulário ou dependência de rede.
- Os valores e índices de cidades são dados sintéticos para demonstração. Custo, clima e segurança mostram fonte, data e confiança; a confiança é baixa e os rótulos não afirmam segurança pública real.
- Recomendações usam apenas IDs presentes no seed local. Pesos e critérios do perfil são compartilhados entre descoberta e comparação e têm explicação por pilar.
- A lista de mudança e o primeiro mês são estimativas configuradas pelo destino, data e ritmo escolhido. Prazos vencidos passam para uma fila imediata e o conteúdo migratório orienta a consulta a fontes oficiais.
- Conteúdo comunitário submetido fica pendente; a interface de moderação local demonstra aprovação ou pedido de ajustes antes de aparecer como publicado.
- O onboarding anônimo persiste localmente. Ao registrar uma conta demonstrativa, preferências anônimas são combinadas com os dados explícitos da conta.
- Custos podem ser exibidos em BRL, USD ou EUR usando taxas fixas declaradas para a demonstração. Não são cotações atuais.
- Idiomas de interface previstos: pt-BR, en e es. Dados de destino e orientações mock permanecem em português nesta primeira entrega.
