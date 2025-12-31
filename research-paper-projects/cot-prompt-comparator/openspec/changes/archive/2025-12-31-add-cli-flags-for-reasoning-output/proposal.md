---
change-id: add-cli-flags-for-reasoning-output
title: Add CLI Flags for Controlling Reasoning Output
date: 2025-12-31
---

## Proposal

Currently, the `cot-prompt-comparator` CLI executes all five defined prompt types (Standard, Chain-of-Thought, Concise Chain-of-Thought, Verbose Chain-of-Thought, and Reasoning After Answer) for every task by default. This can lead to longer execution times and unnecessary API calls if a user is only interested in evaluating a subset of these reasoning styles.

This proposal aims to enhance the CLI by introducing command-line flags that allow users to explicitly select which reasoning prompt types to include in the evaluation. This will provide greater flexibility, reduce execution time for focused analyses, and potentially lower API costs.

The implementation will leverage the already installed `commander.js` library to define and parse these flags. When no specific flags are provided, the CLI will default to running all prompt types, maintaining the current behavior.
