# Contributing to PlanCraft

Thank you for your interest in contributing to PlanCraft! We enforce high standards of code quality, security, and accessibility.

## 1. Development Workflow

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env.local
   ```
4. Verify the toolchain locally:
   ```bash
   npm run verify
   ```

## 2. Commit Message Standards

This project enforces Conventional Commits via `@commitlint/cli` and `husky`:

- `feat: add budget allocation engine`
- `fix: correct ICS newline folding boundary`
- `docs: update threat model in SECURITY.md`
- `test: add property test for leap-year timelines`

## 3. Invariants & Absolute Rules

Before opening a pull request, ensure:

1. **Zero Fake Data**: No mock vendors, fake names, or hardcoded budget percentages in production code.
2. **Strict TypeScript**: No `any`, no non-null assertions (`!`), and no `@ts-ignore`.
3. **Coverage Standards**: $\ge 90\%$ lines/statements, $\ge 85\%$ branches overall; 100% on domain logic.
4. **All Verification Checks Pass**: `npm run verify` runs all linters, tests, and security scans.
