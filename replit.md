# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the File System Recovery & Optimization Simulator — an interactive educational web application demonstrating OS-level file system management concepts.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (artifacts/fs-simulator)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: None (in-memory simulation)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Project: File System Recovery & Optimization Simulator

An educational simulation tool demonstrating how operating systems manage file storage, perform crash recovery, and optimize disk performance.

### Features
- Virtual file system with directory tree (Root > Documents, Pictures, System, Temp)
- 100-block disk with bitmap free-space management
- Sequential and direct file access simulation with timing metrics
- Disk crash simulation (random corruption/deletion)
- Recovery via journaling or backup metadata
- Defragmentation and block reallocation optimization
- Performance history charts with before/after comparisons
- OS-style activity log and recovery journal
- Simulation report download (JSON)
- Dark mode terminal aesthetic

### Pages
- `/` Dashboard — system stats, disk health, performance overview
- `/filesystem` — file tree + disk block grid visualization
- `/access` — file access simulation with timing metrics
- `/crash` — crash simulation & file corruption controls
- `/recovery` — recovery panel with journal/backup methods
- `/optimization` — defragmentation & reallocation with charts
- `/logs` — OS activity log viewer

### API Endpoints (all under /api)
- GET /filesystem — full filesystem state
- POST /filesystem/reset — reset to initial state
- POST /filesystem/files — create file/directory
- DELETE /filesystem/files/:id — delete file
- POST /filesystem/access — simulate file access
- GET /filesystem/blocks — disk block allocation state
- POST /crash/simulate — simulate disk crash
- POST /crash/corrupt — corrupt a specific file
- POST /recovery/recover — recover files (journal or backup)
- GET /recovery/logs — recovery journal logs
- POST /optimization/defragment — defragment disk
- POST /optimization/reallocate — reallocate blocks
- GET /stats/dashboard — dashboard statistics
- GET /stats/activity — OS activity log
- GET /stats/performance — performance history
- GET /stats/report — full simulation report (JSON)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/fs-simulator run dev` — run frontend locally

## Important Notes
- `lib/api-zod/src/index.ts` only exports from `./generated/api` (not types/) to avoid duplicate exports from orval codegen
- `lib/api-spec/orval.config.ts` does NOT use the `schemas` path option to prevent double-barrel conflicts
- All file system state is in-memory (no database), managed by the singleton FilesystemManager in `artifacts/api-server/src/lib/filesystem.ts`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
