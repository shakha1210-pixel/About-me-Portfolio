# Repository Meta-System

This directory is the quiet, repository-level control plane for the portfolio.

It records how the product is structured, why important decisions were made, how the public README is organized, and what changes over time. It is intentionally separate from the visitor-facing website.

## Documentation map

| Area | Purpose |
|---|---|
| [Architecture](architecture/system-overview.md) | Current system boundaries, runtime flow, and explicit non-goals |
| [Documentation architecture](architecture/documentation-architecture.md) | Source-of-truth rules and the relationship between this system and the root README |
| [ADR-0001](decisions/ADR-0001-meta-system.md) | Why the meta-system exists and how it is governed |
| [Development log](logs/DEVELOPMENT_LOG.md) | Append-only record of meaningful implementation and verification events |
| [ADR template](templates/ADR-TEMPLATE.md) | Consistent format for future architectural decisions |

## Operating rules

1. Describe the implemented state separately from planned work.
2. Update architecture documentation when a meaningful system boundary or data flow changes.
3. Append to the development log; do not rewrite history to make it look cleaner.
4. Record decisions that constrain future implementation as ADRs.
5. Treat the root README as a public projection of verified project facts, not as an independent source of truth.
6. Never store credentials, tokens, personal secrets, or private user data in this directory.
7. Record validation honestly: distinguish source inspection, automated checks, and real browser testing.

## Status

The meta-system is documentation infrastructure. It does not run in the browser, add a backend, or alter the public portfolio experience.
