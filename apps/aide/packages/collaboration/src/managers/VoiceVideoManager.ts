import { EventEmitter } from 'events';
import {
	VoiceChannel,
	VoiceParticipant,
	VoiceSettings,
	VoiceRecording,
	ConnectionQuality,
	QualityMode,
	SessionEvent,
	SessionEventType
} from '../types';

export interface VoiceVideoConfig {
	enableVoice: boolean;
	enableVideo: boolean;
	enableScreenShare: boolean;
	audioConstraints?: MediaStreamConstraints['audio'];
	videoConstraints?: MediaStreamConstraints['video'];
	iceServers?: RTCIceServer[];
}

export interface VideoParticipant {
	userId: string;
	isVideoEnabled: boolean;
	isScreenSharing: boolean;
	videoTrack?: MediaStreamTrack;
	screenTrack?: MediaStreamTrack;
	quality: ConnectionQuality;
}

export interface CallSession {
	id: string;
	sessionId: string;
	type: 'voice' | 'video' | 'screen';
	participants: string[];
	startTime: Date;
	endTime?: Date;
	recording?: VoiceRecording;
	quality: ConnectionQuality;
}

/**
 * Advanced Voice and Video Collaboration Manager
 * Supports WebRTC peer-to-peer and server-mediated calls
 */
export class VoiceVideoManager extends EventEmitter {
	private voiceChannels: Map<string, VoiceChannel> = new Map();
	private videoParticipants: Map<string, VideoParticipant> = new Map();
	private peerConnections: Map<string, RTCPeerConnection> = new Map();
	private mediaStreams: Map<string, MediaStream> = new Map();
	private callSessions: Map<string, CallSession> = new Map();
	private recordings: Map<string, VoiceRecording> = new Map();
	private config: VoiceVideoConfig;

	constructor(config: VoiceVideoConfig) {
		super();
		this.config = config;
		this.setupMediaConstraints();
	}
	/**
	 * Create a voice channel for a session
	 */
	async createVoiceChannel(sessionId: string, settings: VoiceSettings): Promise<VoiceChannel> {
		const channel: VoiceChannel = {
			id: this.generateChannelId(),
			sessionId,
			participants: [],
			settings
		};

		this.voiceChannels.set(channel.id, channel);
		this.emit('voiceChannelCreated', { channelId: channel.id, sessionId });
		return channel;
	}

	/**
	 * Join a voice channel
	 */
	async joinVoiceChannel(channelId: string, userId: string): Promise<boolean> {
		const channel = this.voiceChannels.get(channelId);
		if (!channel) {
			return false;
		}

		try {
			// Get user media
			const mediaStream = await this.getUserMedia(channel.settings);
			this.mediaStreams.set(userId, mediaStream);

			// Create peer connections for existing participants
			for (const participant of channel.participants) {
				await this.createPeerConnection(userId, participant.userId, mediaStream);
			}

			// Add user to channel
			const voiceParticipant: VoiceParticipant = {
				userId,
				isMuted: false,
				isSpeaking: false,
				volume: 1.0,
				quality: ConnectionQuality.GOOD
			};

			channel.participants.push(voiceParticipant);

			// Create call session
			const callSession: CallSession = {
				id: this.generateSessionId(),
				sessionId: channel.sessionId,
				type: 'voice',
				participants: [userId],
				startTime: new Date(),
				quality: ConnectionQuality.GOOD
			};

			this.callSessions.set(callSession.id, callSession);

			this.emit('userJoinedVoice', {
				channelId,
				userId,
				participant: voiceParticipant
			});

			return true;
		} catch (error) {
			console.error('Failed to join voice channel:', error);
			return false;
		}
	}

	/**
	 * Leave a voice channel
	 */
	async leaveVoiceChannel(channelId: string, userId: string): Promise<boolean> {
		const channel = this.voiceChannels.get(channelId);
		if (!channel) {
			return false;
		}

		// Clean up media stream
		const mediaStream = this.mediaStreams.get(userId);
		if (mediaStream) {
			mediaStream.getTracks().forEach(track => track.stop());
			this.mediaStreams.delete(userId);
		}

		// Clean up peer connections
		for (const [connectionId, peerConnection] of this.peerConnections) {
			if (connectionId.includes(userId)) {
				peerConnection.close();
				this.peerConnections.delete(connectionId);
			}
		}

		// Remove from channel
		const participantIndex = channel.participants.findIndex(p => p.userId === userId);
		if (participantIndex > -1) {
			channel.participants.splice(participantIndex, 1);
		}

		this.emit('userLeftVoice', { channelId, userId });
		return true;
	}

	/**
	 * Start video sharing
	 */
	async startVideo(userId: string, channelId: string): Promise<boolean> {
		try {
			const videoStream = await navigator.mediaDevices.getUserMedia({
				video: this.config.videoConstraints || true,
				audio: false
			});

			const videoTrack = videoStream.getVideoTracks()[0];
			if (!videoTrack) {
				throw new Error('No video track available');
			}

			const videoParticipant: VideoParticipant = {
				userId,
				isVideoEnabled: true,
				isScreenSharing: false,
				videoTrack,
				quality: ConnectionQuality.GOOD
			};

			this.videoParticipants.set(userId, videoParticipant);

			// Add video track to existing peer connections
			await this.addVideoTrackToPeers(userId, videoStream);

			this.emit('videoStarted', { userId, channelId });
			return true;
		} catch (error) {
			console.error('Failed to start video:', error);
			return false;
		}
	}

	/**
	 * Stop video sharing
	 */
	async stopVideo(userId: string, channelId: string): Promise<boolean> {
		const videoParticipant = this.videoParticipants.get(userId);
		if (!videoParticipant) {
			return false;
		}

		// Stop video track
		if (videoParticipant.videoTrack) {
			videoParticipant.videoTrack.stop();
		}
		videoParticipant.isVideoEnabled = false;
		delete videoParticipant.videoTrack;

		this.emit('videoStopped', { userId, channelId });
		return true;
	}

	/**
	 * Start screen sharing
	 */
	async startScreenShare(userId: string, channelId: string): Promise<boolean> {
		try {
			const screenStream = await navigator.mediaDevices.getDisplayMedia({
				video: true,
				audio: true
			});

			const videoParticipant = this.videoParticipants.get(userId) || {
				userId,
				isVideoEnabled: false,
				isScreenSharing: true,
				quality: ConnectionQuality.GOOD
			}; const screenTrack = screenStream.getVideoTracks()[0];
			if (!screenTrack) {
				throw new Error('No screen track available');
			}

			videoParticipant.isScreenSharing = true;
			videoParticipant.screenTrack = screenTrack;

			this.videoParticipants.set(userId, videoParticipant);

			// Handle screen share end
			screenTrack.onended = () => {
				this.stopScreenShare(userId, channelId);
			};

			// Add screen track to peer connections
			await this.addVideoTrackToPeers(userId, screenStream);

			this.emit('screenShareStarted', { userId, channelId });
			return true;
		} catch (error) {
			console.error('Failed to start screen share:', error);
			return false;
		}
	}

	/**
	 * Stop screen sharing
	 */
	async stopScreenShare(userId: string, channelId: string): Promise<boolean> {
		const videoParticipant = this.videoParticipants.get(userId);
		if (!videoParticipant) {
			return false;
		}

		// Stop screen track
		if (videoParticipant.screenTrack) {
			videoParticipant.screenTrack.stop();
		}
		videoParticipant.isScreenSharing = false;
		delete videoParticipant.screenTrack;

		this.emit('screenShareStopped', { userId, channelId });
		return true;
	}

	/**
	 * Mute/unmute user
	 */
	async toggleMute(userId: string, channelId: string): Promise<boolean> {
		const channel = this.voiceChannels.get(channelId);
		if (!channel) {
			return false;
		}

		const participant = channel.participants.find(p => p.userId === userId);
		if (!participant) {
			return false;
		}

		participant.isMuted = !participant.isMuted;

		// Mute/unmute media stream
		const mediaStream = this.mediaStreams.get(userId);
		if (mediaStream) {
			mediaStream.getAudioTracks().forEach(track => {
				track.enabled = !participant.isMuted;
			});
		}

		this.emit('muteToggled', { userId, channelId, isMuted: participant.isMuted });
		return true;
	}

	/**
	 * Start recording
	 */
	async startRecording(channelId: string): Promise<VoiceRecording | null> {
		const channel = this.voiceChannels.get(channelId);
		if (!channel) {
			return null;
		}

		const recording: VoiceRecording = {
			id: this.generateRecordingId(),
			startTime: new Date(),
			participants: channel.participants.map(p => p.userId)
		};

		channel.recording = recording;
		this.recordings.set(recording.id, recording);

		this.emit('recordingStarted', { channelId, recordingId: recording.id });
		return recording;
	}

	/**
	 * Stop recording
	 */
	async stopRecording(channelId: string): Promise<VoiceRecording | null> {
		const channel = this.voiceChannels.get(channelId);
		if (!channel || !channel.recording) {
			return null;
		}

		const recording = channel.recording;
		recording.endTime = new Date();
		recording.duration = recording.endTime.getTime() - recording.startTime.getTime();

		delete channel.recording;

		this.emit('recordingStopped', { channelId, recording });
		return recording;
	}

	/**
	 * Get channel statistics
	 */
	getChannelStats(channelId: string) {
		const channel = this.voiceChannels.get(channelId);
		if (!channel) {
			return null;
		}

		const activeParticipants = channel.participants.filter(p => !p.isMuted).length;
		const averageQuality = channel.participants.reduce((sum, p) => {
			const qualityScore = this.getQualityScore(p.quality);
			return sum + qualityScore;
		}, 0) / channel.participants.length;

		return {
			channelId,
			participantCount: channel.participants.length,
			activeParticipants,
			averageQuality,
			isRecording: !!channel.recording,
			uptime: Date.now() - new Date().getTime() // This would be channel creation time
		};
	}

	/**
	 * Clean up resources
	 */
	async cleanup(): Promise<void> {
		// Stop all media streams
		for (const mediaStream of this.mediaStreams.values()) {
			mediaStream.getTracks().forEach(track => track.stop());
		}

		// Close all peer connections
		for (const peerConnection of this.peerConnections.values()) {
			peerConnection.close();
		}

		// Clear all maps
		this.mediaStreams.clear();
		this.peerConnections.clear();
		this.voiceChannels.clear();
		this.videoParticipants.clear();
		this.callSessions.clear();
	}

	private async getUserMedia(settings: VoiceSettings): Promise<MediaStream> {
		const constraints: MediaStreamConstraints = {
			audio: {
				echoCancellation: settings.echoCancellation,
				noiseSuppression: settings.noiseSuppression,
				autoGainControl: true,
				...this.config.audioConstraints as any
			}
		};

		return navigator.mediaDevices.getUserMedia(constraints);
	}

	private async createPeerConnection(userId1: string, userId2: string, mediaStream: MediaStream): Promise<RTCPeerConnection> {
		const connectionId = `${userId1}-${userId2}`;

		const peerConnection = new RTCPeerConnection({
			iceServers: this.config.iceServers || [
				{ urls: 'stun:stun.l.google.com:19302' }
			]
		});

		// Add local stream tracks
		mediaStream.getTracks().forEach(track => {
			peerConnection.addTrack(track, mediaStream);
		});

		// Handle remote stream
		peerConnection.ontrack = (event) => {
			this.emit('remoteTrack', {
				userId: userId2,
				track: event.track,
				stream: event.streams[0]
			});
		};

		// Handle ICE candidates
		peerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				this.emit('iceCandidate', {
					fromUserId: userId1,
					toUserId: userId2,
					candidate: event.candidate
				});
			}
		};

		this.peerConnections.set(connectionId, peerConnection);
		return peerConnection;
	}

	private async addVideoTrackToPeers(userId: string, videoStream: MediaStream): Promise<void> {
		for (const [connectionId, peerConnection] of this.peerConnections) {
			if (connectionId.includes(userId)) {
				videoStream.getTracks().forEach(track => {
					peerConnection.addTrack(track, videoStream);
				});
			}
		}
	}

	private setupMediaConstraints(): void {
		// Setup default media constraints based on quality mode
		if (!this.config.audioConstraints) {
			this.config.audioConstraints = {
				echoCancellation: true,
				noiseSuppression: true,
				autoGainControl: true
			};
		}

		if (!this.config.videoConstraints) {
			this.config.videoConstraints = {
				width: { ideal: 1280 },
				height: { ideal: 720 },
				frameRate: { ideal: 30 }
			};
		}
	}

	private getQualityScore(quality: ConnectionQuality): number {
		switch (quality) {
			case ConnectionQuality.EXCELLENT: return 4;
			case ConnectionQuality.GOOD: return 3;
			case ConnectionQuality.FAIR: return 2;
			case ConnectionQuality.POOR: return 1;
			default: return 0;
		}
	}

	private generateChannelId(): string {
		return `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private generateSessionId(): string {
		return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private generateRecordingId(): string {
		return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}
