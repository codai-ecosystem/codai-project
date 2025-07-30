/**
 * Audio Processor Worklet for METU
 * 
 * This AudioWorkletProcessor handles real-time audio processing for the METU voice engine,
 * including noise suppression, voice activity detection, and audio quality optimization.
 */

class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();

        this.bufferSize = 1024;
        this.sampleRate = 24000;
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
        this.isActive = false;

        // Voice activity detection parameters
        this.vadThreshold = 0.01;
        this.silenceFrames = 0;
        this.maxSilenceFrames = 50; // ~1 second at 24kHz with 1024 buffer

        // Audio quality parameters
        this.noiseFloor = 0.001;
        this.agcTarget = 0.3;
        this.agcGain = 1.0;

        // Message handling
        this.port.onmessage = (event) => {
            switch (event.data.type) {
                case 'start':
                    this.isActive = true;
                    break;
                case 'stop':
                    this.isActive = false;
                    break;
                case 'setVadThreshold':
                    this.vadThreshold = event.data.threshold;
                    break;
                case 'setNoiseFloor':
                    this.noiseFloor = event.data.level;
                    break;
            }
        };
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];

        if (!input || !input[0] || !this.isActive) {
            return true;
        }

        const inputChannel = input[0];

        // Process audio in chunks
        for (let i = 0; i < inputChannel.length; i++) {
            let sample = inputChannel[i];

            // Apply noise gate
            if (Math.abs(sample) < this.noiseFloor) {
                sample = 0;
            }

            // Apply automatic gain control
            sample = this.applyAGC(sample);

            // Add to buffer
            this.buffer[this.bufferIndex] = sample;
            this.bufferIndex++;

            // When buffer is full, process and send
            if (this.bufferIndex >= this.bufferSize) {
                this.processBuffer();
                this.bufferIndex = 0;
            }
        }

        return true;
    }

    processBuffer() {
        // Calculate RMS energy for voice activity detection
        const energy = this.calculateRMS(this.buffer);
        const isVoiceActive = energy > this.vadThreshold;

        if (isVoiceActive) {
            this.silenceFrames = 0;

            // Convert Float32 to Int16 PCM
            const pcmBuffer = this.float32ToInt16(this.buffer);

            // Send audio data
            this.port.postMessage({
                type: 'audio-data',
                buffer: pcmBuffer.buffer,
                energy: energy,
                isVoiceActive: true
            });

        } else {
            this.silenceFrames++;

            // Send silence indication after extended silence
            if (this.silenceFrames >= this.maxSilenceFrames) {
                this.port.postMessage({
                    type: 'silence-detected',
                    energy: energy
                });
                this.silenceFrames = 0; // Reset to avoid spamming
            }
        }
    }

    calculateRMS(buffer) {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
        }
        return Math.sqrt(sum / buffer.length);
    }

    applyAGC(sample) {
        // Simple automatic gain control
        const currentLevel = Math.abs(sample);

        if (currentLevel > 0) {
            const targetGain = this.agcTarget / currentLevel;
            // Smooth gain changes to avoid artifacts
            this.agcGain += (targetGain - this.agcGain) * 0.01;
            // Limit gain to reasonable bounds
            this.agcGain = Math.max(0.1, Math.min(10.0, this.agcGain));
        }

        return sample * this.agcGain;
    }

    float32ToInt16(float32Array) {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            // Clamp to [-1, 1] and convert to 16-bit integer
            const clamped = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = Math.round(clamped * 32767);
        }
        return int16Array;
    }
}

registerProcessor('audio-processor', AudioProcessor);
