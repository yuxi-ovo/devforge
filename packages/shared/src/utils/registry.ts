/**
 * Registry Pattern — 插件/策略注册表基类
 *
 * 用于注册可扩展的策略、规则、适配器。
 * 模块可以通过 registry.register() 添加实现，
 * 通过 registry.getAll() / registry.get() 查找。
 */
export class Registry<T> {
  private items = new Map<string, T>()

  register(name: string, item: T): void {
    if (this.items.has(name)) {
      throw new Error(`Registry: duplicate key "${name}"`)
    }
    this.items.set(name, item)
  }

  get(name: string): T | undefined {
    return this.items.get(name)
  }

  getAll(): Map<string, T> {
    return new Map(this.items)
  }

  has(name: string): boolean {
    return this.items.has(name)
  }

  get size(): number {
    return this.items.size
  }

  clear(): void {
    this.items.clear()
  }
}

/**
 * Strategy Registry — 按 priority 排序的策略集合
 */
export class StrategyRegistry<T extends { priority?: number }> {
  private items: { name: string; strategy: T }[] = []

  register(name: string, strategy: T): void {
    this.items.push({ name, strategy })
    this.items.sort((a, b) => (b.strategy.priority ?? 0) - (a.strategy.priority ?? 0))
  }

  getAll(): { name: string; strategy: T }[] {
    return [...this.items]
  }

  get(name: string): T | undefined {
    return this.items.find((i) => i.name === name)?.strategy
  }
}
