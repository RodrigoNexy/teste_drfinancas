# Diagrama de Arquitetura - Processamento Assíncrono

## Cenário
Uma aplicação frontend onde o usuário realiza uma ação que dispara múltiplas ações assíncronas independentes no backend, cada uma com tempos de conclusão diferentes. O frontend precisa sempre mostrar o último status do processamento.

## Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Interface do Usuário                                    │   │
│  │  - Ação do usuário                                       │   │
│  │  - Polling/WebSocket para atualização de status         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Request
                              │ (POST /api/jobs)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY / BACKEND API                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Job Controller                                          │   │
│  │  - Recebe requisição inicial                             │   │
│  │  - Cria registro de Job no banco                         │   │
│  │  - Publica mensagens na fila                            │   │
│  │  - Retorna Job ID imediatamente                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              │ Publica mensagens                 │
│                              ▼                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    MESSAGE QUEUE                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  RabbitMQ / Kafka / Redis Queue                         │   │
│  │  - Fila de mensagens para cada ação                     │   │
│  │  - Distribui tarefas entre workers                      │   │
│  │  - Garante entrega e processamento                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Consome mensagens
                              │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  WORKER 1     │    │  WORKER 2     │    │  WORKER N     │
│  (Ação A)     │    │  (Ação B)     │    │  (Ação N)     │
│               │    │               │    │               │
│  - Processa   │    │  - Processa   │    │  - Processa   │
│    ação A     │    │    ação B     │    │    ação N     │
│  - Atualiza   │    │  - Atualiza   │    │  - Atualiza   │
│    status     │    │    status     │    │    status     │
└───────────────┘    └───────────────┘    └───────────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                               │ Atualiza status
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Tabela: jobs                                            │   │
│  │  - id (UUID)                                             │   │
│  │  - status (PENDENTE, PROCESSANDO, CONCLUIDO, ERRO)      │   │
│  │  - dataCriacao                                           │   │
│  │  - dataAtualizacao                                       │   │
│  │  - resultado (JSON)                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Tabela: job_actions                                     │   │
│  │  - id                                                    │   │
│  │  - job_id (FK)                                           │   │
│  │  - action_type (A, B, C, ...)                           │   │
│  │  - status (PENDENTE, PROCESSANDO, CONCLUIDO, ERRO)      │   │
│  │  - resultado (JSON)                                      │   │
│  │  - dataInicio                                            │   │
│  │  - dataFim                                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ Consulta status
                               │
┌─────────────────────────────────────────────────────────────────┐
│                    STATUS SERVICE                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  - Consolida status de todas as ações                    │   │
│  │  - Atualiza status geral do job                          │   │
│  │  - Calcula progresso                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ Retorna status atualizado
                               │
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY / BACKEND API                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  GET /api/jobs/:id/status                                │   │
│  │  - Retorna status atualizado do job                      │   │
│  │  - Inclui status de cada ação                            │   │
│  │  - Inclui progresso geral                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTP Response
                               │ (Polling ou WebSocket)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  - Atualiza UI com status                                │   │
│  │  - Mostra progresso                                      │   │
│  │  - Exibe resultados quando concluído                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo Detalhado

### 1. Inicialização do Processamento
1. Usuário realiza ação no frontend
2. Frontend envia `POST /api/jobs` com dados da ação
3. Backend cria registro de Job com status `PENDENTE`
4. Backend publica mensagens na fila para cada ação assíncrona
5. Backend retorna Job ID imediatamente (não bloqueia)

### 2. Processamento Assíncrono
1. Workers consomem mensagens da fila
2. Cada worker processa sua ação específica
3. Workers atualizam status individual no banco (`job_actions`)
4. Status Service monitora e consolida status de todas as ações
5. Status Service atualiza status geral do job

### 3. Consulta de Status
1. Frontend faz polling ou usa WebSocket: `GET /api/jobs/:id/status`
2. Backend consulta banco de dados
3. Backend retorna:
   - Status geral do job
   - Status de cada ação individual
   - Progresso (ex: 2 de 5 ações concluídas)
   - Resultados parciais (se disponíveis)

### 4. Conclusão
1. Quando todas as ações são concluídas, Status Service atualiza job para `CONCLUIDO`
2. Frontend detecta conclusão e exibe resultados finais
3. Em caso de erro, status é atualizado para `ERRO` com detalhes

## Componentes Principais

### 1. Frontend
- **Tecnologia**: React, Vue, Angular, etc.
- **Comunicação**: 
  - HTTP REST para iniciar job
  - Polling (setInterval) ou WebSocket para status
- **UX**: Loading states, progress bars, atualização em tempo real

### 2. API Gateway / Backend API
- **Framework**: Express, Fastify, NestJS, etc.
- **Responsabilidades**:
  - Receber requisições do frontend
  - Criar jobs no banco
  - Publicar mensagens na fila
  - Expor endpoint de status
  - Autenticação e autorização

### 3. Message Queue
- **Opções**: RabbitMQ, Apache Kafka, Redis Streams, AWS SQS
- **Vantagens**:
  - Desacoplamento entre API e workers
  - Escalabilidade horizontal
  - Garantia de entrega
  - Retry automático em caso de falha

### 4. Worker Pool
- **Implementação**: Node.js, Python, Go, etc.
- **Características**:
  - Múltiplos workers processando em paralelo
  - Cada worker processa uma ação específica
  - Workers podem ser escalados independentemente
  - Idempotência nas operações

### 5. Database
- **Opções**: PostgreSQL, MySQL, MongoDB, etc.
- **Estrutura**:
  - Tabela `jobs`: status geral do processamento
  - Tabela `job_actions`: status de cada ação individual
  - Índices para consultas rápidas de status

### 6. Status Service
- **Responsabilidades**:
  - Monitorar status de todas as ações
  - Consolidar status geral do job
  - Calcular progresso
  - Trigger de eventos (WebSocket, notificações)

## Vantagens desta Arquitetura

1. **Escalabilidade**: 
   - Workers podem ser adicionados conforme necessário
   - API e workers escalam independentemente
   - Message queue distribui carga automaticamente

2. **Resiliência**:
   - Falhas em uma ação não afetam as outras
   - Retry automático via message queue
   - Status persistido no banco permite recuperação

3. **Observabilidade**:
   - Status centralizado no banco de dados
   - Logs de cada ação
   - Métricas de performance

4. **Performance**:
   - Processamento paralelo de ações independentes
   - API não bloqueia esperando conclusão
   - Frontend recebe resposta imediata

5. **Flexibilidade**:
   - Fácil adicionar novas ações
   - Workers podem ser escritos em diferentes linguagens
   - Diferentes estratégias de processamento por ação

## Alternativas e Considerações

### WebSocket vs Polling
- **WebSocket**: Melhor para atualizações em tempo real, menor latência
- **Polling**: Mais simples, funciona com qualquer HTTP client

### Message Queue
- **RabbitMQ**: Bom para workloads médios, fácil de configurar
- **Kafka**: Melhor para alto volume, streaming de dados
- **Redis Streams**: Leve, bom para workloads pequenos/médios

### Database
- **SQL**: Melhor para consultas complexas de status
- **NoSQL**: Mais flexível para estruturas variadas de resultado

## Exemplo de Implementação Simplificada

Para uma implementação mais simples (sem message queue externa), pode-se usar:
- **Bull Queue** (Redis-based) para Node.js
- **Background Jobs** com processamento em threads/processos separados
- **Database como fila** (polling de jobs pendentes)

