import React, { useState } from "react";
import { useGetFilesystem, useAccessFile, AccessResult } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Clock, Server } from "lucide-react";
import { useInvalidateAll } from "@/hooks/use-invalidate-all";

export default function Access() {
  const { data: fs, isLoading } = useGetFilesystem();
  const accessFile = useAccessFile();
  const invalidateAll = useInvalidateAll();

  const [selectedFileId, setSelectedFileId] = useState<string>("");
  const [method, setMethod] = useState<"sequential" | "direct">("sequential");
  const [operation, setOperation] = useState<"read" | "write">("read");
  const [result, setResult] = useState<AccessResult | null>(null);

  // Flatten the tree to get files
  const getFiles = (node: any): any[] => {
    let files = [];
    if (node.type === "file") files.push(node);
    if (node.children) {
      node.children.forEach((child: any) => {
        files = [...files, ...getFiles(child)];
      });
    }
    return files;
  };

  const files = fs ? getFiles(fs.root) : [];

  const handleSimulate = () => {
    if (!selectedFileId) return;
    
    accessFile.mutate({
      data: {
        fileId: selectedFileId,
        method,
        operation
      }
    }, {
      onSuccess: (data) => {
        setResult(data);
        invalidateAll();
      }
    });
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-mono">ACCESS_SIMULATION</h1>
        <p className="text-muted-foreground font-mono mt-2">Test performance of different I/O methods.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-4 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-mono">PARAMETERS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-mono text-xs">TARGET_FILE</Label>
              <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                <SelectTrigger className="font-mono text-sm bg-background">
                  <SelectValue placeholder="Select file..." />
                </SelectTrigger>
                <SelectContent>
                  {files.map(f => (
                    <SelectItem key={f.id} value={f.id} className="font-mono text-sm">
                      {f.name} ({f.size} blocks)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs">ACCESS_METHOD</Label>
              <Select value={method} onValueChange={(v: any) => setMethod(v)}>
                <SelectTrigger className="font-mono text-sm bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential" className="font-mono text-sm">Sequential</SelectItem>
                  <SelectItem value="direct" className="font-mono text-sm">Direct (Random)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs">OPERATION</Label>
              <Select value={operation} onValueChange={(v: any) => setOperation(v)}>
                <SelectTrigger className="font-mono text-sm bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read" className="font-mono text-sm">READ</SelectItem>
                  <SelectItem value="write" className="font-mono text-sm">WRITE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full mt-4 font-mono text-sm" 
              onClick={handleSimulate}
              disabled={!selectedFileId || accessFile.isPending}
            >
              <Activity className={`w-4 h-4 mr-2 ${accessFile.isPending ? 'animate-pulse' : ''}`} />
              EXECUTE_IO
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-8 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-mono">TELEMETRY</CardTitle>
            <CardDescription className="font-mono">Operation timing metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border border-border bg-background rounded-md text-center">
                    <div className="text-xs text-muted-foreground font-mono mb-1">SEEK_TIME</div>
                    <div className="text-2xl font-bold font-mono text-primary">{result.seekTime.toFixed(1)}ms</div>
                  </div>
                  <div className="p-4 border border-border bg-background rounded-md text-center">
                    <div className="text-xs text-muted-foreground font-mono mb-1">TRANSFER_TIME</div>
                    <div className="text-2xl font-bold font-mono text-primary">{result.transferTime.toFixed(1)}ms</div>
                  </div>
                  <div className="p-4 border border-border bg-background rounded-md text-center">
                    <div className="text-xs text-muted-foreground font-mono mb-1">TOTAL_LATENCY</div>
                    <div className="text-2xl font-bold font-mono text-warning">{result.totalTime.toFixed(1)}ms</div>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-md bg-muted/20 font-mono text-sm space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Server className="w-4 h-4" />
                    <span>TRACE_LOG</span>
                  </div>
                  <div className="pl-6 text-muted-foreground space-y-1">
                    <p>{'>'} INIT {result.operation.toUpperCase()} VIA {result.method.toUpperCase()} ACCESS</p>
                    <p>{'>'} TARGET: {result.fileId}</p>
                    <p>{'>'} BLOCKS TRAVERSED: [{result.blocksAccessed.join(", ")}]</p>
                    <p className="text-success">{'>'} OPERATION_COMPLETE_SUCCESS</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center border border-dashed border-border rounded-md text-muted-foreground font-mono text-sm">
                AWAITING_EXECUTION...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
