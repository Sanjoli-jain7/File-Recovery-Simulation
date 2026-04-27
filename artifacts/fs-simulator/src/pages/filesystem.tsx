import React, { useState } from "react";
import { useGetFilesystem, useGetDiskBlocks, useCreateFile, useDeleteFile, FileNode } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileTree } from "@/components/file-tree";
import { DiskBlockGrid } from "@/components/disk-block-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvalidateAll } from "@/hooks/use-invalidate-all";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, File as FileIcon, Folder as FolderIcon } from "lucide-react";

export default function Filesystem() {
  const { data: fs, isLoading: fsLoading } = useGetFilesystem();
  const { data: blocks, isLoading: blocksLoading } = useGetDiskBlocks();
  const invalidateAll = useInvalidateAll();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [newFileSize, setNewFileSize] = useState(1);

  const createFile = useCreateFile();
  const deleteFile = useDeleteFile();

  const handleCreateFile = (type: "file" | "directory") => {
    if (!newFileName) return;
    
    createFile.mutate({
      data: {
        name: newFileName,
        type,
        parentId: selectedFile?.type === "directory" ? selectedFile.id : (selectedFile?.parentId || null),
        size: type === "file" ? newFileSize : 0
      }
    }, {
      onSuccess: () => {
        setNewFileName("");
        invalidateAll();
        toast({ title: "Success", description: `${type} created successfully.` });
      }
    });
  };

  const handleDelete = () => {
    if (!selectedFile || selectedFile.id === 'root') return;
    
    deleteFile.mutate({ id: selectedFile.id }, {
      onSuccess: () => {
        setSelectedFile(null);
        invalidateAll();
        toast({ title: "Success", description: "Deleted successfully." });
      }
    });
  };

  if (fsLoading || blocksLoading) {
    return <div className="space-y-6"><Skeleton className="h-96" /></div>;
  }

  if (!fs || !blocks) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-mono">FILE_SYSTEM</h1>
        <p className="text-muted-foreground font-mono mt-2">Interactive tree and disk allocation visualization.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-mono">DIRECTORY_TREE</CardTitle>
            <CardDescription className="font-mono">Select a node to manage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-md p-2 bg-background min-h-[400px] overflow-auto">
              <FileTree 
                root={fs.root} 
                selectedId={selectedFile?.id}
                onSelect={setSelectedFile}
              />
            </div>
            
            {/* Context Actions */}
            <div className="mt-4 p-4 border border-border rounded-md bg-muted/20 space-y-4">
              <div className="font-mono text-xs text-muted-foreground mb-2">
                TARGET: {selectedFile ? selectedFile.name : "root"}
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">NEW_NODE_NAME</Label>
                <Input 
                  placeholder="filename.txt" 
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="font-mono text-sm bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">SIZE_BLOCKS</Label>
                <Input 
                  type="number" 
                  min={1} 
                  max={20}
                  value={newFileSize}
                  onChange={(e) => setNewFileSize(parseInt(e.target.value) || 1)}
                  className="font-mono text-sm bg-background"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 font-mono text-xs"
                  onClick={() => handleCreateFile("file")}
                  disabled={!newFileName || createFile.isPending}
                >
                  <FileIcon className="w-3 h-3 mr-2" />
                  +FILE
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 font-mono text-xs"
                  onClick={() => handleCreateFile("directory")}
                  disabled={!newFileName || createFile.isPending}
                >
                  <FolderIcon className="w-3 h-3 mr-2" />
                  +DIR
                </Button>
              </div>
              
              {selectedFile && selectedFile.id !== 'root' && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full font-mono text-xs mt-2"
                  onClick={handleDelete}
                  disabled={deleteFile.isPending}
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  DELETE_SELECTED
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-mono">BLOCK_ALLOCATION_GRID</CardTitle>
            <CardDescription className="font-mono">Physical disk block mapping</CardDescription>
          </CardHeader>
          <CardContent>
            <DiskBlockGrid 
              blocks={blocks} 
              highlightedBlocks={selectedFile?.blocks || []}
            />
            
            {selectedFile && (
              <div className="mt-6 p-4 border border-border rounded-md bg-muted/20 font-mono text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground">ID: </span>
                    <span className="text-primary">{selectedFile.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">STATUS: </span>
                    <span className={
                      selectedFile.status === 'healthy' ? 'text-success' :
                      selectedFile.status === 'corrupted' ? 'text-destructive' :
                      'text-warning'
                    }>{selectedFile.status.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SIZE: </span>
                    <span>{selectedFile.size} BLOCKS</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CREATED: </span>
                    <span>{new Date(selectedFile.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-border">
                  <span className="text-muted-foreground">ALLOCATED_BLOCKS: </span>
                  <span>[{selectedFile.blocks.join(", ")}]</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
