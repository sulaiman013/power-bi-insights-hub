import { create } from 'zustand';
import type { Message, SchemaInfo, ConnectionState, ProviderConfig } from '@/types';

interface AppStore {
  // Messages
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  
  // Connection
  connection: ConnectionState;
  setConnection: (connection: ConnectionState) => void;
  
  // Schema
  schema: SchemaInfo | null;
  setSchema: (schema: SchemaInfo | null) => void;
  
  // Provider
  provider: ProviderConfig;
  setProvider: (provider: ProviderConfig) => void;
  
  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  
  // Loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Messages
  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  
  // Connection
  connection: {
    isConnected: false,
    connectionType: null,
  },
  setConnection: (connection) => set({ connection }),
  
  // Schema
  schema: null,
  setSchema: (schema) => set({ schema }),
  
  // Provider
  provider: {
    provider: null,
    isConfigured: false,
  },
  setProvider: (provider) => set({ provider }),
  
  // UI State
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isSettingsOpen: false,
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  
  // Loading
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
