import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'

export interface GitCommit {
    hash: string
    author: string
    email: string
    date: Date
    message: string
    files: string[]
    additions: number
    deletions: number
}

export interface GitBranch {
    name: string
    current: boolean
    remote?: string
    ahead?: number
    behind?: number
    lastCommit?: GitCommit
}

export interface GitStatus {
    branch: string
    staged: string[]
    unstaged: string[]
    untracked: string[]
    conflicted: string[]
    ahead: number
    behind: number
    clean: boolean
}

export interface GitDiff {
    file: string
    oldFile?: string
    newFile?: string
    type: 'added' | 'deleted' | 'modified' | 'renamed'
    additions: number
    deletions: number
    chunks: GitDiffChunk[]
}

export interface GitDiffChunk {
    oldStart: number
    oldLines: number
    newStart: number
    newLines: number
    lines: GitDiffLine[]
}

export interface GitDiffLine {
    type: 'context' | 'added' | 'deleted'
    content: string
    oldLineNumber?: number
    newLineNumber?: number
}

export interface GitRemote {
    name: string
    url: string
    type: 'fetch' | 'push'
}

export class GitManager {
    private projectPath: string

    constructor(projectPath: string) {
        this.projectPath = projectPath
    }

    async executeGitCommand(args: string[]): Promise<string> {
        return new Promise((resolve, reject) => {
            const git = spawn('git', args, {
                cwd: this.projectPath,
                stdio: ['pipe', 'pipe', 'pipe']
            })

            let stdout = ''
            let stderr = ''

            git.stdout.on('data', (data) => {
                stdout += data.toString()
            })

            git.stderr.on('data', (data) => {
                stderr += data.toString()
            })

            git.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout.trim())
                } else {
                    reject(new Error(`Git command failed: ${stderr || stdout}`))
                }
            })

            git.on('error', (error) => {
                reject(error)
            })
        })
    }

    async isGitRepository(): Promise<boolean> {
        try {
            await this.executeGitCommand(['rev-parse', '--git-dir'])
            return true
        } catch {
            return false
        }
    }

    async initRepository(): Promise<void> {
        await this.executeGitCommand(['init'])
    }

    async getStatus(): Promise<GitStatus> {
        const output = await this.executeGitCommand(['status', '--porcelain', '-b'])
        const lines = output.split('\n').filter(line => line.trim())

        const status: GitStatus = {
            branch: 'main',
            staged: [],
            unstaged: [],
            untracked: [],
            conflicted: [],
            ahead: 0,
            behind: 0,
            clean: true
        }

        for (const line of lines) {
            if (line.startsWith('##')) {
                // Parse branch info
                const branchMatch = line.match(/## ([^.]+)/)
                if (branchMatch) {
                    status.branch = branchMatch[1]
                }

                // Parse ahead/behind info
                const aheadMatch = line.match(/ahead (\\d+)/)
                const behindMatch = line.match(/behind (\\d+)/)
                if (aheadMatch) status.ahead = parseInt(aheadMatch[1])
                if (behindMatch) status.behind = parseInt(behindMatch[1])
            } else {
                const statusCode = line.substring(0, 2)
                const fileName = line.substring(3)

                if (statusCode.includes('U') || statusCode.includes('A') || statusCode.includes('D')) {
                    status.conflicted.push(fileName)
                } else if (statusCode[0] !== ' ' && statusCode[0] !== '?') {
                    status.staged.push(fileName)
                } else if (statusCode[1] !== ' ' && statusCode[1] !== '?') {
                    status.unstaged.push(fileName)
                } else if (statusCode === '??') {
                    status.untracked.push(fileName)
                }
            }
        }

        status.clean = status.staged.length === 0 && status.unstaged.length === 0 &&
            status.untracked.length === 0 && status.conflicted.length === 0

        return status
    }

    async getBranches(): Promise<GitBranch[]> {
        const output = await this.executeGitCommand(['branch', '-vv'])
        const lines = output.split('\n').filter(line => line.trim())

        const branches: GitBranch[] = []

        for (const line of lines) {
            const current = line.startsWith('*')
            const cleanLine = line.replace(/^\\*?\\s+/, '')
            const parts = cleanLine.split(/\\s+/)

            if (parts.length >= 2) {
                const branch: GitBranch = {
                    name: parts[0],
                    current
                }

                // Parse remote tracking info
                const remoteMatch = cleanLine.match(/\[([^\]]+)\]/)
                if (remoteMatch) {
                    const remoteInfo = remoteMatch[1]
                    branch.remote = remoteInfo.split(':')[0]

                    const aheadMatch = remoteInfo.match(/ahead (\\d+)/)
                    const behindMatch = remoteInfo.match(/behind (\\d+)/)
                    if (aheadMatch) branch.ahead = parseInt(aheadMatch[1])
                    if (behindMatch) branch.behind = parseInt(behindMatch[1])
                }

                branches.push(branch)
            }
        }

        return branches
    }

    async createBranch(name: string, startPoint?: string): Promise<void> {
        const args = ['checkout', '-b', name]
        if (startPoint) {
            args.push(startPoint)
        }
        await this.executeGitCommand(args)
    }

    async switchBranch(name: string): Promise<void> {
        await this.executeGitCommand(['checkout', name])
    }

    async deleteBranch(name: string, force = false): Promise<void> {
        const args = ['branch', force ? '-D' : '-d', name]
        await this.executeGitCommand(args)
    }

    async mergeBranch(branchName: string): Promise<void> {
        await this.executeGitCommand(['merge', branchName])
    }

    async getCommitHistory(limit = 50, branch?: string): Promise<GitCommit[]> {
        const args = [
            'log',
            '--pretty=format:%H|%an|%ae|%ad|%s',
            '--date=iso',
            `--max-count=${limit}`
        ]

        if (branch) {
            args.push(branch)
        }

        const output = await this.executeGitCommand(args)
        const lines = output.split('\n').filter(line => line.trim())

        const commits: GitCommit[] = []

        for (const line of lines) {
            const [hash, author, email, date, message] = line.split('|')

            // Get file stats for this commit
            const statsOutput = await this.executeGitCommand([
                'show', '--stat', '--format=', hash
            ])

            const files: string[] = []
            let additions = 0
            let deletions = 0

            const statsLines = statsOutput.split('\n').filter(line => line.trim())
            for (const statsLine of statsLines) {
                if (statsLine.includes('|')) {
                    const fileName = statsLine.split('|')[0].trim()
                    if (fileName) files.push(fileName)
                }

                const summaryMatch = statsLine.match(/(\\d+) insertions?.*?(\\d+) deletions?/)
                if (summaryMatch) {
                    additions = parseInt(summaryMatch[1])
                    deletions = parseInt(summaryMatch[2])
                }
            }

            commits.push({
                hash,
                author,
                email,
                date: new Date(date),
                message,
                files,
                additions,
                deletions
            })
        }

        return commits
    }

    async addFiles(files: string[]): Promise<void> {
        await this.executeGitCommand(['add', ...files])
    }

    async addAllFiles(): Promise<void> {
        await this.executeGitCommand(['add', '.'])
    }

    async resetFiles(files: string[]): Promise<void> {
        await this.executeGitCommand(['reset', 'HEAD', ...files])
    }

    async commit(message: string, author?: { name: string; email: string }): Promise<string> {
        const args = ['commit', '-m', message]

        if (author) {
            args.push('--author', `${author.name} <${author.email}>`)
        }

        const output = await this.executeGitCommand(args)

        // Extract commit hash from output
        const hashMatch = output.match(/\[\w+\s+([a-f0-9]+)\]/)
        return hashMatch ? hashMatch[1] : ''
    }

    async getDiff(options: {
        staged?: boolean
        file?: string
        commit1?: string
        commit2?: string
    } = {}): Promise<GitDiff[]> {
        const args = ['diff']

        if (options.staged) {
            args.push('--staged')
        }

        if (options.commit1 && options.commit2) {
            args.push(`${options.commit1}..${options.commit2}`)
        } else if (options.commit1) {
            args.push(options.commit1)
        }

        if (options.file) {
            args.push('--', options.file)
        }

        args.push('--unified=3')

        const output = await this.executeGitCommand(args)
        return this.parseDiff(output)
    }

    private parseDiff(diffOutput: string): GitDiff[] {
        const diffs: GitDiff[] = []
        const files = diffOutput.split(/^diff --git/m).filter(section => section.trim())

        for (const fileSection of files) {
            const lines = fileSection.split('\n')

            // Parse file header
            const fileHeaderMatch = lines[0]?.match(/a\/(.*?)\s+b\/(.*?)\s*$/)
            if (!fileHeaderMatch) continue

            const oldFile = fileHeaderMatch[1]
            const newFile = fileHeaderMatch[2]

            // Determine change type
            let type: GitDiff['type'] = 'modified'
            if (lines.some(line => line.startsWith('new file mode'))) {
                type = 'added'
            } else if (lines.some(line => line.startsWith('deleted file mode'))) {
                type = 'deleted'
            } else if (oldFile !== newFile) {
                type = 'renamed'
            }

            const chunks: GitDiffChunk[] = []
            let currentChunk: GitDiffChunk | null = null
            let additions = 0
            let deletions = 0

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i]

                // Parse chunk header
                const chunkMatch = line.match(/^@@\\s+-?(\\d+),?(\\d*)\\s+\\+?(\\d+),?(\\d*)\\s+@@/)
                if (chunkMatch) {
                    if (currentChunk) {
                        chunks.push(currentChunk)
                    }

                    currentChunk = {
                        oldStart: parseInt(chunkMatch[1]),
                        oldLines: parseInt(chunkMatch[2]) || 1,
                        newStart: parseInt(chunkMatch[3]),
                        newLines: parseInt(chunkMatch[4]) || 1,
                        lines: []
                    }
                    continue
                }

                // Parse diff lines
                if (currentChunk && (line.startsWith(' ') || line.startsWith('+') || line.startsWith('-'))) {
                    const lineType = line.startsWith('+') ? 'added' :
                        line.startsWith('-') ? 'deleted' : 'context'

                    currentChunk.lines.push({
                        type: lineType,
                        content: line.substring(1)
                    })

                    if (lineType === 'added') additions++
                    if (lineType === 'deleted') deletions++
                }
            }

            if (currentChunk) {
                chunks.push(currentChunk)
            }

            diffs.push({
                file: newFile,
                oldFile: oldFile !== newFile ? oldFile : undefined,
                newFile,
                type,
                additions,
                deletions,
                chunks
            })
        }

        return diffs
    }

    async getRemotes(): Promise<GitRemote[]> {
        const output = await this.executeGitCommand(['remote', '-v'])
        const lines = output.split('\n').filter(line => line.trim())

        const remotes: GitRemote[] = []

        for (const line of lines) {
            const match = line.match(/^(\\w+)\\s+(\\S+)\\s+\\((fetch|push)\\)/)
            if (match) {
                remotes.push({
                    name: match[1],
                    url: match[2],
                    type: match[3] as 'fetch' | 'push'
                })
            }
        }

        return remotes
    }

    async addRemote(name: string, url: string): Promise<void> {
        await this.executeGitCommand(['remote', 'add', name, url])
    }

    async removeRemote(name: string): Promise<void> {
        await this.executeGitCommand(['remote', 'remove', name])
    }

    async push(remote = 'origin', branch?: string): Promise<void> {
        const args = ['push', remote]
        if (branch) {
            args.push(branch)
        }
        await this.executeGitCommand(args)
    }

    async pull(remote = 'origin', branch?: string): Promise<void> {
        const args = ['pull', remote]
        if (branch) {
            args.push(branch)
        }
        await this.executeGitCommand(args)
    }

    async fetch(remote = 'origin'): Promise<void> {
        await this.executeGitCommand(['fetch', remote])
    }

    async clone(url: string, targetPath: string): Promise<void> {
        await this.executeGitCommand(['clone', url, targetPath])
    }

    async stash(message?: string): Promise<void> {
        const args = ['stash']
        if (message) {
            args.push('push', '-m', message)
        }
        await this.executeGitCommand(args)
    }

    async stashPop(): Promise<void> {
        await this.executeGitCommand(['stash', 'pop'])
    }

    async getStashList(): Promise<Array<{ index: number; message: string; date: Date }>> {
        const output = await this.executeGitCommand(['stash', 'list', '--pretty=format:%gd|%gs|%gd'])
        const lines = output.split('\n').filter(line => line.trim())

        return lines.map((line, index) => {
            const [ref, message] = line.split('|')
            return {
                index,
                message: message || 'WIP on branch',
                date: new Date() // Git stash doesn't provide easy date access
            }
        })
    }

    async blame(file: string): Promise<Array<{
        line: number
        content: string
        commit: string
        author: string
        date: Date
    }>> {
        const output = await this.executeGitCommand(['blame', '--line-porcelain', file])
        const lines = output.split('\n')

        const blameInfo: Array<{
            line: number
            content: string
            commit: string
            author: string
            date: Date
        }> = []

        let currentCommit = ''
        let currentAuthor = ''
        let currentDate = new Date()
        let lineNumber = 1

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]

            if (/^[a-f0-9]{40}/.test(line)) {
                currentCommit = line.split(' ')[0]
            } else if (line.startsWith('author ')) {
                currentAuthor = line.substring(7)
            } else if (line.startsWith('author-time ')) {
                currentDate = new Date(parseInt(line.substring(12)) * 1000)
            } else if (line.startsWith('\\t')) {
                blameInfo.push({
                    line: lineNumber++,
                    content: line.substring(1),
                    commit: currentCommit,
                    author: currentAuthor,
                    date: currentDate
                })
            }
        }

        return blameInfo
    }
}
