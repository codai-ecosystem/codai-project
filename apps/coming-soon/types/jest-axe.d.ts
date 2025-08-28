declare module 'jest-axe' {
  import { AxeResults, RunOptions, Result, NodeResult } from 'axe-core'

  interface JestAxeConfigureOptions {
    globalOptions?: RunOptions
    impactLevels?: string[]
  }

  export function axe(
    container: Element | Document,
    options?: RunOptions
  ): Promise<AxeResults>

  export function toHaveNoViolations(results: AxeResults): {
    message(): string
    pass: boolean
  }

  export function configureAxe(options?: JestAxeConfigureOptions): void
}