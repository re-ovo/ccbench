import Anthropic from "@anthropic-ai/sdk";
import type { Provider } from "./config";
import { presetMessage, setHeader } from "./utils";

export interface BenchmarkResult {
  provider: string;
  status: "success" | "error" | "timeout";
  ttft?: number;
  tps?: number;
  totalTokens?: number;
  duration?: number;
  chunks?: number;
  error?: string;
}

export interface BenchmarkProgress {
  provider: string;
  status: "pending" | "running" | "completed";
  result?: BenchmarkResult;
}

export async function benchmarkProvider(
  provider: Provider,
  timeout: number = 30000,
): Promise<BenchmarkResult> {
  const result: BenchmarkResult = {
    provider: provider.name,
    status: "error",
  };

  try {
    const client = new Anthropic({
      authToken: provider.authToken,
      baseURL: provider.baseURL,
      timeout,
      fetch: (input, init) => {
        setHeader(
          init?.headers,
          "User-Agent",
          "claude-cli/1.0.117 (external, cli)",
        );
        setHeader(init?.headers, "x-app", "cli");
        return fetch(input, init);
      },
    });

    const startTime = performance.now();
    let firstTokenTime: number | undefined;
    let tokenCount = 0;
    let chunks = 0;

    const message = await client.beta.messages.create(presetMessage());

    for await (const chunk of message) {
      if (chunk.type === "content_block_delta") {
        chunks++;
        if (!firstTokenTime) {
          firstTokenTime = performance.now();
        }
      }

      if (chunk.type === "message_delta" && chunk.usage) {
        tokenCount = chunk.usage.output_tokens;
      }
    }

    const endTime = performance.now();
    const totalDuration = endTime - startTime;

    if (firstTokenTime) {
      result.ttft = firstTokenTime - startTime;
      result.tps =
        tokenCount > 0 ? tokenCount / ((endTime - firstTokenTime) / 1000) : 0;
    }

    result.status = "success";
    result.totalTokens = tokenCount;
    result.duration = totalDuration;
    result.chunks = chunks;
  } catch (error) {
    result.status = "error";
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}
