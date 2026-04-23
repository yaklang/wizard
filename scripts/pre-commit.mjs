import { spawnSync } from 'node:child_process'

const lintableExtensions = new Set(['.js', '.jsx', '.ts', '.tsx'])

const run = (command, args, options = {}) =>
  spawnSync(command, args, {
    stdio: 'inherit',
    encoding: 'utf8',
    ...options,
  })

const getStagedFiles = () => {
  const result = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
    encoding: 'utf8',
  })

  if (result.status !== 0) {
    process.stderr.write(result.stderr || 'failed to read staged files\n')
    process.exit(result.status ?? 1)
  }

  return result.stdout
    .split('\n')
    .map((file) => file.trim())
    .filter(Boolean)
}

const stagedFiles = getStagedFiles()
const lintableFiles = stagedFiles.filter((file) => {
  const dotIndex = file.lastIndexOf('.')
  if (dotIndex === -1) return false
  return lintableExtensions.has(file.slice(dotIndex))
})

if (lintableFiles.length === 0) {
  process.exit(0)
}

const eslintResult = run('pnpm', ['exec', 'eslint', '--fix', ...lintableFiles])

const addResult = run('git', ['add', '--', ...lintableFiles])
if (addResult.status !== 0) {
  process.exit(addResult.status ?? 1)
}

if (eslintResult.status !== 0) {
  console.warn('\npre-commit: eslint reported issues, but commit is not blocked. Run `pnpm lint` manually when needed.')
}

process.exit(0)
