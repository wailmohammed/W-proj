'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  AlertCircle, 
  CheckCircle, 
  Settings, 
  Key, 
  Database, 
  RefreshCw,
  Plus,
  Trash2,
  TestTube
} from 'lucide-react';
import { adminConfigService, ApiProviderConfig, SystemSetting } from '@/services/adminConfigService';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminDashboard() {
  const [apiConfigs, setApiConfigs] = useState<ApiProviderConfig[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: { success: boolean; message: string } }>({});
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [configs, settings] = await Promise.all([
      adminConfigService.getApiConfigs(),
      adminConfigService.getSystemSettings()
    ]);
    setApiConfigs(configs);
    setSystemSettings(settings);
    setLoading(false);
  };

  const handleTestConnection = async (config: ApiProviderConfig) => {
    if (!config.value && config.name.includes('API_KEY')) {
      setTestResults(prev => ({
        ...prev,
        [config.name]: { success: false, message: 'API key is required' }
      }));
      return;
    }

    setTestingConnection(config.name);
    const result = await adminConfigService.testApiConnection(
      config.value || config.name,
      config.value
    );
    setTestResults(prev => ({ ...prev, [config.name]: result }));
    setTestingConnection(null);
  };

  const handleSaveConfig = async (config: ApiProviderConfig) => {
    const updatedConfig = {
      ...config,
      value: editValues[config.name] || config.value
    };
    
    const success = await adminConfigService.updateApiConfig(updatedConfig);
    if (success) {
      setEditMode(null);
      loadData();
    }
  };

  const handleUpdateSetting = async (setting: SystemSetting, value: any) => {
    const success = await adminConfigService.updateSystemSetting(setting.key, value);
    if (success) {
      loadData();
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market_data': return 'bg-blue-500';
      case 'ai': return 'bg-purple-500';
      case 'news': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage API keys and system configurations</p>
        </div>
        <Button onClick={loadData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api">
            <Key className="mr-2 h-4 w-4" />
            API Configurations
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            System Settings
          </TabsTrigger>
        </TabsList>

        {/* API Configurations Tab */}
        <TabsContent value="api" className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Configure your API providers here. Keys are encrypted in production. 
              Changes take effect immediately for new requests.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {apiConfigs.map((config) => (
              <Card key={config.name}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(config.category)}>
                        {config.category}
                      </Badge>
                      {testResults[config.name]?.success && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {testResults[config.name] && !testResults[config.name].success && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{config.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                  
                  {editMode === config.name ? (
                    <div className="space-y-2">
                      <Input
                        type={config.isEncrypted ? 'password' : 'text'}
                        value={editValues[config.name] || config.value}
                        onChange={(e) => setEditValues(prev => ({ ...prev, [config.name]: e.target.value }))}
                        placeholder="Enter value..."
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveConfig(config)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditMode(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {config.value ? '••••••••' : 'Not configured'}
                        </span>
                        <div className="flex gap-1">
                          {!config.name.includes('PROVIDER') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTestConnection(config)}
                              disabled={testingConnection === config.name}
                            >
                              {testingConnection === config.name ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <TestTube className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditValues(prev => ({ ...prev, [config.name]: config.value }));
                              setEditMode(config.name);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                      
                      {testResults[config.name] && (
                        <p className={`text-xs ${testResults[config.name].success ? 'text-green-600' : 'text-red-600'}`}>
                          {testResults[config.name].message}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-full py-8">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Add Custom Provider</p>
                <Button variant="link" size="sm">Coming Soon</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              Configure system-wide behavior and preferences.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            {systemSettings.map((setting) => (
              <Card key={setting.key}>
                <CardHeader>
                  <CardTitle className="text-base">{setting.key}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{setting.description}</p>
                  
                  {setting.type === 'boolean' ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enabled</span>
                      <Switch
                        checked={setting.value}
                        onCheckedChange={(checked) => handleUpdateSetting(setting, checked)}
                      />
                    </div>
                  ) : setting.type === 'number' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={setting.value}
                        onChange={(e) => handleUpdateSetting(setting, parseFloat(e.target.value))}
                        className="w-24"
                      />
                      <Button size="sm" onClick={() => handleUpdateSetting(setting, parseFloat((e.target as HTMLInputElement).value))}>
                        Update
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        value={setting.value}
                        onChange={(e) => handleUpdateSetting(setting, e.target.value)}
                      />
                      <Button size="sm" onClick={() => handleUpdateSetting(setting, (e.target as HTMLInputElement).value)}>
                        Update
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
