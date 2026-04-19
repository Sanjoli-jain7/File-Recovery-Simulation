import { useState, useEffect } from 'react';
import { HardDrive, RefreshCw, AlertCircle, CheckCircle2, FolderOpen } from 'lucide-react';
import { api } from './services/api';
import FilesList from './components/FilesList';

function App() {
  const [drive, setDrive] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [files, setFiles] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  useEffect(() => {
    checkBackendConnection();
    loadRecoveredFiles();
  }, []);

  const checkBackendConnection = async () => {
    const connected = await api.checkConnection();
    setIsConnected(connected);
  };

  const loadRecoveredFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await api.getRecoveredFiles();
      setFiles(response.files);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!drive.trim()) {
      setRecoveryStatus({
        type: 'error',
        message: 'Please enter a drive path',
      });
      return;
    }

    setIsRecovering(true);
    setRecoveryStatus({ type: null, message: '' });

    try {
      const result = await api.startRecovery(drive);

      if (result.status === 'success') {
        setRecoveryStatus({
          type: 'success',
          message: result.message,
        });
        await loadRecoveredFiles();
      } else {
        setRecoveryStatus({
          type: 'error',
          message: result.message,
        });
      }
    } catch (error) {
      setRecoveryStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Recovery failed',
      });
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-lg shadow-lg">
              <HardDrive className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                File Recovery Tool
              </h1>
              <p className="text-gray-600 mt-1">
                Recover deleted files from your drives
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                isConnected
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              {isConnected ? 'Backend Connected' : 'Backend Disconnected'}
            </div>
            {!isConnected && (
              <button
                onClick={checkBackendConnection}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Retry Connection
              </button>
            )}
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <form onSubmit={handleRecovery} className="space-y-4">
            <div>
              <label
                htmlFor="drive"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Drive Path
              </label>
              <input
                type="text"
                id="drive"
                value={drive}
                onChange={(e) => setDrive(e.target.value)}
                placeholder="e.g., /dev/sda1 or C:"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isRecovering || !isConnected}
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the drive path you want to recover files from (e.g., C: for Windows or /dev/sda1 for Linux)
              </p>
            </div>

            <button
              type="submit"
              disabled={isRecovering || !isConnected}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md"
            >
              {isRecovering ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Recovering Files...
                </>
              ) : (
                <>
                  <HardDrive className="w-5 h-5" />
                  Start Recovery
                </>
              )}
            </button>
          </form>

          {recoveryStatus.type && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                recoveryStatus.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {recoveryStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-medium ${
                    recoveryStatus.type === 'success'
                      ? 'text-green-800'
                      : 'text-red-800'
                  }`}
                >
                  {recoveryStatus.type === 'success' ? 'Success!' : 'Error'}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    recoveryStatus.type === 'success'
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}
                >
                  {recoveryStatus.message}
                </p>
              </div>
            </div>
          )}
        </div>

        {isLoadingFiles ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 flex flex-col items-center justify-center">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading recovered files...</p>
          </div>
        ) : files.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <FilesList files={files} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
            <FolderOpen className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Recovered Files Yet
            </h3>
            <p className="text-gray-500 max-w-md">
              Enter a drive path above and click "Start Recovery" to begin recovering deleted files.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
