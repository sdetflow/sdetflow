import type { UsageLedger } from './types.js';

export class MemoryUsageLedger implements UsageLedger {
  private readonly spend = new Map<string, number>();
  public async getSpendUsd(dayKey: string): Promise<number> { return this.spend.get(dayKey) ?? 0; }
  public async addSpendUsd(dayKey: string, amount: number): Promise<void> {
    if (!Number.isFinite(amount) || amount < 0) throw new Error('usage amount must be >= 0');
    this.spend.set(dayKey, (this.spend.get(dayKey) ?? 0) + amount);
  }
}
