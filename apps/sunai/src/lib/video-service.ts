import type {
    VideoCallState,
    MediaStreamState,
    VideoQuality,
    ConnectionState
} from '../types'

export class SunAIVideoService {
    private localStream: MediaStream | null = null
    private remoteStream: MediaStream | null = null
    private peerConnection: RTCPeerConnection | null = null
    private initialized = false

    constructor() {
        this.initializeWebRTC()
    }

    private initializeWebRTC() {
        try {
            // Initialize with STUN servers for NAT traversal
            const configuration: RTCConfiguration = {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }

            this.peerConnection = new RTCPeerConnection(configuration)
            this.setupPeerConnectionHandlers()
            this.initialized = true
        } catch (error) {
            console.error('Failed to initialize WebRTC:', error)
        }
    }

    private setupPeerConnectionHandlers() {
        if (!this.peerConnection) return

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // In a real app, send this candidate to the remote peer
                console.log('ICE candidate:', event.candidate)
            }
        }

        this.peerConnection.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                this.remoteStream = event.streams[0]
                console.log('Remote stream received')
            }
        }

        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection?.connectionState)
        }
    }

    async startLocalVideo(constraints?: MediaStreamConstraints): Promise<MediaStream> {
        try {
            const defaultConstraints: MediaStreamConstraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            }

            this.localStream = await navigator.mediaDevices.getUserMedia(
                constraints || defaultConstraints
            )

            // Add tracks to peer connection
            if (this.peerConnection && this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    this.peerConnection!.addTrack(track, this.localStream!)
                })
            }

            return this.localStream
        } catch (error) {
            throw new Error(`Failed to start local video: ${error}`)
        }
    }

    async stopLocalVideo(): Promise<void> {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                track.stop()
            })
            this.localStream = null
        }
    }

    async toggleVideoMute(): Promise<boolean> {
        if (!this.localStream) return false

        const videoTrack = this.localStream.getVideoTracks()[0]
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled
            return !videoTrack.enabled
        }
        return false
    }

    async toggleAudioMute(): Promise<boolean> {
        if (!this.localStream) return false

        const audioTrack = this.localStream.getAudioTracks()[0]
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled
            return !audioTrack.enabled
        }
        return false
    }

    getLocalStream(): MediaStream | null {
        return this.localStream
    }

    getRemoteStream(): MediaStream | null {
        return this.remoteStream
    }

    getVideoCallState(): VideoCallState {
        const hasVideo = !!this.localStream?.getVideoTracks().length
        const hasAudio = !!this.localStream?.getAudioTracks().length
        const isVideoMuted = hasVideo ? !this.localStream?.getVideoTracks()[0]?.enabled : false
        const isAudioMuted = hasAudio ? !this.localStream?.getAudioTracks()[0]?.enabled : false

        return {
            isActive: !!this.localStream,
            hasVideo,
            hasAudio,
            isVideoMuted,
            isAudioMuted,
            participantCount: this.remoteStream ? 2 : 1,
            duration: 0, // Would be calculated from call start time
            quality: this.getConnectionQuality()
        }
    }

    getMediaStreamState(): MediaStreamState {
        const videoTrack = this.localStream?.getVideoTracks()[0]
        const audioTrack = this.localStream?.getAudioTracks()[0]

        return {
            hasVideo: !!videoTrack,
            hasAudio: !!audioTrack,
            videoEnabled: videoTrack?.enabled ?? false,
            audioEnabled: audioTrack?.enabled ?? false,
            videoDeviceId: videoTrack?.getSettings().deviceId || '',
            audioDeviceId: audioTrack?.getSettings().deviceId || '',
            resolution: videoTrack ? {
                width: videoTrack.getSettings().width || 0,
                height: videoTrack.getSettings().height || 0
            } : null
        }
    }

    private getConnectionQuality(): VideoQuality {
        if (!this.peerConnection) return 'poor'

        const connectionState = this.peerConnection.connectionState
        switch (connectionState) {
            case 'connected':
                return 'excellent'
            case 'connecting':
                return 'good'
            case 'new':
                return 'fair'
            default:
                return 'poor'
        }
    }

    async getAvailableDevices(): Promise<{
        videoDevices: MediaDeviceInfo[]
        audioDevices: MediaDeviceInfo[]
    }> {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices()

            return {
                videoDevices: devices.filter(device => device.kind === 'videoinput'),
                audioDevices: devices.filter(device => device.kind === 'audioinput')
            }
        } catch (error) {
            console.error('Failed to get available devices:', error)
            return { videoDevices: [], audioDevices: [] }
        }
    }

    async switchVideoDevice(deviceId: string): Promise<void> {
        if (!this.localStream) return

        try {
            // Stop current video track
            const currentVideoTrack = this.localStream.getVideoTracks()[0]
            if (currentVideoTrack) {
                currentVideoTrack.stop()
                this.localStream.removeTrack(currentVideoTrack)
            }

            // Get new video stream with selected device
            const newVideoStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: deviceId } },
                audio: false
            })

            const newVideoTrack = newVideoStream.getVideoTracks()[0]
            this.localStream.addTrack(newVideoTrack)

            // Replace track in peer connection
            if (this.peerConnection) {
                const sender = this.peerConnection.getSenders().find(s =>
                    s.track && s.track.kind === 'video'
                )
                if (sender) {
                    await sender.replaceTrack(newVideoTrack)
                }
            }
        } catch (error) {
            throw new Error(`Failed to switch video device: ${error}`)
        }
    }

    async switchAudioDevice(deviceId: string): Promise<void> {
        if (!this.localStream) return

        try {
            // Stop current audio track
            const currentAudioTrack = this.localStream.getAudioTracks()[0]
            if (currentAudioTrack) {
                currentAudioTrack.stop()
                this.localStream.removeTrack(currentAudioTrack)
            }

            // Get new audio stream with selected device
            const newAudioStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: { deviceId: { exact: deviceId } }
            })

            const newAudioTrack = newAudioStream.getAudioTracks()[0]
            this.localStream.addTrack(newAudioTrack)

            // Replace track in peer connection
            if (this.peerConnection) {
                const sender = this.peerConnection.getSenders().find(s =>
                    s.track && s.track.kind === 'audio'
                )
                if (sender) {
                    await sender.replaceTrack(newAudioTrack)
                }
            }
        } catch (error) {
            throw new Error(`Failed to switch audio device: ${error}`)
        }
    }

    async createOffer(): Promise<RTCSessionDescriptionInit> {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized')
        }

        const offer = await this.peerConnection.createOffer()
        await this.peerConnection.setLocalDescription(offer)
        return offer
    }

    async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized')
        }

        await this.peerConnection.setRemoteDescription(offer)
        const answer = await this.peerConnection.createAnswer()
        await this.peerConnection.setLocalDescription(answer)
        return answer
    }

    async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized')
        }

        await this.peerConnection.setRemoteDescription(answer)
    }

    async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized')
        }

        await this.peerConnection.addIceCandidate(candidate)
    }

    getConnectionStats(): Promise<RTCStatsReport | null> {
        if (!this.peerConnection) {
            return Promise.resolve(null)
        }

        return this.peerConnection.getStats()
    }

    async endCall(): Promise<void> {
        // Stop local stream
        await this.stopLocalVideo()

        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close()
            this.peerConnection = null
        }

        // Reset streams
        this.localStream = null
        this.remoteStream = null

        // Reinitialize for next call
        this.initializeWebRTC()
    }

    isServiceInitialized(): boolean {
        return this.initialized
    }

    getPeerConnection(): RTCPeerConnection | null {
        return this.peerConnection
    }

    // Screen sharing functionality
    async startScreenShare(): Promise<MediaStream> {
        try {
            const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({
                video: true,
                audio: true
            })

            // Replace video track with screen share
            if (this.peerConnection && this.localStream) {
                const videoTrack = screenStream.getVideoTracks()[0]
                const sender = this.peerConnection.getSenders().find(s =>
                    s.track && s.track.kind === 'video'
                )
                if (sender && videoTrack) {
                    await sender.replaceTrack(videoTrack)
                }
            }

            return screenStream
        } catch (error) {
            throw new Error(`Failed to start screen share: ${error}`)
        }
    }

    async stopScreenShare(): Promise<void> {
        // Switch back to camera
        const devices = await this.getAvailableDevices()
        if (devices.videoDevices.length > 0) {
            await this.switchVideoDevice(devices.videoDevices[0].deviceId)
        }
    }
}
