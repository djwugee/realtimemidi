/* js/app.js */

/**
 * Main Application File
 * This file initializes and coordinates all modules of the Real-time MIDI Guitar application.
 * It sets up the audio processing, MIDI conversion, and user interface interactions.
 */

import AudioProcessor from './audioProcessor.js';
import MIDIConverter from './midiConverter.js';
import UI from './ui.js';

// Main Application Class
class App {
    constructor() {
        this.audioProcessor = new AudioProcessor();
        this.midiConverter = new MIDIConverter();
        this.ui = new UI();

        // Application State
        this.onsetThreshold = 0.02; // Default onset threshold
        this.noteThreshold = 0.8; // Default note confidence threshold
    }

    /**
     * Initializes the application by setting up all modules and event listeners.
     */
    async initialize() {
        console.log('Initializing application...');

        // Initialize MIDI Converter
        await this.midiConverter.initialize();

        // Set up UI callbacks
        this.ui.setStartCallback(() => this.start());
        this.ui.setThresholdChangeCallback((type, value) => this.updateThreshold(type, value));

        console.log('Application initialized.');
    }

    /**
     * Starts the audio processing and visualizer.
     */
    async start() {
        console.log('Starting application...');

        // Initialize Audio Processor with pitch detection callback
        await this.audioProcessor.initialize((pitch) => this.handlePitchDetected(pitch));

        // Set up audio visualizer
        const analyser = this.audioProcessor.audioContext.createAnalyser();
        this.audioProcessor.mediaStreamSource.connect(analyser);
        this.ui.initializeVisualizer(analyser);

        console.log('Application started.');
    }

    /**
     * Handles detected pitches from the AudioProcessor.
     * @param {number} pitch - Detected pitch in Hz.
     */
    handlePitchDetected(pitch) {
        console.log(`Detected pitch: ${pitch} Hz`);

        // Convert pitch to MIDI note and handle MIDI output
        const detectedPitches = [
            { freq: pitch, probability: 1.0 } // Assume high confidence for single pitch
        ];
        this.midiConverter.handleDetectedPitches(detectedPitches, this.noteThreshold);

        // Display detected note in the UI
        const midiNote = this.midiConverter.frequencyToMidiNote(pitch);
        const noteName = this.midiNoteToNoteName(midiNote);
        this.ui.displayNote(noteName, 'on');
    }

    /**
     * Updates the onset or note confidence threshold based on user input.
     * @param {string} type - The type of threshold ('onsetThreshold' or 'noteThreshold').
     * @param {number} value - The new threshold value.
     */
    updateThreshold(type, value) {
        if (type === 'onsetThreshold') {
            this.onsetThreshold = value;
            console.log(`Updated onset threshold: ${value}`);
        } else if (type === 'noteThreshold') {
            this.noteThreshold = value;
            console.log(`Updated note confidence threshold: ${value}`);
        }
    }

    /**
     * Converts a MIDI note number to a note name (e.g., 60 -> C4).
     * @param {number} midiNote - The MIDI note number.
     * @returns {string} - The corresponding note name.
     */
    midiNoteToNoteName(midiNote) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(midiNote / 12) - 1;
        const noteIndex = midiNote % 12;
        return notes[noteIndex] + octave;
    }
}

// Initialize and start the application
const app = new App();
app.initialize();
