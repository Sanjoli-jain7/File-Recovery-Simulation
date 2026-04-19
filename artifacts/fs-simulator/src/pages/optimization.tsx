import React from "react";
import { useDefragmentDisk, useGetPerformanceHistory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Wrench, Zap, TrendingDown } from "lucide-react";
import { useInvalidateAll } from "@/hooks/use-invalidate-all";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Optimization() {
  const defrag = useDefragmentDisk();
  const { data: perf, isLoading } = useGetPerformanceHistory();
  const invalidateAll = useInvalidateAll();
  const { toast } = useToast();

  const handleDefrag = () => {
    defrag.mutate(undefined, {
      onSuccess: (res) => {
        invalidateAll();
        toast({
          title: "DEFRAGMENTATION COMPLETE",
          description: `Moved ${res.blocksMoved} blocks. Improvement: ${res.improvementPercent.toFixed(1)}%`
        });
      }
    });
  };

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-mono text-primary">OPTIMIZATION_ENGINE</h1>
        <p className="text-muted-foreground font-mono mt-2">Reorganize blocks to improve sequential access speeds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-4 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-mono">DEFRAGMENT_DISK</CardTitle>
            <CardDescription className="font-mono">Make non-contiguous files contiguous</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="p-4 border border-border bg-background rounded-md space-y-4">
              <div className="flex justify-between items-center text-sm font-mono">
                <span className="text-muted-foreground">CURRENT_FRAG:</span>
                <span className="text-warning font-bold">{(perf?.currentFragmentation ? perf.currentFragmentation * 100 : 0).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center text-sm font-mono">
                <span className="text-muted-foreground">AVG_LATENCY:</span>
                <span className="text-primary font-bold">{perf?.currentAvgAccessTime.toFixed(2)}ms</span>
              </div>
            </div>

            <Button 
              className="w-full font-mono" 
              onClick={handleDefrag}
              disabled={defrag.isPending}
            >
              <Wrench className={`w-4 h-4 mr-2 ${defrag.isPending ? 'animate-spin' : ''}`} />
              EXEC_DEFRAG
            </Button>
            
          </CardContent>
        </Card>

        <Card className="md:col-span-8 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-mono flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-primary" />
              PERFORMANCE_METRICS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={perf?.entries || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    fontFamily="monospace" 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}ms`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      fontFamily: 'monospace'
                    }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgAccessTime" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorLatency)" 
                    strokeWidth={2}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
