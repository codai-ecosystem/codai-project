#!/usr/bin/env bash
if [ "$npm_execpath" != "" ] && [[ "$npm_execpath" != *"pnpm"* ]]; then
  echo "❌ This repository uses pnpm. Please use 'pnpm install' instead of 'npm install'." >&2
  echo "ℹ️ If you don't have pnpm installed, run: npm install -g pnpm" >&2
  exit 1
fi