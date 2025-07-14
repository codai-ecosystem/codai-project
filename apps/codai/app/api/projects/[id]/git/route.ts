import { NextRequest, NextResponse } from 'next/server'
import { GitManager } from '../../../../../lib/git/GitManager'
import path from 'path'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const projectId = params.id
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')

        // Get project path (this would typically come from your project management system)
        const projectPath = path.join(process.cwd(), 'projects', projectId)
        const gitManager = new GitManager(projectPath)

        // Check if it's a git repository
        const isGitRepo = await gitManager.isGitRepository()
        if (!isGitRepo) {
            return NextResponse.json({ error: 'Not a git repository' }, { status: 400 })
        }

        switch (action) {
            case 'status':
                const status = await gitManager.getStatus()
                return NextResponse.json({ status })

            case 'branches':
                const branches = await gitManager.getBranches()
                return NextResponse.json({ branches })

            case 'history':
                const limit = parseInt(searchParams.get('limit') || '50')
                const branch = searchParams.get('branch') || undefined
                const commits = await gitManager.getCommitHistory(limit, branch)
                return NextResponse.json({ commits })

            case 'diff':
                const staged = searchParams.get('staged') === 'true'
                const file = searchParams.get('file') || undefined
                const commit1 = searchParams.get('commit1') || undefined
                const commit2 = searchParams.get('commit2') || undefined

                const diffs = await gitManager.getDiff({ staged, file, commit1, commit2 })
                return NextResponse.json({ diffs })

            case 'remotes':
                const remotes = await gitManager.getRemotes()
                return NextResponse.json({ remotes })

            case 'stash':
                const stashList = await gitManager.getStashList()
                return NextResponse.json({ stash: stashList })

            case 'blame':
                const blameFile = searchParams.get('file')
                if (!blameFile) {
                    return NextResponse.json({ error: 'File parameter required for blame' }, { status: 400 })
                }
                const blameInfo = await gitManager.blame(blameFile)
                return NextResponse.json({ blame: blameInfo })

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

    } catch (error) {
        console.error('Git operation error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Git operation failed' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const projectId = params.id
        const body = await request.json()
        const { action } = body

        // Get project path
        const projectPath = path.join(process.cwd(), 'projects', projectId)
        const gitManager = new GitManager(projectPath)

        switch (action) {
            case 'init':
                await gitManager.initRepository()
                return NextResponse.json({ success: true, message: 'Repository initialized' })

            case 'add':
                const { files, all } = body
                if (all) {
                    await gitManager.addAllFiles()
                } else if (files && Array.isArray(files)) {
                    await gitManager.addFiles(files)
                } else {
                    return NextResponse.json({ error: 'Files array or all flag required' }, { status: 400 })
                }
                return NextResponse.json({ success: true, message: 'Files added to staging' })

            case 'reset':
                const { resetFiles } = body
                if (!resetFiles || !Array.isArray(resetFiles)) {
                    return NextResponse.json({ error: 'Files array required' }, { status: 400 })
                }
                await gitManager.resetFiles(resetFiles)
                return NextResponse.json({ success: true, message: 'Files reset from staging' })

            case 'commit':
                const { message, author } = body
                if (!message) {
                    return NextResponse.json({ error: 'Commit message required' }, { status: 400 })
                }
                const commitHash = await gitManager.commit(message, author)
                return NextResponse.json({
                    success: true,
                    message: 'Changes committed',
                    hash: commitHash
                })

            case 'branch':
                const { name, startPoint, switch: switchBranch } = body
                if (!name) {
                    return NextResponse.json({ error: 'Branch name required' }, { status: 400 })
                }

                if (switchBranch) {
                    await gitManager.switchBranch(name)
                    return NextResponse.json({ success: true, message: `Switched to branch ${name}` })
                } else {
                    await gitManager.createBranch(name, startPoint)
                    return NextResponse.json({ success: true, message: `Branch ${name} created` })
                }

            case 'merge':
                const { branchName } = body
                if (!branchName) {
                    return NextResponse.json({ error: 'Branch name required' }, { status: 400 })
                }
                await gitManager.mergeBranch(branchName)
                return NextResponse.json({ success: true, message: `Merged branch ${branchName}` })

            case 'push':
                const { remote = 'origin', branch } = body
                await gitManager.push(remote, branch)
                return NextResponse.json({ success: true, message: 'Changes pushed' })

            case 'pull':
                const { remote: pullRemote = 'origin', branch: pullBranch } = body
                await gitManager.pull(pullRemote, pullBranch)
                return NextResponse.json({ success: true, message: 'Changes pulled' })

            case 'fetch':
                const { remote: fetchRemote = 'origin' } = body
                await gitManager.fetch(fetchRemote)
                return NextResponse.json({ success: true, message: 'Fetched from remote' })

            case 'stash':
                const { stashMessage } = body
                await gitManager.stash(stashMessage)
                return NextResponse.json({ success: true, message: 'Changes stashed' })

            case 'stash_pop':
                await gitManager.stashPop()
                return NextResponse.json({ success: true, message: 'Stash applied' })

            case 'add_remote':
                const { remoteName, remoteUrl } = body
                if (!remoteName || !remoteUrl) {
                    return NextResponse.json({ error: 'Remote name and URL required' }, { status: 400 })
                }
                await gitManager.addRemote(remoteName, remoteUrl)
                return NextResponse.json({ success: true, message: `Remote ${remoteName} added` })

            case 'remove_remote':
                const { remoteName: removeRemoteName } = body
                if (!removeRemoteName) {
                    return NextResponse.json({ error: 'Remote name required' }, { status: 400 })
                }
                await gitManager.removeRemote(removeRemoteName)
                return NextResponse.json({ success: true, message: `Remote ${removeRemoteName} removed` })

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

    } catch (error) {
        console.error('Git operation error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Git operation failed' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const projectId = params.id
        const { searchParams } = new URL(request.url)
        const branchName = searchParams.get('branch')
        const force = searchParams.get('force') === 'true'

        if (!branchName) {
            return NextResponse.json({ error: 'Branch name required' }, { status: 400 })
        }

        // Get project path
        const projectPath = path.join(process.cwd(), 'projects', projectId)
        const gitManager = new GitManager(projectPath)

        await gitManager.deleteBranch(branchName, force)
        return NextResponse.json({
            success: true,
            message: `Branch ${branchName} deleted`
        })

    } catch (error) {
        console.error('Git delete operation error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Git delete operation failed' },
            { status: 500 }
        )
    }
}
