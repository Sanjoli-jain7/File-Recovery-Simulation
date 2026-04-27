const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface RecoveryResult {
  status: string;
  message: string;
}

export interface FilesResponse {
  files: string[];
}

export const api = {
  async startRecovery(drive: string): Promise<RecoveryResult> {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/file-recovery`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ drive }),
      }
    );

    if (!response.ok) {
      throw new Error('Recovery failed');
    }

    return response.json();
  },

  async getRecoveredFiles(): Promise<FilesResponse> {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/recovered-files`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${anonKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    return response.json();
  },

  async checkConnection(): Promise<boolean> {
    try {
      await this.getRecoveredFiles();
      return true;
    } catch {
      return false;
    }
  },
};
