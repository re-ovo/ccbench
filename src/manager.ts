import type { Provider } from "./config";
import { benchmarkProvider, type BenchmarkResult, type BenchmarkProgress } from "./benchmark";

export class BenchmarkManager {
  private providers: Provider[];
  private results: Map<string, BenchmarkResult> = new Map();
  private progress: Map<string, BenchmarkProgress> = new Map();
  private listeners: ((progress: BenchmarkProgress[]) => void)[] = [];

  constructor(providers: Provider[]) {
    this.providers = providers;

    providers.forEach(provider => {
      this.progress.set(provider.name, {
        provider: provider.name,
        status: "pending"
      });
    });
  }

  onProgressUpdate(callback: (progress: BenchmarkProgress[]) => void) {
    this.listeners.push(callback);
  }

  private notifyListeners() {
    const progressArray = Array.from(this.progress.values());
    this.listeners.forEach(callback => callback(progressArray));
  }

  async runBenchmarks(timeout: number = 30000): Promise<BenchmarkResult[]> {
    const promises = this.providers.map(async (provider) => {
      this.progress.set(provider.name, {
        provider: provider.name,
        status: "running"
      });
      this.notifyListeners();

      try {
        const result = await benchmarkProvider(provider, timeout);
        this.results.set(provider.name, result);

        this.progress.set(provider.name, {
          provider: provider.name,
          status: "completed",
          result
        });

        this.notifyListeners();
        return result;
      } catch (error) {
        const result: BenchmarkResult = {
          provider: provider.name,
          status: "error",
          error: error instanceof Error ? error.message : String(error)
        };

        this.results.set(provider.name, result);
        this.progress.set(provider.name, {
          provider: provider.name,
          status: "completed",
          result
        });

        this.notifyListeners();
        return result;
      }
    });

    return await Promise.all(promises);
  }

  getResults(): BenchmarkResult[] {
    return Array.from(this.results.values());
  }

  getProgress(): BenchmarkProgress[] {
    return Array.from(this.progress.values());
  }
}