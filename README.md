# API de Gestão de Notas Fiscais

API REST desenvolvida em Node.js com TypeScript para gerenciar solicitações de Notas Fiscais.

## 📋 Requisitos

- Node.js >= v20
- NPM
- Postman (recomendado para testes)

## 🚀 Instalação e Execução

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Ou crie manualmente um arquivo `.env` com as seguintes variáveis:

```env
# Porta do servidor (opcional, padrão: 3000)
PORT=3000

# URL da API externa de emissão de notas fiscais
API_EMISSAO_URL=https://api.drfinancas.com/testes/notas-fiscais

# Chave de autenticação da API externa
API_EMISSAO_KEY=87451e7c-48bc-48d1-a038-c16783dd404c
```

⚠️ **Importante:** A validação das variáveis `API_EMISSAO_URL` e `API_EMISSAO_KEY` só ocorre quando você tentar emitir uma nota fiscal. A aplicação inicia normalmente mesmo sem essas variáveis configuradas.

### 3. Compilar o Projeto

```bash
npm run build
```

### 4. Iniciar o Servidor

**Modo Desenvolvimento (com hot-reload):**
```bash
npm run dev
```

**Modo Produção:**
```bash
npm start
```

O servidor estará rodando em: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
├── src/
│   ├── entity/          # Entidades do banco de dados (TypeORM)
│   ├── controller/      # Controllers da API (camada HTTP)
│   ├── service/         # Lógica de negócio (regras de domínio)
│   ├── routes/          # Definição de rotas Express
│   ├── config/          # Configurações (banco de dados, API externa)
│   ├── interfaces/      # Interfaces/Contratos (Dependency Inversion)
│   ├── validator/       # Validadores de dados (SRP)
│   ├── utils/           # Utilitários (tratamento de erros HTTP)
│   ├── exceptions/      # Classes de exceção personalizadas
│   ├── types/           # Tipos TypeScript e DTOs
│   └── index.ts         # Ponto de entrada da aplicação
├── tests/               # Testes automatizados (Jest)
├── docs/                # Documentação adicional
└── dist/                # Código compilado (gerado automaticamente)
```

### 📂 Descrição das Pastas

- **`entity/`**: Entidades do TypeORM que representam tabelas do banco de dados
- **`controller/`**: Camada responsável por receber requisições HTTP e retornar respostas
- **`service/`**: Lógica de negócio e orquestração entre camadas
- **`routes/`**: Definição das rotas da API REST e injeção de dependências
- **`config/`**: Configurações de banco de dados e APIs externas
- **`interfaces/`**: Contratos/interfaces para Dependency Inversion Principle (DIP)
- **`validator/`**: Classes responsáveis pela validação de dados (SRP)
- **`utils/`**: Utilitários para tratamento de erros HTTP e mapeamento de status
- **`exceptions/`**: Classes de exceção customizadas para diferentes tipos de erro
- **`types/`**: Tipos TypeScript, DTOs e interfaces de dados

## 🧪 Testando a API com Postman

### Configuração Inicial no Postman

1. **Baixe o Postman**: https://www.postman.com/downloads/

2. **Crie uma nova Collection:**
   - Clique em "New" → "Collection"
   - Nome: `API Notas Fiscais`

3. **Configure as Variáveis da Collection:**
   - Clique na collection → aba **"Variables"**
   - Adicione as variáveis:

   | Variable | Initial Value | Current Value |
   |----------|---------------|---------------|
   | `base_url` | `http://localhost:3000` | `http://localhost:3000` |
   | `nota_id` | (deixe vazio) | (deixe vazio) |

   ⚠️ **Importante:** Clique em **"Save"** para salvar as variáveis!

### Endpoints para Criar no Postman

#### 1. Health Check
- **Nome:** `Health Check`
- **Method:** `GET`
- **URL:** `{{base_url}}/health`
- **Resposta esperada:** `{"status":"ok"}`

---

#### 2. Criar Nota Fiscal
- **Nome:** `Criar Nota Fiscal`
- **Method:** `POST`
- **URL:** `{{base_url}}/api/notas-fiscais`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "cnpj": "12345678000190",
  "municipio": "São Paulo",
  "estado": "SP",
  "valor": 1000.50,
  "dataDesejadaEmissao": "2024-01-15T00:00:00.000Z",
  "descricao": "Serviço de consultoria"
}
```
- **Tests (aba Tests) - para salvar o ID automaticamente:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.collectionVariables.set("nota_id", jsonData.id);
    console.log("Nota criada com ID:", jsonData.id);
}
```

---

#### 3. Listar Todas as Notas
- **Nome:** `Listar Todas as Notas`
- **Method:** `GET`
- **URL:** `{{base_url}}/api/notas-fiscais`

---

#### 4. Buscar Nota por ID
- **Nome:** `Buscar Nota por ID`
- **Method:** `GET`
- **URL:** `{{base_url}}/api/notas-fiscais/{{nota_id}}`

---

#### 5. Emitir Nota Fiscal
- **Nome:** `Emitir Nota Fiscal`
- **Method:** `POST`
- **URL:** `{{base_url}}/api/notas-fiscais/{{nota_id}}/emitir`

⚠️ **Nota:** A API externa retorna resultados aleatórios. Se der erro, tente novamente!

---

#### 6. Criar Nota - Erro Validação (Teste de Erro)
- **Nome:** `Criar Nota - Erro Validação`
- **Method:** `POST`
- **URL:** `{{base_url}}/api/notas-fiscais`
- **Headers:** `Content-Type: application/json`
- **Body (campos faltando):**
```json
{
  "cnpj": "12345678000190",
  "municipio": "São Paulo"
}
```
- **Resposta esperada:** `400 Bad Request`

---

#### 7. Buscar Nota Inexistente (Teste de Erro)
- **Nome:** `Buscar Nota Inexistente`
- **Method:** `GET`
- **URL:** `{{base_url}}/api/notas-fiscais/id-inexistente-123`
- **Resposta esperada:** `404 Not Found`

---

### 📝 Fluxo Completo de Teste

1. ✅ **Health Check** → Verificar se servidor está rodando
2. ✅ **Criar Nota Fiscal** → Criar uma nova nota (ID será salvo automaticamente)
3. ✅ **Listar Todas** → Verificar se a nota aparece na lista
4. ✅ **Buscar por ID** → Buscar a nota específica
5. ✅ **Emitir Nota Fiscal** → Emitir a nota (pode dar erro aleatório - tente novamente)
6. ✅ **Buscar por ID novamente** → Verificar se status mudou para `EMITIDA`


## 🧪 Testes Automatizados

Execute os testes unitários:
```bash
npm test
```

Com cobertura de código:
```bash
npm run test:coverage
```

## 📊 Status da Nota Fiscal

A nota fiscal pode ter os seguintes status:

- **`PENDENTE_EMISSAO`**: Status inicial da solicitação (padrão ao criar)
- **`EMITIDA`**: Nota fiscal foi emitida com sucesso
- **`CANCELADA`**: Nota fiscal foi cancelada

## 🔧 Tecnologias Utilizadas

- **Node.js** (v20+): Runtime JavaScript
- **TypeScript**: Linguagem com tipagem estática
- **Express**: Framework web para API REST
- **TypeORM**: ORM para banco de dados
- **SQLite**: Banco de dados (arquivo local)
- **Jest**: Framework de testes
- **Axios**: Cliente HTTP para chamadas externas
- **dotenv**: Gerenciamento de variáveis de ambiente

## 🏗️ Arquitetura

### Arquitetura da API

A API segue uma arquitetura em camadas:

```
Controller (Rotas HTTP)
    ↓
Service (Lógica de Negócio)
    ↓
Repository (TypeORM)
    ↓
Database (SQLite)
```

### Arquitetura para Processamento Assíncrono

Para cenários de processamento assíncrono com múltiplas ações independentes, foi criado um documento detalhado com a arquitetura proposta baseada em **Message Queue**.

📄 **Ver documentação completa**: [docs/arquitetura-processamento-assincrono.md](docs/arquitetura-processamento-assincrono.md)

## 📝 Notas Importantes

- O banco de dados SQLite é criado automaticamente na primeira execução (`database.sqlite`)
- A API externa de emissão retorna resultados aleatórios (sucesso ou erro)
- Todas as datas são armazenadas em formato ISO 8601
- O ID das notas fiscais é gerado automaticamente como UUID

