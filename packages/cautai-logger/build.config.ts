import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  externals: ['winston', 'winston-daily-rotate-file', 'zod'],
  rollup: {
    emitCJS: false,
  },
})