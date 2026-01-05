import { useState } from "react";
import { Cpu, Server, HardDrive, Check, Loader2, AlertCircle, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SettingsModal = () => {
  const { isSettingsOpen, setSettingsOpen, setProvider, setConnection, setSchema } = useAppStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'provider' | 'connection'>('provider');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Provider form state
  const [selectedProvider, setSelectedProvider] = useState<'azure-claude' | 'azure-openai' | 'ollama'>('azure-claude');
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('claude-3-5-sonnet');

  // Cloud connection form state
  const [showCloudForm, setShowCloudForm] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [serviceUrl, setServiceUrl] = useState('');

  // Desktop instances state
  const [instances, setInstances] = useState<Array<{ port: number; model_name: string }>>([]);
  const [showInstancePicker, setShowInstancePicker] = useState(false);

  const handleSaveProvider = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (selectedProvider === 'azure-claude') {
        if (!endpoint || !apiKey) {
          throw new Error('Endpoint and API Key are required');
        }
        result = await api.configureAzureClaude({
          endpoint,
          api_key: apiKey,
          model: modelName,
        });
      } else if (selectedProvider === 'azure-openai') {
        if (!endpoint || !apiKey) {
          throw new Error('Endpoint and API Key are required');
        }
        result = await api.configureAzureOpenAI({
          endpoint,
          api_key: apiKey,
          deployment: modelName,
        });
      } else {
        result = await api.configureOllama({ model: modelName });
      }

      if (result.success) {
        setProvider({
          provider: selectedProvider,
          isConfigured: true,
          modelName: modelName,
        });

        toast({
          title: "Provider configured",
          description: result.message || `${selectedProvider === 'azure-claude' ? 'Azure Claude' : selectedProvider === 'azure-openai' ? 'Azure OpenAI' : 'Ollama'} is now ready to use.`,
        });
      } else {
        throw new Error(result.message || 'Failed to configure provider');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Configuration failed';
      setError(message);
      toast({
        title: "Configuration failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscoverDesktop = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.discoverDesktopInstances();

      if (result.count === 0) {
        toast({
          title: "No instances found",
          description: "Please open a .pbix file in Power BI Desktop first.",
          variant: "destructive",
        });
        return;
      }

      if (result.count === 1) {
        // Auto-connect to single instance
        await handleConnectToInstance(result.instances[0].port);
      } else {
        // Show instance picker
        setInstances(result.instances);
        setShowInstancePicker(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Discovery failed';
      setError(message);
      toast({
        title: "Discovery failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectToInstance = async (port: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const connectResult = await api.connectToInstance(port);

      if (connectResult.response?.includes('✅')) {
        // Get schema after connecting
        const schemaResult = await api.getSchema();

        setConnection({
          isConnected: true,
          connectionType: 'desktop',
          instanceName: `Port ${port}`,
        });

        if (schemaResult.schema) {
          // Transform schema to match frontend types
          setSchema({
            tables: schemaResult.schema.tables.map((name: string) => ({
              name,
              columns: [],
            })),
            measures: [],
            relationships: [],
          });
        }

        toast({
          title: "Connected to Power BI Desktop",
          description: connectResult.response,
        });

        setShowInstancePicker(false);
        setSettingsOpen(false);
      } else {
        throw new Error(connectResult.response || 'Connection failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      toast({
        title: "Connection failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectCloud = async () => {
    if (!showCloudForm) {
      setShowCloudForm(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!tenantId || !clientId || !clientSecret || !serviceUrl) {
        throw new Error('All fields are required');
      }

      const result = await api.configurePBIService({
        tenant_id: tenantId,
        client_id: clientId,
        client_secret: clientSecret,
        service_url: serviceUrl,
      });

      if (result.success) {
        setConnection({
          isConnected: true,
          connectionType: 'cloud',
          workspaceName: result.details?.split('\n')[0]?.replace('• Workspace: ', '') || 'Premium Workspace',
        });

        // Get schema after connecting
        const schemaResult = await api.getSchema();
        if (schemaResult.schema) {
          setSchema({
            tables: schemaResult.schema.tables.map((name: string) => ({
              name,
              columns: [],
            })),
            measures: [],
            relationships: [],
          });
        }

        toast({
          title: "Connected to Power BI Service",
          description: result.message,
        });

        setShowCloudForm(false);
        setSettingsOpen(false);
      } else {
        throw new Error(result.message || 'Connection failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      toast({
        title: "Connection failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="glass-panel border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <Cpu className="w-4 h-4 text-primary-foreground" />
            </div>
            Settings
          </DialogTitle>
        </DialogHeader>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('provider')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === 'provider' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            AI Provider
            {activeTab === 'provider' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('connection')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === 'connection' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Connection
            {activeTab === 'connection' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Provider Tab */}
        {activeTab === 'provider' && (
          <div className="space-y-6 py-4">
            {/* Provider Selection */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'azure-claude', label: 'Azure Claude', icon: Cpu, desc: 'Recommended' },
                { id: 'azure-openai', label: 'Azure OpenAI', icon: Server, desc: 'GPT-4' },
                { id: 'ollama', label: 'Ollama', icon: HardDrive, desc: 'Local' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvider(p.id as typeof selectedProvider)}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    selectedProvider === p.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-secondary/30 hover:border-muted-foreground'
                  }`}
                >
                  <p.icon className={`w-5 h-5 mb-2 ${selectedProvider === p.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="font-medium text-sm">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </button>
              ))}
            </div>

            {/* Configuration Fields */}
            {selectedProvider !== 'ollama' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Endpoint URL</label>
                  <input
                    type="url"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://your-resource.services.ai.azure.com"
                    className="w-full px-4 py-2.5 rounded-lg bg-input border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full px-4 py-2.5 rounded-lg bg-input border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              >
                {selectedProvider === 'azure-claude' && (
                  <>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                  </>
                )}
                {selectedProvider === 'azure-openai' && (
                  <>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                  </>
                )}
                {selectedProvider === 'ollama' && (
                  <>
                    <option value="powerbi-expert">Power BI Expert</option>
                    <option value="mistral">Mistral</option>
                    <option value="llama3">Llama 3</option>
                    <option value="codellama">Code Llama</option>
                  </>
                )}
              </select>
            </div>

            <Button
              onClick={handleSaveProvider}
              variant="gold"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Save Provider Configuration
            </Button>
          </div>
        )}

        {/* Connection Tab */}
        {activeTab === 'connection' && (
          <div className="space-y-6 py-4">
            {/* Instance Picker */}
            {showInstancePicker && instances.length > 0 && (
              <div className="glass-panel-highlight rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-sm">Select Power BI Instance</h4>
                {instances.map((inst) => (
                  <button
                    key={inst.port}
                    onClick={() => handleConnectToInstance(inst.port)}
                    disabled={isLoading}
                    className="w-full p-3 rounded-lg border border-border bg-secondary/30 hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  >
                    <p className="font-medium text-sm">{inst.model_name}</p>
                    <p className="text-xs text-muted-foreground">Port: {inst.port}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Cloud Configuration Form */}
            {showCloudForm && (
              <div className="glass-panel-highlight rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="w-5 h-5 text-purple-400" />
                  <h4 className="font-medium">Power BI Service Configuration</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Tenant ID</label>
                  <input
                    type="text"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border focus:border-primary focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Client ID (App ID)</label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border focus:border-primary focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Client Secret</label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="Enter your client secret"
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border focus:border-primary focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Power BI Dataset URL</label>
                  <input
                    type="url"
                    value={serviceUrl}
                    onChange={(e) => setServiceUrl(e.target.value)}
                    placeholder="https://app.powerbi.com/groups/{workspace_id}/datasets/{dataset_id}"
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border focus:border-primary focus:outline-none text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Copy from your Power BI dataset settings page
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCloudForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="gold"
                    className="flex-1"
                    onClick={handleConnectCloud}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                    Connect
                  </Button>
                </div>
              </div>
            )}

            {/* Connection Options */}
            {!showCloudForm && !showInstancePicker && (
              <div className="grid grid-cols-2 gap-4">
                {/* Desktop Connection */}
                <div className="glass-panel-highlight rounded-xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                    <HardDrive className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Power BI Desktop</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect to a .pbix file open in Power BI Desktop on this machine.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleDiscoverDesktop}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Discover & Connect
                  </Button>
                </div>

                {/* Cloud Connection */}
                <div className="glass-panel-highlight rounded-xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                    <Server className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Power BI Service</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect via XMLA endpoint (requires Premium/PPU license).
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleConnectCloud}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Configure Service
                  </Button>
                </div>
              </div>
            )}

            {/* Security Note */}
            <div className="glass-panel rounded-lg p-4">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Security Note:</strong> Only schema metadata (table names, column names, measure definitions)
                is sent to the AI provider. Your actual data never leaves your environment.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
