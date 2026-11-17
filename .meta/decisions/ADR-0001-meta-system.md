# ADR-0001: Establish a repository meta-system

- **Status:** Accepted
- **Date:** 2026-11-17
- **Decision owners:** Portfolio maintainer

## Context

The portfolio contains a public website, a substantial README, interactive browser behavior, project case studies, and a deployment workflow. As these evolve, architecture decisions and implementation history can become scattered across commits and informal notes.

The README also carries a lot of structured information. Without an explicit information architecture and evidence policy, it can drift away from the actual implementation.

## Decision

Create a quiet, repository-local documentation layer under `.meta/` containing:

- current-state architecture;
- documentation and README information architecture;
- architecture decision records (ADRs);
- an append-only development log;
- reusable templates and future maintenance guidance.

Keep this layer separate from the visitor-facing website. The root README remains public-facing and concise, while `.meta/` records the reasoning and maintenance rules behind it.

## Consequences

### Positive

- Architecture and implementation history have a stable home.
- Future contributors can understand why the system is structured as it is.
- README updates can be checked against a documented information architecture.
- Current implementation can be distinguished from roadmap ideas.
- Meaningful changes become easier to audit.

### Trade-offs

- Documentation must be maintained when meaningful changes occur.
- The meta-system can become stale if updates are skipped.
- More formal records add a small amount of maintenance overhead.

## Constraints

- No secrets or private data in documentation.
- No claim of automated synchronization: README maintenance is currently a deliberate review step.
- No runtime dependency on `.meta/`; it must not affect the website bundle or visitor experience.
- Logs are append-only; corrections should be added as follow-up notes rather than silently rewriting history.

## Revisit when

Reconsider this decision if the repository gains multiple contributors, automated documentation generation, a backend/service architecture, or a formal release process.
