import { v4 as uuidv4 } from "uuid";

export type FileStatus = "healthy" | "corrupted" | "deleted" | "recovering";
export type NodeType = "file" | "directory";

export interface FileNode {
  id: string;
  name: string;
  type: NodeType;
  size: number;
  fileType: string;
  createdAt: string;
  parentId: string | null;
  blocks: number[];
  status: FileStatus;
  children: FileNode[];
}

export interface FilesystemState {
  root: FileNode;
  totalBlocks: number;
  usedBlocks: number;
  freeBlocks: number;
  bitmap: number[];
  fragmentationScore: number;
}

export interface DiskBlocksState {
  totalBlocks: number;
  bitmap: number[];
  blockMap: Record<string, string>;
  usedBlocks: number;
  freeBlocks: number;
  fragmentationScore: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "journal" | "backup" | "crash" | "recovery" | "info";
  message: string;
  fileId: string | null;
  severity: "info" | "warn" | "error" | "success";
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  category: "filesystem" | "crash" | "recovery" | "optimization" | "access";
}

export interface PerformanceEntry {
  label: string;
  fragmentation: number;
  avgAccessTime: number;
  timestamp: string;
}

export interface PerformanceHistory {
  entries: PerformanceEntry[];
  currentFragmentation: number;
  currentAvgAccessTime: number;
}

export interface DashboardStats {
  totalFiles: number;
  totalDirectories: number;
  healthyFiles: number;
  corruptedFiles: number;
  deletedFiles: number;
  totalBlocks: number;
  usedBlocks: number;
  freeBlocks: number;
  fragmentationScore: number;
  diskUsagePercent: number;
  recoveryCount: number;
  crashCount: number;
  optimizationCount: number;
  avgAccessTimeMs: number;
}

const TOTAL_BLOCKS = 100;

class FilesystemManager {
  private root: FileNode;
  private bitmap: number[];
  private blockMap: Record<string, string>;
  private logs: LogEntry[];
  private activity: ActivityEntry[];
  private performanceHistory: PerformanceEntry[];
  private counters: {
    recovery: number;
    crash: number;
    optimization: number;
    accessTotal: number;
    accessCount: number;
  };

  constructor() {
    this.bitmap = new Array(TOTAL_BLOCKS).fill(0);
    this.blockMap = {};
    this.logs = [];
    this.activity = [];
    this.performanceHistory = [];
    this.counters = { recovery: 0, crash: 0, optimization: 0, accessTotal: 0, accessCount: 0 };
    this.root = this.buildInitialFilesystem();
    this.addPerformanceSnapshot("Initial");
  }

  private allocateBlocks(count: number): number[] {
    const allocated: number[] = [];
    for (let i = 0; i < TOTAL_BLOCKS && allocated.length < count; i++) {
      if (this.bitmap[i] === 0) {
        this.bitmap[i] = 1;
        allocated.push(i);
      }
    }
    return allocated;
  }

  private freeBlocks(blocks: number[]): void {
    for (const b of blocks) {
      this.bitmap[b] = 0;
      delete this.blockMap[b.toString()];
    }
  }

  private assignBlocksToFile(fileId: string, blocks: number[]): void {
    for (const b of blocks) {
      this.blockMap[b.toString()] = fileId;
    }
  }

  private createNode(
    name: string,
    type: NodeType,
    fileType: string,
    size: number,
    parentId: string | null
  ): FileNode {
    const id = uuidv4();
    const blocksNeeded = type === "file" ? Math.max(1, Math.ceil(size / 512)) : 0;
    const blocks = this.allocateBlocks(blocksNeeded);
    this.assignBlocksToFile(id, blocks);
    return {
      id,
      name,
      type,
      size,
      fileType,
      createdAt: new Date().toISOString(),
      parentId,
      blocks,
      status: "healthy",
      children: [],
    };
  }

  private buildInitialFilesystem(): FileNode {
    const root = this.createNode("/", "directory", "directory", 0, null);

    const docs = this.createNode("Documents", "directory", "directory", 0, root.id);
    const pics = this.createNode("Pictures", "directory", "directory", 0, root.id);
    const sys = this.createNode("System", "directory", "directory", 0, root.id);
    const tmp = this.createNode("Temp", "directory", "directory", 0, root.id);

    const resume = this.createNode("resume.docx", "file", "docx", 2048, docs.id);
    const notes = this.createNode("notes.txt", "file", "txt", 512, docs.id);
    const report = this.createNode("report.pdf", "file", "pdf", 4096, docs.id);

    const photo1 = this.createNode("vacation.jpg", "file", "jpg", 3072, pics.id);
    const photo2 = this.createNode("portrait.png", "file", "png", 2560, pics.id);

    const kernel = this.createNode("kernel.sys", "file", "sys", 8192, sys.id);
    const config = this.createNode("config.ini", "file", "ini", 256, sys.id);
    const drivers = this.createNode("drivers", "directory", "directory", 0, sys.id);
    const netdrv = this.createNode("network.drv", "file", "drv", 1024, drivers.id);
    drivers.children.push(netdrv);

    const tmpfile = this.createNode("cache.tmp", "file", "tmp", 1536, tmp.id);

    docs.children.push(resume, notes, report);
    pics.children.push(photo1, photo2);
    sys.children.push(kernel, config, drivers);
    tmp.children.push(tmpfile);
    root.children.push(docs, pics, sys, tmp);

    this.addActivity("filesystem", "INIT_FS", "File system initialized with default structure");
    this.addLog("info", "info", "File system initialized successfully", null);

    return root;
  }

  private addLog(
    type: LogEntry["type"],
    severity: LogEntry["severity"],
    message: string,
    fileId: string | null
  ): void {
    this.logs.unshift({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type,
      message,
      fileId,
      severity,
    });
    if (this.logs.length > 200) this.logs.pop();
  }

  private addActivity(
    category: ActivityEntry["category"],
    action: string,
    details: string
  ): void {
    this.activity.unshift({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      action,
      details,
      category,
    });
    if (this.activity.length > 500) this.activity.pop();
  }

  private addPerformanceSnapshot(label: string): void {
    this.performanceHistory.push({
      label,
      fragmentation: this.calculateFragmentation(),
      avgAccessTime: this.counters.accessCount > 0
        ? this.counters.accessTotal / this.counters.accessCount
        : 5.0,
      timestamp: new Date().toISOString(),
    });
  }

  private calculateFragmentation(): number {
    const allFiles = this.getAllFiles();
    if (allFiles.length === 0) return 0;
    let fragmentedCount = 0;
    for (const f of allFiles) {
      if (f.type === "file" && f.blocks.length > 1) {
        let fragmented = false;
        for (let i = 1; i < f.blocks.length; i++) {
          if (f.blocks[i] !== f.blocks[i - 1] + 1) {
            fragmented = true;
            break;
          }
        }
        if (fragmented) fragmentedCount++;
      }
    }
    return Math.round((fragmentedCount / Math.max(1, allFiles.length)) * 100);
  }

  private getAllNodes(node: FileNode = this.root): FileNode[] {
    const result: FileNode[] = [node];
    for (const child of node.children) {
      result.push(...this.getAllNodes(child));
    }
    return result;
  }

  private getAllFiles(): FileNode[] {
    return this.getAllNodes().filter((n) => n.type === "file");
  }

  private findNode(id: string, node: FileNode = this.root): FileNode | null {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = this.findNode(id, child);
      if (found) return found;
    }
    return null;
  }

  private findParent(id: string, node: FileNode = this.root): FileNode | null {
    for (const child of node.children) {
      if (child.id === id) return node;
      const found = this.findParent(id, child);
      if (found) return found;
    }
    return null;
  }

  private removeNode(id: string, node: FileNode = this.root): boolean {
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].id === id) {
        node.children.splice(i, 1);
        return true;
      }
      if (this.removeNode(id, node.children[i])) return true;
    }
    return false;
  }

  getFilesystemState(): FilesystemState {
    const usedBlocks = this.bitmap.filter((b) => b === 1).length;
    return {
      root: this.root,
      totalBlocks: TOTAL_BLOCKS,
      usedBlocks,
      freeBlocks: TOTAL_BLOCKS - usedBlocks,
      bitmap: [...this.bitmap],
      fragmentationScore: this.calculateFragmentation(),
    };
  }

  getDiskBlocksState(): DiskBlocksState {
    const usedBlocks = this.bitmap.filter((b) => b === 1).length;
    return {
      totalBlocks: TOTAL_BLOCKS,
      bitmap: [...this.bitmap],
      blockMap: { ...this.blockMap },
      usedBlocks,
      freeBlocks: TOTAL_BLOCKS - usedBlocks,
      fragmentationScore: this.calculateFragmentation(),
    };
  }

  createFile(
    name: string,
    type: NodeType,
    fileType: string,
    size: number,
    parentId: string | null
  ): FileNode {
    const parent = parentId ? this.findNode(parentId) : this.root;
    if (!parent) throw new Error("Parent directory not found");
    if (parent.type !== "directory") throw new Error("Parent is not a directory");

    const node = this.createNode(name, type, fileType || "txt", size || 512, parent.id);
    parent.children.push(node);

    this.addActivity("filesystem", "CREATE_FILE", `Created ${type} '${name}' (${size} bytes, ${node.blocks.length} blocks)`);
    this.addLog("journal", "info", `File '${name}' created at ${new Date().toISOString()}`, node.id);

    return node;
  }

  deleteFile(id: string): void {
    const node = this.findNode(id);
    if (!node) throw new Error("File not found");

    const collectNodes = (n: FileNode): FileNode[] => {
      const result: FileNode[] = [n];
      for (const c of n.children) result.push(...collectNodes(c));
      return result;
    };

    const toDelete = collectNodes(node);
    for (const n of toDelete) {
      this.freeBlocks(n.blocks);
    }

    this.removeNode(id);

    this.addActivity("filesystem", "DELETE_FILE", `Deleted ${node.type} '${node.name}'`);
    this.addLog("journal", "warn", `File '${node.name}' deleted`, id);
  }

  accessFile(fileId: string, method: "sequential" | "direct", operation: "read" | "write") {
    const file = this.findNode(fileId);
    if (!file || file.type !== "file") throw new Error("File not found");

    const blockCount = file.blocks.length;

    let seekTime: number;
    let transferTime: number;

    if (method === "sequential") {
      seekTime = 2.0 + blockCount * 0.5;
      transferTime = blockCount * 1.2;
    } else {
      seekTime = 1.0 + Math.random() * 2.0;
      transferTime = blockCount * 0.8;
    }

    const totalTime = seekTime + transferTime;
    this.counters.accessTotal += totalTime;
    this.counters.accessCount++;

    this.addActivity("access", `${operation.toUpperCase()}_FILE`, `${method} ${operation} on '${file.name}' — ${totalTime.toFixed(2)}ms`);

    return {
      fileId,
      method,
      operation,
      timeTakenMs: totalTime,
      blocksAccessed: [...file.blocks],
      seekTime,
      transferTime,
      totalTime,
    };
  }

  simulateCrash() {
    const allFiles = this.getAllFiles().filter((f) => f.status === "healthy");
    const numToAffect = Math.max(1, Math.floor(allFiles.length * (0.3 + Math.random() * 0.3)));
    const affected = allFiles.sort(() => Math.random() - 0.5).slice(0, numToAffect);

    const corruptedFiles: string[] = [];
    const deletedFiles: string[] = [];

    for (const file of affected) {
      if (Math.random() < 0.6) {
        file.status = "corrupted";
        corruptedFiles.push(file.id);
        if (Math.random() < 0.4) {
          const dropCount = Math.floor(file.blocks.length * 0.5);
          const dropped = file.blocks.splice(0, dropCount);
          this.freeBlocks(dropped);
        }
      } else {
        file.status = "deleted";
        deletedFiles.push(file.id);
      }
    }

    this.counters.crash++;
    this.addActivity("crash", "DISK_CRASH", `Disk crash: ${corruptedFiles.length} corrupted, ${deletedFiles.length} files marked deleted`);
    this.addLog("crash", "error", `CRITICAL: Disk crash occurred. ${corruptedFiles.length} files corrupted, ${deletedFiles.length} deleted`, null);
    this.addPerformanceSnapshot(`Crash #${this.counters.crash}`);

    return {
      affectedFiles: affected.length,
      corruptedFiles,
      deletedFiles,
      message: `Crash simulation complete. ${corruptedFiles.length} files corrupted, ${deletedFiles.length} files lost.`,
      filesystem: this.getFilesystemState(),
    };
  }

  corruptFile(fileId: string) {
    const file = this.findNode(fileId);
    if (!file) throw new Error("File not found");
    file.status = "corrupted";
    if (file.blocks.length > 1) {
      const dropCount = Math.floor(file.blocks.length * 0.4);
      const dropped = file.blocks.splice(0, dropCount);
      this.freeBlocks(dropped);
    }
    this.addActivity("crash", "CORRUPT_FILE", `File '${file.name}' manually corrupted`);
    this.addLog("crash", "error", `File '${file.name}' corruption detected`, fileId);
    return this.getFilesystemState();
  }

  recoverFiles(method: "journal" | "backup", targetIds?: string[]) {
    const candidates = targetIds
      ? targetIds.map((id) => this.findNode(id)).filter(Boolean) as FileNode[]
      : this.getAllFiles().filter((f) => f.status === "corrupted" || f.status === "deleted");

    const recovered: string[] = [];
    const failed: string[] = [];
    const partial: string[] = [];

    for (const file of candidates) {
      const roll = Math.random();
      const probability = method === "journal" ? 0.75 : 0.65;

      if (roll < probability) {
        file.status = "healthy";
        if (file.blocks.length === 0) {
          const needed = Math.max(1, Math.ceil(file.size / 512));
          const newBlocks = this.allocateBlocks(needed);
          file.blocks = newBlocks;
          this.assignBlocksToFile(file.id, newBlocks);
        }
        recovered.push(file.id);
        this.addLog("recovery", "success", `File '${file.name}' successfully recovered via ${method}`, file.id);
      } else if (roll < probability + 0.15) {
        file.status = "healthy";
        const partialBlocks = this.allocateBlocks(Math.max(1, Math.floor(file.blocks.length * 0.5)));
        this.assignBlocksToFile(file.id, partialBlocks);
        file.blocks = [...file.blocks, ...partialBlocks];
        partial.push(file.id);
        this.addLog("recovery", "warn", `File '${file.name}' partially recovered via ${method}`, file.id);
      } else {
        failed.push(file.id);
        this.addLog("recovery", "error", `File '${file.name}' could not be recovered`, file.id);
      }
    }

    const total = recovered.length + failed.length + partial.length;
    const probabilityScore = total > 0 ? Math.round(((recovered.length + partial.length * 0.5) / total) * 100) : 0;

    let status: "success" | "partial" | "failed" = "failed";
    if (recovered.length > 0 && failed.length === 0) status = "success";
    else if (recovered.length > 0 || partial.length > 0) status = "partial";

    this.counters.recovery++;
    this.addActivity("recovery", "RECOVER_FILES", `Recovery (${method}): ${recovered.length} recovered, ${partial.length} partial, ${failed.length} failed`);
    this.addLog("recovery", status === "success" ? "success" : status === "partial" ? "warn" : "error",
      `Recovery complete. Success rate: ${probabilityScore}%`, null);
    this.addPerformanceSnapshot(`Recovery #${this.counters.recovery}`);

    return {
      method,
      recovered,
      failed,
      partial,
      status,
      probabilityScore,
      message: `Recovery (${method}): ${recovered.length} restored, ${partial.length} partial, ${failed.length} failed.`,
      filesystem: this.getFilesystemState(),
    };
  }

  defragment() {
    const fragBefore = this.calculateFragmentation();
    const accessBefore = this.counters.accessCount > 0
      ? this.counters.accessTotal / this.counters.accessCount
      : 5.0;

    const allFiles = this.getAllFiles().filter((f) => f.status === "healthy");
    let blocksMoved = 0;
    let nextBlock = 0;

    this.bitmap.fill(0);
    this.blockMap = {};

    for (const file of allFiles) {
      const newBlocks: number[] = [];
      for (let i = 0; i < file.blocks.length; i++) {
        if (nextBlock < TOTAL_BLOCKS) {
          this.bitmap[nextBlock] = 1;
          this.blockMap[nextBlock.toString()] = file.id;
          if (file.blocks[i] !== nextBlock) blocksMoved++;
          newBlocks.push(nextBlock++);
        }
      }
      file.blocks = newBlocks;
    }

    const improvement = Math.max(5, Math.min(40, fragBefore * 0.8 + Math.random() * 10));
    this.counters.accessTotal = Math.max(0, this.counters.accessTotal * 0.7);

    const fragAfter = Math.max(0, fragBefore - improvement);
    const accessAfter = accessBefore * 0.75;
    const improvementPercent = fragBefore > 0
      ? Math.round(((fragBefore - fragAfter) / fragBefore) * 100)
      : 20;

    this.counters.optimization++;
    this.addActivity("optimization", "DEFRAGMENT", `Defragmentation complete: ${blocksMoved} blocks moved, ${improvementPercent}% improvement`);
    this.addLog("info", "success", `Defragmentation complete. Fragmentation reduced from ${fragBefore}% to ${Math.round(fragAfter)}%`, null);
    this.addPerformanceSnapshot(`Defrag #${this.counters.optimization}`);

    return {
      type: "defragment" as const,
      blocksMoved,
      fragmentationBefore: fragBefore,
      fragmentationAfter: Math.round(fragAfter),
      accessTimeBefore: accessBefore,
      accessTimeAfter: accessAfter,
      improvementPercent,
      message: `Defragmentation complete. Moved ${blocksMoved} blocks. Fragmentation reduced by ${improvementPercent}%.`,
      filesystem: this.getFilesystemState(),
    };
  }

  reallocate() {
    const fragBefore = this.calculateFragmentation();
    const accessBefore = this.counters.accessCount > 0
      ? this.counters.accessTotal / this.counters.accessCount
      : 5.0;

    const allFiles = this.getAllFiles().filter((f) => f.status === "healthy");
    let blocksMoved = 0;

    for (const file of allFiles) {
      if (file.blocks.length > 1) {
        this.freeBlocks(file.blocks);
        const newBlocks = this.allocateBlocks(file.blocks.length);
        file.blocks = newBlocks;
        this.assignBlocksToFile(file.id, newBlocks);
        blocksMoved += newBlocks.length;
      }
    }

    const improvement = Math.max(3, Math.min(25, fragBefore * 0.4 + Math.random() * 8));
    const fragAfter = Math.max(0, fragBefore - improvement);
    const accessAfter = accessBefore * 0.85;
    const improvementPercent = fragBefore > 0
      ? Math.round(((fragBefore - fragAfter) / fragBefore) * 100)
      : 15;

    this.counters.optimization++;
    this.addActivity("optimization", "REALLOCATE", `Block reallocation complete: ${blocksMoved} blocks reallocated, ${improvementPercent}% improvement`);
    this.addLog("info", "success", `Block reallocation complete. ${blocksMoved} blocks optimized.`, null);
    this.addPerformanceSnapshot(`Realloc #${this.counters.optimization}`);

    return {
      type: "reallocate" as const,
      blocksMoved,
      fragmentationBefore: fragBefore,
      fragmentationAfter: Math.round(fragAfter),
      accessTimeBefore: accessBefore,
      accessTimeAfter: accessAfter,
      improvementPercent,
      message: `Block reallocation complete. ${blocksMoved} blocks reallocated with ${improvementPercent}% efficiency gain.`,
      filesystem: this.getFilesystemState(),
    };
  }

  getDashboardStats(): DashboardStats {
    const allNodes = this.getAllNodes();
    const files = allNodes.filter((n) => n.type === "file");
    const dirs = allNodes.filter((n) => n.type === "directory");

    const usedBlocks = this.bitmap.filter((b) => b === 1).length;

    return {
      totalFiles: files.length,
      totalDirectories: dirs.length,
      healthyFiles: files.filter((f) => f.status === "healthy").length,
      corruptedFiles: files.filter((f) => f.status === "corrupted").length,
      deletedFiles: files.filter((f) => f.status === "deleted").length,
      totalBlocks: TOTAL_BLOCKS,
      usedBlocks,
      freeBlocks: TOTAL_BLOCKS - usedBlocks,
      fragmentationScore: this.calculateFragmentation(),
      diskUsagePercent: Math.round((usedBlocks / TOTAL_BLOCKS) * 100),
      recoveryCount: this.counters.recovery,
      crashCount: this.counters.crash,
      optimizationCount: this.counters.optimization,
      avgAccessTimeMs: this.counters.accessCount > 0
        ? Math.round((this.counters.accessTotal / this.counters.accessCount) * 100) / 100
        : 0,
    };
  }

  getRecoveryLogs(): LogEntry[] {
    return [...this.logs];
  }

  getActivityLog(): ActivityEntry[] {
    return [...this.activity];
  }

  getPerformanceHistory(): PerformanceHistory {
    return {
      entries: [...this.performanceHistory],
      currentFragmentation: this.calculateFragmentation(),
      currentAvgAccessTime: this.counters.accessCount > 0
        ? Math.round((this.counters.accessTotal / this.counters.accessCount) * 100) / 100
        : 0,
    };
  }

  reset(): FilesystemState {
    this.bitmap = new Array(TOTAL_BLOCKS).fill(0);
    this.blockMap = {};
    this.logs = [];
    this.activity = [];
    this.performanceHistory = [];
    this.counters = { recovery: 0, crash: 0, optimization: 0, accessTotal: 0, accessCount: 0 };
    this.root = this.buildInitialFilesystem();
    this.addPerformanceSnapshot("Reset");
    return this.getFilesystemState();
  }
}

let instance: FilesystemManager | null = null;

export function getFilesystem(): FilesystemManager {
  if (!instance) instance = new FilesystemManager();
  return instance;
}
