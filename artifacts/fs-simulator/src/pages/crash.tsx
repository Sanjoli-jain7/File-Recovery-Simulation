import React, { useState } from "react";
import { useSimulateCrash, useCorruptFile, useGetFilesystem } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Zap, Skull } from "lucide-react";
import { useInvalidateAll } from "@/hooks/use-invalidate-all";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Crash() {
  const simulateCrash = useSimulateCrash();
  const corruptFile = useCorruptFile();
  const { data: fs } = useGetFilesystem();
  const invalidateAll = useInvalidateAll();
  const { toast } = useToast();

  const [selectedFileId, setSelectedFileId] = useState<string>("");

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

  const handleCrash = () => {
    simulateCrash.mutate(undefined, {
      onSuccess: (res) => {
        invalidateAll();
        toast({
          title: "SYSTEM CRASH INITIATED",
          description: res.message,
          variant: "destructive"
        });
      }
    });
  };

  const handleCorrupt = () => {
    if (!selectedFileId) return;
    corruptFile.mutate({ data: { fileId: selectedFileId } }, {
      onSuccess: () => {
        invalidateAll();
        toast({
          title: "FILE CORRUPTED",
          description: `Sector corruption injected into ${selectedFileId}`,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-mono text-destructive">FAILURE_SIMULATION</h1>
        <p className="text-muted-foreground font-mono mt-2">Inject faults and trigger systemic failures.</p>
      </div>

      <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="font-mono font-bold">WARNING</AlertTitle>
        <AlertDescription className="font-mono text-xs">
          These operations will intentionally damage the filesystem. Data loss is expected.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur border-destructive/30">
          <CardHeader>
            <CardTitle className="font-mono text-destructive flex items-center gap-2">
              <Skull className="w-5 h-5" />
              GLOBAL_PANIC
            </CardTitle>
            <CardDescription className="font-mono">Trigger a random multi-sector failure</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-8">
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="lg" 
                  className="w-48 h-48 rounded-full shadow-lg shadow-destructive/20 border-4 border-destructive/50 hover:bg-destructive text-xl font-bold font-mono active:scale-95 transition-all"
                  disabled={simulateCrash.isPending}
                >
                  <div className="flex flex-col items-center">
                    <Zap className="w-12 h-12 mb-2 animate-pulse" />
                    SIM_CRASH
                  </div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-destructive/50">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-mono text-destructive">INITIATE KERNEL PANIC?</AlertDialogTitle>
                  <AlertDialogDescription className="font-mono">
                    This will randomly corrupt disk blocks and delete directory entries. The system will require recovery procedures to restore integrity.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="font-mono">CANCEL</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCrash} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono">
                    PROCEED
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-mono">TARGETED_CORRUPTION</CardTitle>
            <CardDescription className="font-mono">Surgically corrupt a specific file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-mono text-xs">SELECT_TARGET</Label>
              <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                <SelectTrigger className="font-mono text-sm bg-background border-destructive/20">
                  <SelectValue placeholder="Select healthy file..." />
                </SelectTrigger>
                <SelectContent>
                  {files.filter(f => f.status === 'healthy').map(f => (
                    <SelectItem key={f.id} value={f.id} className="font-mono text-sm">
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full mt-4 font-mono text-sm" 
              variant="outline"
              onClick={handleCorrupt}
              disabled={!selectedFileId || corruptFile.isPending}
            >
              <Zap className="w-4 h-4 mr-2 text-warning" />
              INJECT_FAULT
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
