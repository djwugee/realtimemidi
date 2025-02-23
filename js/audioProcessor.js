/* js/audioProcessor.js */

/**
 * Core audio processing module for real-time audio input and pitch detection.
 * This module uses the Web Audio API to process audio input and implements
 * the YIN algorithm for pitch detection.
 */

// Constants
const BUFFER_SIZE = 2048; // Buffer size for audio processing
const YIN_THRESHOLD = 0.15; // Threshold for YIN pitch detection
const SAMPLE_RATE = 44100; // Default sample rate (can be updated dynamically)

// AudioProcessor Class
class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.mediaStreamSource = null;
        this.scriptProcessor = null;
        this.audioBuffer = new Float32Array(BUFFER_SIZE);
        this.yinBuffer = new Float32Array(BUFFER_SIZE / 2);
        this.onPitchDetected = null; // Callback for pitch detection
    }

    /**
     * Initializes the audio context and sets up the audio processing pipeline.
     * @param {Function} pitchCallback - Callback function for detected pitches.
     */
    async initialize(pitchCallback) {
        this.onPitchDetected = pitchCallback;

        // Create AudioContext
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Create MediaStreamSource
        this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);

        // Create ScriptProcessorNode
        this.scriptProcessor = this.audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);

        // Connect nodes
        this.mediaStreamSource.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.audioContext.destination);

        // Set up audio processing callback
        this.scriptProcessor.onaudioprocess = (event) => {
            this.processAudio(event.inputBuffer.getChannelData(0));
        };
    }

    /**
     * Processes audio data and detects pitch using the YIN algorithm.
     * @param {Float32Array} inputBuffer - Audio input buffer.
     */
    processAudio(inputBuffer) {
        // Copy input buffer to the audio buffer
        this.audioBuffer.set(inputBuffer);

        // Perform pitch detection
        const pitch = this.detectPitch(this.audioBuffer);

        // Trigger callback if pitch is detected
        if (pitch && this.onPitchDetected) {
            this.onPitchDetected(pitch);
        }
    }

    /**
     * Detects pitch using the YIN algorithm.
     * @param {Float32Array} buffer - Audio buffer to analyze.
     * @returns {number|null} - Detected pitch in Hz, or null if no pitch is detected.
     */
    detectPitch(buffer) {
        // Step 1: Difference function
        this.difference(buffer);

        // Step 2: Cumulative mean normalized difference
        this.cumulativeMeanNormalizedDifference();

        // Step 3: Absolute threshold
        const tau = this.absoluteThreshold();
        if (tau === -1) {
            return null; // No pitch detected
        }

        // Step 4: Parabolic interpolation for better accuracy
        const betterTau = this.parabolicInterpolation(tau);

        // Step 5: Convert tau to frequency
        const pitch = SAMPLE_RATE / betterTau;

        return pitch;
    }

    /**
     * Calculates the difference function for the YIN algorithm.
     * @param {Float32Array} buffer - Audio buffer to analyze.
     */
    difference(buffer) {
        for (let tau = 0; tau < this.yinBuffer.length; tau++) {
            this.yinBuffer[tau] = 0;
        }

        for (let tau = 1; tau < this.yinBuffer.length; tau++) {
            for (let i = 0; i < this.yinBuffer.length; i++) {
                const delta = buffer[i] - buffer[i + tau];
                this.yinBuffer[tau] += delta * delta;
            }
        }
    }

    /**
     * Calculates the cumulative mean normalized difference for the YIN algorithm.
     */
    cumulativeMeanNormalizedDifference() {
        this.yinBuffer[0] = 1;
        let runningSum = 0;

        for (let tau = 1; tau < this.yinBuffer.length; tau++) {
            runningSum += this.yinBuffer[tau];
            this.yinBuffer[tau] *= tau / runningSum;
        }
    }

    /**
     * Finds the first minimum below the threshold in the YIN buffer.
     * @returns {number} - Index of the minimum, or -1 if no minimum is found.
     */
    absoluteThreshold() {
        for (let tau = 1; tau < this.yinBuffer.length; tau++) {
            if (this.yinBuffer[tau] < YIN_THRESHOLD) {
                while (tau + 1 < this.yinBuffer.length && this.yinBuffer[tau + 1] < this.yinBuffer[tau]) {
                    tau++;
                }
                return tau;
            }
        }
        return -1; // No pitch detected
    }

    /**
     * Performs parabolic interpolation to refine the detected tau value.
     * @param {number} tau - Initial tau value.
     * @returns {number} - Refined tau value.
     */
    parabolicInterpolation(tau) {
        const y1 = this.yinBuffer[tau - 1];
        const y2 = this.yinBuffer[tau];
        const y3 = this.yinBuffer[tau + 1];
        const betterTau = tau + (y3 - y1) / (2 * (2 * y2 - y1 - y3));
        return betterTau;
    }

    /**
     * Stops the audio processing and releases resources.
     */
    stop() {
        if (this.scriptProcessor) {
            this.scriptProcessor.disconnect();
        }
        if (this.mediaStreamSource) {
            this.mediaStreamSource.disconnect();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Export the AudioProcessor class
export default AudioProcessor;
