import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DiskBlocksState } from "@workspace/api-client-react";

interface DiskBlockGridProps {
  blocks: DiskBlocksState;
  onBlockClick?: (blockNum: number, fileId?: string) => void;
  highlightedBlocks?: number[];
}

export function DiskBlockGrid({ blocks, onBlockClick, highlightedBlocks = [] }: DiskBlockGridProps) {
  // Generate 100 blocks
  const grid = Array.from({ length: 100 }, (_, i) => i);
  
  const getBlockStatus = (index: number) => {
    // 0 = free, 1 = used (healthy), 2 = corrupted
    const bit = blocks.bitmap[index];
    if (bit === 0) return "free";
    
    // Simplification for the visualizer: we assume a block is corrupted if it's used but missing from blockMap?
    // Actually, fragmentation/corruption might need more detailed parsing, but let's use the bitmap.
    // 1 = healthy/used. For corrupted, we'd need more specific file info, but we can display used/free.
    // Wait, the bitmap is just 0 | 1 in the API spec.
    return "used";
  };

  const getBlockColor = (index: number) => {
    if (highlightedBlocks.includes(index)) return "bg-warning";
    const status = getBlockStatus(index);
    if (status === "free") return "bg-success/20 border-success/30 text-success";
    if (status === "used") {
      // Check if it belongs to a corrupted file if we had that info, 
      // but without file states here we just show primary color
      return "bg-primary/20 border-primary/30 text-primary";
    }
    return "bg-muted border-border text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-10 gap-1 lg:gap-2">
        {grid.map((index) => {
          const fileId = blocks.blockMap[index];
          const isHighlighted = highlightedBlocks.includes(index);
          
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={false}
                  animate={{ 
                    scale: isHighlighted ? 1.05 : 1,
                    backgroundColor: isHighlighted ? "var(--warning)" : undefined
                  }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => onBlockClick?.(index, fileId)}
                  className={`
                    aspect-square rounded-sm border flex items-center justify-center font-mono text-[10px] cursor-pointer transition-colors duration-200
                    ${getBlockColor(index)}
                  `}
                >
                  {index}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent className="font-mono text-xs">
                <p>Block {index}</p>
                <p>Status: {getBlockStatus(index)}</p>
                {fileId && <p>File ID: {fileId}</p>}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      
      {/* Bitmap Visualization */}
      <div className="space-y-2 pt-4 border-t border-border">
        <h4 className="text-sm font-mono font-semibold">Bitmap Allocation Array</h4>
        <div className="flex flex-wrap gap-0.5">
          {blocks.bitmap.map((bit, idx) => (
            <div 
              key={idx}
              className={`w-1.5 h-4 rounded-sm ${bit === 1 ? 'bg-primary' : 'bg-muted'}`}
              title={`Block ${idx}: ${bit}`}
            />
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-xs font-mono mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-success/20 border border-success/30" />
          <span>Free ({blocks.freeBlocks})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/30" />
          <span>Used ({blocks.usedBlocks})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-warning" />
          <span>Active/Fragmented</span>
        </div>
      </div>
    </div>
  );
}
