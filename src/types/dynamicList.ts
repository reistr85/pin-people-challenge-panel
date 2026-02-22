/**
 * Schema para o componente DynamicList.
 * domain: segmento da API (ex: 'clients' -> GET /clients).
 * routeBase: base das rotas no front (ex: 'clientes' -> /clientes/:id).
 */
export interface DynamicListField {
  name: string
  type: 'text' | 'email'
}

export interface DynamicListSchema {
  domain: string
  routeBase: string
  /** Campo identificador do registro (ex: uuid). Default: uuid */
  idField?: string
  fields: DynamicListField[]
  /** Nome do campo usado como título do card (ex: name) */
  titleField: string
  /** Campo(s) para subtítulo; se array, usa o primeiro valor não vazio */
  subtitleField?: string | string[]
  /** Avatar: 'initial' = primeira letra do titleField; 'icon' = ícone fixo */
  avatar: 'initial' | 'icon'
  /** Ícone do avatar quando avatar === 'icon' (ex: mdi-clipboard-text) */
  avatarIcon?: string
  /** Ícone exibido no empty state (ex: mdi-account-group-outline) */
  emptyIcon?: string
  /** Apenas singular e plural são obrigatórios; os demais textos são montados dinamicamente. */
  labels: {
    singular: string
    plural: string
    /** Gênero para concordância em PT: 'm' (Nenhum cliente, Novo, deletado) ou 'f' (Nenhuma enquete, Nova, deletada). Default: 'm' */
    gender?: 'm' | 'f'
    /** Particípio no empty state: 'cadastrado' ou 'encontrado'. Default: 'cadastrado' */
    emptyStateVerb?: 'cadastrado' | 'encontrado'
  }
  /** Se true, lista usa paginação e espera response { data: [], meta: { current_page, total_pages, total_count, per_page } } */
  paginated?: boolean
  /** Configuração opcional de filtros (ex: colaboradores) */
  filters?: DynamicListFilter[]
}

export interface DynamicListFilter {
  key: string
  label: string
  type: 'text' | 'select'
  /** Para type select: endpoint para buscar opções (ex: /clients) */
  optionsApi?: { path: string; labelKey: string; valueKey: string }
  /** Nome do parâmetro enviado na requisição (ex: client_uuid para key client) */
  param?: string
}

export interface DynamicListMeta {
  current_page: number
  total_pages: number
  total_count: number
  per_page: number
}

export type DynamicListRecord = Record<string, unknown> & { uuid: string }
