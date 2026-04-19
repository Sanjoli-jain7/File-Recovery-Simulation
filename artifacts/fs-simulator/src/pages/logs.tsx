import React, { useState } from "react";
import { useGetActivityLog, ActivityEntryCategory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter } from "lucide-react";

export default function Logs() {
  const { data: logs, isLoading } = useGetActivityLog();
  const [filter, setFilter] = useState<string>("all");

  if (isLoading) return <Skeleton className="h-[600px]" />;

  const filteredLogs = logs?.filter(log => filter === "all" || log.category === filter) || [];

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-mono">SYSTEM_LOGS</h1>
          <p className="text-muted-foreground font-mono mt-2">Comprehensive kernel activity trace.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] font-mono text-xs bg-background">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-mono text-xs">ALL_CATEGORIES</SelectItem>
              <SelectItem value="filesystem" className="font-mono text-xs">FILESYSTEM</SelectItem>
              <SelectItem value="access" className="font-mono text-xs">IO_ACCESS</SelectItem>
              <SelectItem value="crash" className="font-mono text-xs">CRASH_EVENTS</SelectItem>
              <SelectItem value="recovery" className="font-mono text-xs">RECOVERY</SelectItem>
              <SelectItem value="optimization" className="font-mono text-xs">OPTIMIZATION</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-black/80 backdrop-blur border-border flex-1 overflow-hidden flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4 font-mono text-xs">
            <div className="space-y-1 pb-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex gap-4 group hover:bg-white/5 p-1 rounded-sm transition-colors">
                  <span className="text-muted-foreground shrink-0 w-44">
                    {new Date(log.timestamp).toISOString().replace('T', ' ')}
                  </span>
                  <span className={`shrink-0 w-28 uppercase font-bold
                    ${log.category === 'crash' ? 'text-destructive' : ''}
                    ${log.category === 'recovery' ? 'text-success' : ''}
                    ${log.category === 'optimization' ? 'text-warning' : ''}
                    ${log.category === 'access' ? 'text-primary' : ''}
                    ${log.category === 'filesystem' ? 'text-muted-foreground' : ''}
                  `}>
                    [{log.category}]
                  </span>
                  <span className="text-foreground shrink-0 min-w-[120px]">
                    {log.action}
                  </span>
                  <span className="text-muted-foreground truncate">
                    {log.details}
                  </span>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="text-muted-foreground p-4 text-center">NO_ENTRIES_FOUND</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
