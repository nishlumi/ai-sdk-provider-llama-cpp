# Changelog

All notable changes to this project will be documented in this file.

## ver 0.0.3

- Introduced a mechanism to intercept the `timings` property returned from llama-server and convert it to an AI SDK-compatible `usage`.
- Fix: Modified `createLlamaCppFetch` to send a separate response chunk (`choices: []`) for `usage` to fully comply with the Vercel AI SDK stream specification, and hardened support for `\r` line endings.

## ver 0.0.2

- Updated various dependency packages.

## ver 0.0.1

- First commit. Foundational functionality and project initialization as an AI SDK provider.