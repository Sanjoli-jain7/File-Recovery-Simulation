# Project Report: File System Recovery & Optimization Simulator

**Course Context**: Operating Systems / System Software  
**Type**: Educational Interactive Web Application  
**Date**: April 2026

---

## 1. Introduction

### 1.1 Project Overview

The File System Recovery & Optimization Simulator is a full-stack interactive web application designed to make abstract operating system concepts tangible. Users interact with a virtual file system running on a live backend, triggering real events — crashes, corruptions, recoveries, and optimizations — and observing their effects on disk state and performance metrics in real time.

The application bridges the gap between theoretical OS knowledge and practical understanding by providing a visual, hands-on environment that mirrors how real file systems behave during failure and recovery scenarios.

### 1.2 Motivation

Most OS textbooks describe file system concepts such as journaling, block allocation, fragmentation, and crash recovery in abstract terms. Students often struggle to visualize:
- How blocks are distributed across a disk
- What happens to a file system during a crash
- Why journaling improves recovery success rates
- How defragmentation physically rearranges blocks

This simulator provides immediate visual feedback for all of these concepts, making it suitable for classroom demonstrations, self-study, and laboratory exercises.

### 1.3 Objectives

- Simulate a virtual hierarchical file system with realistic block allocation
- Demonstrate crash events and their effect on file integrity
- Implement two recovery strategies (journal and backup) with probabilistic success modeling
- Visualize disk block layout and fragmentation in real time
- Track and chart performance metrics across operations
- Present everything through an intuitive, terminal-themed UI accessible to students

---

## 2. System Architecture

### 2.1 High-Level Architecture

The application follows a client-server architecture:

```
Browser (React SPA)
        |
        | HTTP / REST API (proxied via Vite in dev)
        |
Express API Server (Node.js)
        |
FilesystemManager (in-memory singleton)
```

The frontend communicates exclusively through REST API calls. All filesystem state lives in the backend's `FilesystemManager` singleton, which persists for the lifetime of the server process. This design cleanly separates simulation logic from presentation and allows the frontend to be deployed independently.

### 2.2 Backend Architecture

**Runtime**: Node.js (ESM modules)  
**Framework**: Express.js  
**Build tool**: esbuild (bundles TypeScript to a single `dist/index.mjs`)  
**Port**: 8080 (configurable via `PORT` environment variable)

The backend is organized into:

| Layer | Responsibility |
|---|---|
| `src/index.ts` | Server bootstrap, port binding, graceful startup |
| `src/app.ts` | Express instance, CORS, JSON middleware, route mounting |
| `src/routes/` | Six route modules (health, filesystem, crash, recovery, optimization, stats) |
| `src/lib/filesystem.ts` | `FilesystemManager` singleton — all simulation logic |

### 2.3 Frontend Architecture

**Framework**: React 19 with TypeScript  
**Build tool**: Vite 7  
**Styling**: TailwindCSS 4 (dark mode forced on `<html>`)  
**State management**: TanStack Query (server state caching and refetching)  
**Routing**: Wouter (lightweight SPA router)  
**Charts**: Recharts (line charts for performance history)  
**Animations**: Framer Motion  
**Components**: Radix UI primitives with custom styling

The application renders seven primary pages accessed via a persistent sidebar navigation. Each page communicates with dedicated API endpoints and refreshes on every relevant user action.

### 2.4 Monorepo Structure

The project uses a pnpm workspace monorepo:

```
artifacts/api-server     — Backend Express API
artifacts/fs-simulator   — Frontend React app
lib/api-spec             — OpenAPI 3.0 specification (source of truth)
```

This structure keeps the two artifacts independently deployable while sharing the API contract definition.

---

## 3. Core Modules and Implementation

### 3.1 FilesystemManager

The `FilesystemManager` class is the heart of the simulation. It is a singleton that owns all mutable state:

| State | Type | Description |
|---|---|---|
| `root` | `FileNode` | Root of the virtual directory tree |
| `bitmap` | `number[]` | 100-element array (0=free, 1=used) representing disk blocks |
| `blockMap` | `Record<string, string>` | Maps block index → file ID |
| `logs` | `LogEntry[]` | System journal (max 200 entries, LIFO) |
| `activity` | `ActivityEntry[]` | Human-readable activity log (max 500 entries) |
| `performanceHistory` | `PerformanceEntry[]` | Snapshots of fragmentation + access time |
| `counters` | object | Running totals for crashes, recoveries, optimizations, access times |

### 3.2 Virtual File System

Files and directories are represented as `FileNode` objects in a recursive tree structure. Each node carries:

- Unique UUID identifier
- Name, type (file/directory), file extension
- Size in bytes
- Block indices allocated on the virtual disk
- Status: healthy | corrupted | deleted | recovering
- Creation timestamp
- Parent ID reference
- Children array (for directories)

The initial filesystem pre-populates four directories (`Documents`, `Pictures`, `System`, `Temp`) with 10 files covering common types: `.docx`, `.txt`, `.pdf`, `.jpg`, `.png`, `.sys`, `.ini`, `.drv`, `.tmp`.

### 3.3 Block Allocation Model

**Disk capacity**: 100 blocks  
**Block size**: 512 bytes (logical)  
**Allocation strategy**: First-fit sequential scan

When a file is created, the system calculates `blocksNeeded = ceil(size / 512)`, minimum 1. It scans the bitmap from index 0 upward and allocates the first `N` free blocks found. These are not guaranteed to be contiguous, which naturally produces fragmentation as files are created and deleted.

```
File: resume.docx (2048 bytes) → 4 blocks needed
Bitmap scan: [0,1,2,3] free → allocate blocks 0,1,2,3
```

When a file is deleted, its blocks are freed in the bitmap and removed from `blockMap`.

### 3.4 Fragmentation Calculation

Fragmentation is measured as a percentage of files whose disk blocks are non-contiguous:

```
fragmentedCount = 0
for each file:
    for each adjacent block pair [i], [i+1]:
        if blocks[i+1] != blocks[i] + 1:
            fragmentedCount++
            break

fragmentationScore = (fragmentedCount / totalFiles) * 100
```

A score of 0% means all files occupy perfectly contiguous blocks. A score of 100% means every multi-block file has at least one non-contiguous gap.

### 3.5 Crash Simulation

The crash simulator models realistic disk failure behavior:

1. Selects 30–60% of healthy files randomly
2. For each selected file:
   - 60% probability: status → `corrupted`, optionally drops 50% of block references
   - 40% probability: status → `deleted`
3. Logs the event as severity `error` in the system journal
4. Captures a performance snapshot labeled `Crash #N`

This models the two most common outcomes of disk failure: partial data corruption (damaged sectors with partial block loss) and complete inode table corruption (file appears deleted).

### 3.6 Recovery Mechanisms

Two recovery strategies are implemented, reflecting real OS recovery approaches:

#### Journal-based Recovery
Simulates recovery using a write-ahead log. Since recent operations were journaled, the system can replay committed transactions.
- Full recovery probability: **75%**
- Partial recovery probability: **15%**
- Failure probability: **10%**

#### Backup-based Recovery
Simulates recovery from a periodic backup snapshot. Data may be older and incomplete.
- Full recovery probability: **65%**
- Partial recovery probability: **15%**
- Failure probability: **20%**

For partial recoveries, the system allocates additional blocks and merges them with any remaining original blocks, representing a file that is restored but may be incomplete.

Recovery can target all damaged files or a specific file by ID. After recovery, a performance snapshot is captured and a success rate percentage is calculated.

### 3.7 Defragmentation

The defragmentation algorithm performs a full compaction:

1. Clears the entire bitmap and block map
2. Iterates all healthy files in tree order
3. Re-assigns each file's blocks to the next sequential available positions starting from block 0
4. Tracks `blocksMoved` as the count of blocks that changed position

After defragmentation, all healthy files occupy perfectly contiguous blocks. The fragmentation score drops close to 0%. Average access time is reduced by approximately 25% (modeled as `accessTotal * 0.7`).

### 3.8 Block Reallocation

Reallocation is a lighter optimization:

1. For each multi-block healthy file: free its current blocks, allocate new blocks via first-fit
2. Blocks are not globally sorted — some fragmentation may remain
3. Performance improvement is smaller (access time reduced ~15%)

Reallocation is useful when a full defragmentation is too disruptive (analogous to online defragmentation in modern file systems).

### 3.9 File Access Simulation

The access simulator models disk seek and transfer times:

| Parameter | Sequential | Direct (Random) |
|---|---|---|
| Seek time | `2.0 + blockCount × 0.5` ms | `1.0 + random(0–2.0)` ms |
| Transfer time | `blockCount × 1.2` ms | `blockCount × 0.8` ms |

Sequential access has higher seek time (the head must traverse all blocks in order) but is modeled as predictable. Direct access has variable seek time but faster transfer (OS can optimize random I/O in some scenarios). Both contribute to the running average access time shown in performance charts.

---

## 4. API Design

The API follows REST conventions and is fully documented in an OpenAPI 3.0 specification (`lib/api-spec/openapi.yaml`). All endpoints return JSON.

### Endpoint Summary

| Domain | Endpoints | Count |
|---|---|---|
| Health | `/api/health` | 1 |
| Filesystem | `/api/filesystem`, `/api/filesystem/blocks`, `/api/filesystem/files`, `/api/filesystem/access`, `/api/filesystem/reset` | 5 |
| Crash | `/api/crash/simulate`, `/api/crash/corrupt/:id` | 2 |
| Recovery | `/api/recovery/recover`, `/api/recovery/recover/:id` | 2 |
| Optimization | `/api/optimization/defragment`, `/api/optimization/reallocate` | 2 |
| Stats | `/api/stats/dashboard`, `/api/stats/logs`, `/api/stats/activity`, `/api/stats/performance` | 4 |
| **Total** | | **16** |

### Response Conventions

- All responses include a top-level `filesystem` snapshot where state changes occur
- Error responses return `{ error: string }` with appropriate HTTP status codes
- POST endpoints return the result of the operation plus updated state

---

## 5. Frontend Design

### 5.1 Visual Design Language

The application uses a dark terminal aesthetic throughout:
- Background: near-black (`#0a0a0a`, `#111`)
- Primary accent: teal / cyan (`#00b4d8`, `#00f5ff`)
- Secondary: slate grays for borders and muted text
- Monospace-style data display for block bitmaps, log entries, and metrics
- Framer Motion transitions between page navigations

### 5.2 Page Descriptions

**Dashboard**: Stat cards showing file counts by status, disk usage progress bar, fragmentation score, and counters for all simulation events. Updates after any action.

**File System**: Split layout — left panel shows the interactive file tree (expandable directories, file type icons, status badges), right panel shows the 100-block disk grid (color-coded by state) and a legend. Create file/directory form panel.

**Access Simulation**: File selector, operation type (read/write), access method (sequential/direct). Results show seek time, transfer time, total time, and which blocks were accessed.

**Crash Simulation**: Large crash trigger button with warning styling. Shows a live count of corrupted and deleted files after each crash. Individual file corruption also available.

**Recovery**: Method selector (journal/backup), recover-all or recover-by-ID. Results panel shows per-file recovery outcome and overall success rate percentage.

**Optimization**: Defragment and Reallocate action buttons. Results panel shows before/after fragmentation scores and access time. Line chart displays full performance history across all snapshots.

**Logs**: Tabbed log viewer with type and severity filters. Logs are sorted newest-first. Each entry shows ISO timestamp, severity badge, type badge, message, and file ID if applicable.

### 5.3 State Management

TanStack Query manages all server state:
- Each page has dedicated query hooks that fetch from the relevant endpoints
- Mutations (POST/DELETE) invalidate related queries automatically, causing UI to refresh
- No local state duplication of server data — the backend is the single source of truth

---

## 6. OS Concepts Demonstrated

| Concept | Where Demonstrated |
|---|---|
| Inode / file metadata | `FileNode` structure (id, size, blocks, status, timestamps) |
| Block allocation bitmap | 100-element bitmap array, visual disk grid |
| First-fit allocation | `allocateBlocks()` sequential bitmap scan |
| External fragmentation | Block gaps created by interleaved create/delete operations |
| Fragmentation metric | Percentage of files with non-contiguous block sequences |
| Disk failure / crash | `simulateCrash()` random corruption and deletion model |
| Write-ahead journaling | `recoverFiles("journal")` with higher success probability |
| Backup-based recovery | `recoverFiles("backup")` with lower success probability |
| Defragmentation | `defragment()` full compaction algorithm |
| Online reallocation | `reallocate()` per-file block re-assignment |
| Sequential vs random I/O | `accessFile()` seek and transfer time models |
| System journal / audit log | `LogEntry[]` array with type/severity classification |
| Performance monitoring | `PerformanceHistory` snapshots over time |

---

## 7. Limitations and Future Work

### Current Limitations

- **In-memory only**: All state is lost when the server restarts. There is no persistent database.
- **Single user**: The singleton model does not support concurrent sessions with isolated state.
- **Simplified timing model**: Access time calculations are approximate simulations, not hardware-accurate.
- **No inode table visualization**: The inode concept is implicit in `FileNode` but not separately visualized.
- **No journaling replay visualization**: The journal recovery success is probabilistic; the actual journal replay process is not animated.

### Potential Enhancements

- Persist filesystem state to a database (PostgreSQL) to survive server restarts
- Add multi-session support with isolated per-user filesystem instances
- Animate the defragmentation process block-by-block in real time
- Visualize the journal as a scrolling write-ahead log showing individual operations
- Add more allocation strategies (best-fit, worst-fit) and let users compare them
- Add a "corruption map" showing exactly which bytes/blocks are damaged within a file
- Export simulation runs as reports or replays

---

## 8. Development Challenges

### Cross-Platform Compatibility (Windows)
The project was developed on Replit's Linux environment. The `pnpm-workspace.yaml` contained platform overrides (`"-"`) that excluded all Windows-specific native binaries for packages like rollup, lightningcss, esbuild, and `@tailwindcss/oxide`. These are necessary on Linux to avoid downloading unnecessary platform-specific packages, but they prevented the project from installing on Windows. Resolution required identifying and removing all `win32` override entries from the workspace configuration.

### Environment Variable Handling
The original backend dev script used Unix `export VAR=value` syntax, which is not supported on Windows PowerShell. This was resolved by adding `cross-env` as a dev dependency and rewriting all environment variable assignments in npm scripts to use `cross-env VAR=value`.

### Vite Configuration Portability
The Vite configuration initially required `PORT` and `BASE_PATH` environment variables to be set explicitly, throwing an error on cold start without them. This was fixed by adding fallback defaults (`|| 5173`, `|| "/"`) so the dev server starts without any prior configuration.

---

## 9. Conclusion

The File System Recovery & Optimization Simulator successfully demonstrates a broad range of operating system file system concepts in an interactive, visual format. The simulation engine faithfully models block allocation, fragmentation, crash failure, probabilistic recovery, and defragmentation using algorithms directly inspired by real OS implementations. The application is fully functional as a local development environment and is structured for straightforward cloud deployment.

The project demonstrates the value of separating simulation logic (backend singleton) from presentation (React frontend), allowing the educational simulation to be extended, tested, and reasoned about independently of the UI layer.

---

*Built with React, Vite, Express, TypeScript, and pnpm workspaces.*
