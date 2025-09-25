#!/usr/bin/env node

import React, { useState, useEffect } from "react";
import { render } from "ink";
import { loadConfig } from "./config.js";
import { BenchmarkManager } from "./manager.js";
import { BenchmarkUI } from "./ui.js";
import type { BenchmarkProgress } from "./benchmark.js";

function App() {
  const [progress, setProgress] = useState<BenchmarkProgress[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    async function runBenchmarks() {
      try {
        const config = loadConfig();

        if (!config.providers || config.providers.length === 0) {
          console.error("No providers found in config.yml");
          process.exit(1);
        }

        const manager = new BenchmarkManager(config.providers);

        manager.onProgressUpdate((newProgress) => {
          setProgress([...newProgress]);
        });

        setProgress(manager.getProgress());

        await manager.runBenchmarks();

        setIsComplete(true);
      } catch (error) {
        console.error("Error running benchmarks:", error);
        process.exit(1);
      }
    }

    runBenchmarks();
  }, []);

  useEffect(() => {
    if (isComplete && progress.every(p => p.status === "completed")) {
      setTimeout(() => {
        process.exit(0);
      }, 2000);
    }
  }, [isComplete, progress]);

  return <BenchmarkUI progress={progress} />;
}

render(<App />);