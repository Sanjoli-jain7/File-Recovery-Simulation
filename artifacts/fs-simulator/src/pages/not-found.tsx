import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4">
      <Card className="w-full max-w-md mx-4 bg-card/50 backdrop-blur border-destructive/30">
        <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-destructive animate-pulse" />
            <h1 className="text-2xl font-bold font-mono text-destructive">404</h1>
          </div>
          <p className="text-muted-foreground font-mono">SECTOR_NOT_FOUND</p>
          <p className="text-xs text-muted-foreground font-mono">
            The requested memory address is invalid or unallocated.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
