import React, { useState } from "react";
import { FileNode } from "@workspace/api-client-react";
import { Folder, File, ChevronRight, ChevronDown, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  root: FileNode;
  selectedId?: string;
  onSelect?: (node: FileNode) => void;
}

export function FileTree({ root, selectedId, onSelect }: FileTreeProps) {
  return (
    <div className="font-mono text-sm">
      <FileTreeNode node={root} selectedId={selectedId} onSelect={onSelect} level={0} defaultExpanded />
    </div>
  );
}

interface FileTreeNodeProps {
  node: FileNode;
  selectedId?: string;
  onSelect?: (node: FileNode) => void;
  level: number;
  defaultExpanded?: boolean;
}

function FileTreeNode({ node, selectedId, onSelect, level, defaultExpanded = false }: FileTreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  const isDirectory = node.type === "directory";
  const isSelected = selectedId === node.id;
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDirectory) {
      setExpanded(!expanded);
    }
  };

  const handleSelect = () => {
    onSelect?.(node);
  };

  const getStatusIcon = () => {
    switch (node.status) {
      case "corrupted":
        return <AlertCircle className="w-3.5 h-3.5 text-destructive ml-2" />;
      case "deleted":
        return <Trash2 className="w-3.5 h-3.5 text-muted-foreground ml-2" />;
      case "recovering":
        return <RefreshCcw className="w-3.5 h-3.5 text-warning animate-spin ml-2" />;
      case "healthy":
        return null;
    }
  };

  const getStatusColor = () => {
    if (isSelected) return "bg-primary/20 text-primary-foreground";
    switch (node.status) {
      case "corrupted": return "text-destructive hover:bg-destructive/10";
      case "deleted": return "text-muted-foreground opacity-50 hover:bg-muted";
      default: return "text-foreground hover:bg-accent";
    }
  };

  return (
    <div>
      <div 
        className={cn(
          "flex items-center py-1 px-2 cursor-pointer rounded-sm group transition-colors",
          getStatusColor()
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelect}
      >
        <div className="flex items-center flex-1 overflow-hidden" onClick={handleToggle}>
          <span className="w-4 h-4 flex items-center justify-center mr-1 shrink-0">
            {isDirectory && (
              expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </span>
          {isDirectory ? (
            <Folder className={cn("w-4 h-4 mr-2 shrink-0", isSelected ? "text-primary" : "text-primary/70")} />
          ) : (
            <File className={cn("w-4 h-4 mr-2 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
          )}
          <span className="truncate">{node.name}</span>
          {getStatusIcon()}
        </div>
        {!isDirectory && (
          <span className="text-[10px] text-muted-foreground ml-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {node.size}B
          </span>
        )}
      </div>
      
      {isDirectory && expanded && node.children && (
        <div>
          {node.children.map(child => (
            <FileTreeNode 
              key={child.id} 
              node={child} 
              selectedId={selectedId} 
              onSelect={onSelect} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
