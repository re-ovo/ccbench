import React from "react";
import { Box, Text } from "ink";
import {Table} from "@tqman/ink-table";
import type { BenchmarkProgress, BenchmarkResult } from "./benchmark";

interface BenchmarkUIProps {
  progress: BenchmarkProgress[];
}

const statusColors = {
  pending: "yellow",
  running: "blue",
  completed: "green"
} as const;

const resultColors = {
  success: "green",
  error: "red",
  timeout: "yellow"
} as const;

function formatNumber(num: number | undefined, unit: string): string {
  if (num === undefined) return "N/A";
  return `${num.toFixed(2)}${unit}`;
}

function getTtftColor(ttft: number | undefined): string {
  if (ttft === undefined) return "white";
  if (ttft > 8000) return "red";
  if (ttft > 4000) return "yellow";
  return "green";
}

function formatDuration(duration: number | undefined): string {
  if (duration === undefined) return "N/A";
  return `${(duration / 1000).toFixed(2)}s`;
}

export function BenchmarkUI({ progress }: BenchmarkUIProps) {
  const tableData = progress.map(item => ({
    Provider: item.provider,
    Status: item.status,
    TTFT: item.result ? formatNumber(item.result.ttft, "ms") : "─",
    TPS: item.result ? formatNumber(item.result.tps, " t/s") : "─",
    Tokens: item.result ? (item.result.totalTokens || 0).toString() : "─",
    Duration: item.result ? formatDuration(item.result.duration) : "─"
  }));

  const cellRenderer = (props: React.PropsWithChildren<{}>) => {
    const cellValue = props.children as string;

    // Check if this is a TTFT cell by matching the format
    if (typeof cellValue === 'string' && cellValue.trimEnd().endsWith('ms') && cellValue !== "─") {
      const ttftValue = parseFloat(cellValue.trimEnd().replace('ms', ''));
      const color = getTtftColor(ttftValue);
      return <Text color={color}>{cellValue}</Text>;
    }

    return <Text>{cellValue}</Text>;
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">Claude API Provider Benchmark</Text>
      </Box>

      <Table
        data={tableData}
        columns={["Provider", "Status", "TTFT", "TPS", "Tokens", "Duration"]}
        cell={cellRenderer}
      />

      {progress.some(p => p.result?.error) && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold color="red">Errors:</Text>
          {progress
            .filter(p => p.result?.error)
            .map(p => (
              <Box key={p.provider}>
                <Text color="red">{p.provider}: {p.result?.error}</Text>
              </Box>
            ))}
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="cyan">
          Running: {progress.filter(p => p.status === "running").length} |
          Completed: {progress.filter(p => p.status === "completed").length} |
          Total: {progress.length}
        </Text>
      </Box>
    </Box>
  );
}