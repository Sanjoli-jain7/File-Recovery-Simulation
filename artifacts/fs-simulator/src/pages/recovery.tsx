import React, { useState } from "react";
import { useRecoverFiles, useGetRecoveryLogs } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, DatabaseBackup, BookOpen, Activity } from "lucide-react";
import { useInvalidateAll } from "@/hooks/use-invalidate-all";
import { useToast } from "@/hooks/use-toast";

export default function Recovery() {
  const recoverFiles = useRecoverFiles();
  const { data: logs } = useGetRecoveryLogs();
  const invalidateAll = useInvalidateAll();
  const { toast } = useToast();

  const [method, setMethod] = useState<"journal" | "backup">("journal");
  const [progress, setProgress] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  const handleRecovery = () => {
    setIsRecovering(true);
    setProgress(0);
    
    // Simulate progress bar
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 10;
      });
    }, 200);

    recoverFiles.mutate({
      data: { method }
    }, {
      onSuccess: (res) => {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setIsRecovering(false), 500);
        invalidateAll();
        
        toast({
          title: `RECOVERY_${res.status.toUpperCase()}`,
          description: res.message,
          variant: res.status === 'success' ? 'default' : 'destructive'
        });
      },
      onError: () => {
        clearInterval(interval);
        setIsRecovering(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-mono text-primary">RECOVERY_PROTOCOL</h1>
        <p className="text-muted-foreground font-mono mt-2">Restore compromised sectors via journaling or backups.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-mono">STRATEGY_SELECT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={method} onValueChange={(v: any) => setMethod(v)}>
              <div className={`flex items-start space-x-3 p-4 rounded-md border ${method === 'journal' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                <RadioGroupItem value="journal" id="journal" className="mt-1" />
                <Label htmlFor="journal" className="font-mono cursor-pointer">
                  <div className="flex items-center gap-2 mb-1 text-primary">
                    <BookOpen className="w-4 h-4" />
                    <span>JOURNAL_REPLAY</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Replays recent filesystem transactions. Fast, but may miss deeply corrupted blocks.
                  </div>
                </Label>
              </div>

              <div className={`flex items-start space-x-3 p-4 rounded-md border mt-4 ${method === 'backup' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                <RadioGroupItem value="backup" id="backup" className="mt-1" />
                <Label htmlFor="backup" className="font-mono cursor-pointer">
                  <div className="flex items-center gap-2 mb-1 text-primary">
                    <DatabaseBackup className="w-4 h-4" />
                    <span>SNAPSHOT_RESTORE</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Restores from last known good state. High success rate, but slower and loses recent writes.
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <Button 
              className="w-full font-mono font-bold" 
              onClick={handleRecovery}
              disabled={isRecovering}
            >
              {isRecovering ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-pulse" />
                  ANALYZING...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  INITIATE_RECOVERY
                </>
              )}
            </Button>

            {isRecovering && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>SCANNING_SECTORS</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1 bg-muted" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-8 bg-card/50 backdrop-blur flex flex-col">
          <CardHeader>
            <CardTitle className="font-mono">DIAGNOSTIC_LOG</CardTitle>
            <CardDescription className="font-mono">Real-time recovery operations output</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="bg-black/50 border border-border rounded-md p-4 h-[400px] font-mono text-xs overflow-hidden flex flex-col">
              <ScrollArea className="flex-1">
                <div className="space-y-2 pb-4">
                  {logs?.map((log) => (
                    <div key={log.id} className="flex gap-3">
                      <span className="text-muted-foreground shrink-0">
                        [{new Date(log.timestamp).toISOString().split('T')[1]}]
                      </span>
                      <span className={`
                        ${log.severity === 'error' ? 'text-destructive' : ''}
                        ${log.severity === 'warn' ? 'text-warning' : ''}
                        ${log.severity === 'success' ? 'text-success' : ''}
                        ${log.severity === 'info' ? 'text-primary' : ''}
                      `}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  {(!logs || logs.length === 0) && (
                    <div className="text-muted-foreground">SYSTEM_READY. WAITING_FOR_OPERATIONS...</div>
                  )}
                  {isRecovering && (
                    <div className="text-primary animate-pulse">_</div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
