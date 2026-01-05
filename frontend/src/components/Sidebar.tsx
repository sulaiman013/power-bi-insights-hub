import { BarChart3, Settings, Database, Cpu, RefreshCw, Wifi, WifiOff, ChevronLeft, ChevronRight, Table2, Ruler, GitBranch, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    connection, 
    provider, 
    schema,
    setSettingsOpen 
  } = useAppStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 280 : 64 }}
      transition={{ duration: 0.2 }}
      className="h-screen glass-panel border-r border-border flex flex-col shrink-0"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg gradient-gold flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">Power BI Expert</h1>
                <p className="text-xs text-muted-foreground">AI Assistant</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Button 
          variant="ghost" 
          size="icon-sm" 
          onClick={toggleSidebar}
          className="shrink-0"
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>

      {/* Connection Status */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={`status-dot ${connection.isConnected ? 'status-dot-connected' : 'status-dot-disconnected'}`} />
          {isSidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {connection.isConnected 
                  ? connection.connectionType === 'desktop' 
                    ? 'Desktop Connected'
                    : 'Cloud Connected'
                  : 'Not Connected'}
              </p>
              {connection.instanceName && (
                <p className="text-xs text-muted-foreground truncate">{connection.instanceName}</p>
              )}
            </div>
          )}
          {isSidebarOpen && (
            <Button variant="ghost" size="icon-sm">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Provider Status */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={`status-dot ${provider.isConfigured ? 'status-dot-warning' : 'status-dot-disconnected'}`} />
          {isSidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {provider.isConfigured 
                  ? provider.provider === 'azure-claude' 
                    ? 'Azure Claude'
                    : provider.provider === 'azure-openai'
                    ? 'Azure OpenAI'
                    : 'Ollama'
                  : 'No AI Provider'}
              </p>
              {provider.modelName && (
                <p className="text-xs text-muted-foreground truncate">{provider.modelName}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        <SidebarItem icon={Database} label="Connection" badge={connection.isConnected} open={isSidebarOpen} />
        <SidebarItem icon={Cpu} label="AI Provider" badge={provider.isConfigured} open={isSidebarOpen} onClick={() => setSettingsOpen(true)} />
        
        {schema && isSidebarOpen && (
          <div className="pt-4">
            <p className="text-xs font-medium text-muted-foreground px-3 mb-2">SCHEMA</p>
            <SidebarItem icon={Table2} label={`${schema.tables.length} Tables`} open={isSidebarOpen} />
            <SidebarItem icon={Ruler} label={`${schema.measures.length} Measures`} open={isSidebarOpen} />
            <SidebarItem icon={GitBranch} label={`${schema.relationships.length} Relationships`} open={isSidebarOpen} />
          </div>
        )}

        {isSidebarOpen && (
          <div className="pt-4">
            <p className="text-xs font-medium text-muted-foreground px-3 mb-2">TOOLS</p>
            <SidebarItem icon={FileEdit} label="PBIP Rename" open={isSidebarOpen} />
          </div>
        )}
      </nav>

      {/* Settings Button */}
      <div className="p-3 border-t border-border">
        <Button 
          variant="ghost" 
          size={isSidebarOpen ? "default" : "icon"} 
          className="w-full justify-start"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="w-4 h-4" />
          {isSidebarOpen && <span className="ml-2">Settings</span>}
        </Button>
      </div>
    </motion.aside>
  );
};

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  badge?: boolean;
  open: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, badge, open, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
  >
    <Icon className="w-4 h-4 shrink-0" />
    {open && (
      <>
        <span className="flex-1 text-left truncate">{label}</span>
        {badge !== undefined && (
          <span className={`w-2 h-2 rounded-full ${badge ? 'bg-accent' : 'bg-muted'}`} />
        )}
      </>
    )}
  </button>
);

export default Sidebar;
