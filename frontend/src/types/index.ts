export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  daxQuery?: string;
  queryResults?: QueryResult;
}

export interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  dataType: string;
}

export interface MeasureInfo {
  name: string;
  expression: string;
  table: string;
}

export interface RelationshipInfo {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  isActive: boolean;
}

export interface SchemaInfo {
  tables: TableInfo[];
  measures: MeasureInfo[];
  relationships: RelationshipInfo[];
}

export interface ConnectionState {
  isConnected: boolean;
  connectionType: 'desktop' | 'cloud' | null;
  instanceName?: string;
  workspaceName?: string;
}

export interface ProviderConfig {
  provider: 'azure-claude' | 'azure-openai' | 'ollama' | null;
  isConfigured: boolean;
  modelName?: string;
}
