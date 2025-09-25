# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ccbench is a Claude Code benchmarking tool that tests performance across different Claude API providers. It measures Time to First Token (TTFT), tokens per second (TPS), and overall response quality.

## Architecture

- **src/index.tsx**: Main entry point with React/Ink UI rendering
- **src/manager.ts**: BenchmarkManager orchestrates parallel provider testing
- **src/benchmark.ts**: Core benchmarking logic using Anthropic SDK
- **src/config.ts**: Configuration loading from config.yml
- **src/utils.ts**: Message presets and HTTP header utilities
- **src/ui.tsx**: Terminal UI components for progress display

The app runs concurrent benchmarks against multiple providers, collecting performance metrics and displaying real-time progress in a terminal UI.

## Development Commands

### Running the Application
```bash
bun run start    # Run the benchmark tool
bun run dev      # Development mode (same as start)
```

### Package Management
```bash
bun install     # Install dependencies
```

## Configuration

The tool requires a `config.yml` file in the project root with provider configurations:

```yaml
providers:
  - name: provider_name
    authToken: your_token
    baseURL: https://api.endpoint.com
```

## Key Dependencies

- **Bun**: Runtime and package manager
- **React + Ink**: Terminal UI rendering
- **Anthropic SDK**: API client for Claude
- **TypeScript**: Static typing with strict configuration

## Development Notes

- Uses Bun as the runtime instead of Node.js
- All source files are TypeScript with .tsx/.ts extensions
- Benchmarking simulates Claude Code CLI requests with specific headers and system prompts
- No test framework is currently configured
- TypeScript configuration uses strict mode with latest ESNext features