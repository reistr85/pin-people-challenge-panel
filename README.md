# Pin People – Painel

Interface em Vue do Pin People: gestão de clientes, colaboradores, enquetes, importação CSV e respostas às enquetes por colaboradores.

---

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| **Framework** | Vue 3 |
| **UI** | Vuetify 3 |
| **Linguagem** | TypeScript |
| **Build** | Vite 7 |
| **Roteamento** | Vue Router 4 |
| **HTTP** | Axios |
| **Gráficos** | Chart.js |
| **Fontes** | Roboto, MDI Icons |

### Principais dependências

- **vue** – framework reativo
- **vuetify** – componentes e temas (Material Design)
- **vue-router** – SPA e guards (admin, cliente, colaborador)
- **axios** – chamadas à API com token no header
- **chart.js** – gráficos no dashboard
- **vite** – bundler e dev server com HMR

---

## Serviços AWS e infraestrutura

Serviços utilizados para hospedagem, entrega e rede do painel:

| Logo | Serviço | Descrição |
|------|---------|-----------|
| <img src="public/s3.png" width="24" height="24" alt="S3" /> | **Amazon S3** | Bucket onde o build estático do painel (HTML, JS, CSS) é publicado. Contém os artefatos de `npm run build`. |
| <img src="public/CloudFront.png" width="24" height="24" alt="CloudFront" /> | **Amazon CloudFront** | CDN que serve o painel a partir do S3. Reduz latência e distribui o tráfego com cache na borda. |
| <img src="public/certificate.png" width="24" height="24" alt="ACM" /> | **AWS Certificate Manager (ACM)** | Certificados SSL/TLS para HTTPS no CloudFront (ou domínio customizado). Renovação gerenciada pela AWS. |
| <img src="https://cdn.simpleicons.org/cloudflare/F38020" width="24" height="24" alt="Cloudflare" /> | **Cloudflare** | DNS, proxy e proteção na frente do CloudFront ou da origem. Cache, WAF e mitigação de DDoS. |
| <img src="public/CloudFront.png" width="24" height="24" alt="CloudFront" /> | **Invalidation de cache (CloudFront)** | Invalidação de objetos em cache no CloudFront após novo deploy, para que os usuários recebam a versão mais recente do painel. |
| <img src="https://cdn.simpleicons.org/vuedotjs/4FC08D" width="24" height="24" alt="Vue" /> | **Vue** | Framework front-end reativo usado no projeto (Vue 3 com Composition API). |
| <img src="https://cdn.simpleicons.org/vuetify/1867C0" width="24" height="24" alt="Vuetify" /> | **Vuetify** | Biblioteca de componentes e temas Material Design para Vue (layout, formulários, tabelas, etc.). |

---

## Rodar o projeto localmente

### Pré-requisitos

- Node.js 18+ (recomendado 20 ou 22)
- npm, yarn, pnpm ou bun

### Instalação

```bash
# Instalar dependências
npm install
# ou: yarn install | pnpm install | bun install
```

### Desenvolvimento

```bash
npm run dev
```

O painel fica em [http://localhost:5173](http://localhost:5173) (ou outra porta indicada pelo Vite). Configure a URL da API (variável de ambiente ou `src/api` conforme o projeto).

### Build para produção

```bash
npm run build
```

A saída vai para `dist/`. O conteúdo dessa pasta é o que deve ser publicado no S3 (e servido via CloudFront).

### Type-check e lint

```bash
npm run type-check
npm run lint
```

---

## Estrutura resumida

- **`src/views/`** – páginas (Login, Dashboard, Clientes, Colaboradores, Enquetes, Importar CSV)
- **`src/components/`** – componentes reutilizáveis (NavBar, NotifyInfo, etc.)
- **`src/composables/`** – lógica reutilizável (ex.: `useAuth`)
- **`src/router/`** – rotas e guards por perfil (admin, client, collaborator)
- **`src/api/`** – cliente HTTP (Axios) e base URL da API

---

## Licença

Conforme definido no repositório do projeto.
