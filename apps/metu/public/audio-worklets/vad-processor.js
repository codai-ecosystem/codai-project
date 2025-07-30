/**
 * VAD Audio Worklet Processor
 * 
 * High-performance audio processing worklet for voice activity detection.
 * Runs in a separate audio thread for real-time processing with minimal latency.
 */

class VADProcessor extends AudioWorkletProcessor {
    private frameSize: number;
    private sampleRate: number;
    private frameBuffer: Float32Array;
    private bufferIndex: number = 0;

    constructor(options?: AudioWorkletNodeOptions) {
        super();

        this.frameSize = options?.processorOptions?.frameSize || 1024;
        this.sampleRate = options?.processorOptions?.sampleRate || 16000;
        this.frameBuffer = new Float32Array(this.frameSize);

        console.log(`VAD Worklet initialized: frameSize=${this.frameSize}, sampleRate=${this.sampleRate}`);
    }

    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean {
        const input = inputs[0];
        const output = outputs[0];

        if (input.length > 0 && input[0]) {
            const channelData = input[0];

            // Copy input to output (pass-through)
            if (output[0]) {
                output[0].set(channelData);
            }

            // Process audio in frames
            for (let i = 0; i < channelData.length; i++) {
                this.frameBuffer[this.bufferIndex] = channelData[i];
                this.bufferIndex++;

                // When frame is full, send to main thread
                if (this.bufferIndex >= this.frameSize) {
                    // Send frame data to main thread
                    this.port.postMessage({
                        type: 'audioFrame',
                        data: this.frameBuffer.slice(), // Copy the buffer
                        timestamp: currentTime
                    });

                    this.bufferIndex = 0;
                }
            }
        }

        return true; // Keep processor alive
    }
}

// Register the processor
registerProcessor('vad-processor', VADProcessor);
