import React from "react";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive, FileText, AlertTriangle, Clock, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight font-mono">SYSTEM_OVERVIEW</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-mono">SYSTEM_OVERVIEW</h1>
        <p className="text-muted-foreground font-mono mt-2">Real-time metrics and disk state analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-mono text-muted-foreground">DISK_USAGE</CardTitle>
            <HardDrive className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.diskUsagePercent.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">
              {stats.usedBlocks} / {stats.totalBlocks} BLOCKS
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-mono text-muted-foreground">TOTAL_FILES</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.totalFiles}</div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">
              {stats.healthyFiles} HEALTHY
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-mono text-muted-foreground">CORRUPTION</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">{stats.corruptedFiles}</div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">
              FILES AFFECTED
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-mono text-muted-foreground">AVG_ACCESS_TIME</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.avgAccessTimeMs.toFixed(2)}ms</div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">
              READ/WRITE LATENCY
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-mono text-muted-foreground">FRAGMENTATION</CardTitle>
            <Zap className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-warning">{(stats.fragmentationScore * 100).toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">
              SCORE
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adding a placeholder for chart if needed, we'll build it in Optimization/Logs */}
    </div>
  );
}
