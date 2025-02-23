/* js/midiConverter.js */

/**
 * MIDI Conversion Module
 * This module transforms detected pitches into MIDI data and handles MIDI output.
 * It uses the Web MIDI API to send MIDI messages to connected devices.
 */

class MIDIConverter {
    constructor() {
        this.midiAccess = null; // Web MIDI API access object
        this.midiOutput = null; // Selected MIDI output device
        this.activeNotes = new Set(); // Tracks currently active MIDI notes
    }

    /**
     * Initializes the MIDIConverter by requesting MIDI access and setting up the output device.
     * @returns {Promise<void>}
     */
    async initialize() {
        if (!navigator.requestMIDIAccess) {
            console.warn("Web MIDI API is not supported in this browser.");
            return;
        }

        try {
            this.midiAccess = await navigator.requestMIDIAccess();
            this.setupMIDIOutput();
        } catch (error) {
            console.error("Failed to access MIDI devices:", error);
        }
    }

    /**
     * Sets up the MIDI output device. Selects the first available output device.
     */
    setupMIDIOutput() {
        const outputs = this.midiAccess.outputs.values();
        for (const output of outputs) {
            this.midiOutput = output;
            console.log(`MIDI Output Device Selected: ${output.name}`);
            break;
        }

        if (!this.midiOutput) {
            console.warn("No MIDI output devices found.");
        }
    }

    /**
     * Converts a frequency to a MIDI note number.
     * @param {number} frequency - The frequency in Hz.
     * @returns {number} - The corresponding MIDI note number.
     */
    frequencyToMidiNote(frequency) {
        return Math.round(69 + 12 * Math.log2(frequency / 440));
    }

    /**
     * Sends a MIDI Note On message.
     * @param {number} midiNote - The MIDI note number.
     * @param {number} velocity - The velocity (0-127).
     */
    sendNoteOn(midiNote, velocity) {
        if (!this.midiOutput) {
            console.warn("No MIDI output device available.");
            return;
        }

        if (!this.activeNotes.has(midiNote)) {
            this.midiOutput.send([0x90, midiNote, velocity]); // 0x90 = Note On
            this.activeNotes.add(midiNote);
            console.log(`Note On: ${midiNote}, Velocity: ${velocity}`);
        }
    }

    /**
     * Sends a MIDI Note Off message.
     * @param {number} midiNote - The MIDI note number.
     */
    sendNoteOff(midiNote) {
        if (!this.midiOutput) {
            console.warn("No MIDI output device available.");
            return;
        }

        if (this.activeNotes.has(midiNote)) {
            this.midiOutput.send([0x80, midiNote, 0]); // 0x80 = Note Off
            this.activeNotes.delete(midiNote);
            console.log(`Note Off: ${midiNote}`);
        }
    }

    /**
     * Handles detected pitches and converts them to MIDI messages.
     * @param {Array<{ freq: number, probability: number }>} detectedPitches - Array of detected pitches.
     * @param {number} noteThreshold - Confidence threshold for note detection.
     */
    handleDetectedPitches(detectedPitches, noteThreshold) {
        const detectedNotes = new Set();

        detectedPitches.forEach((pitch) => {
            if (pitch.probability >= noteThreshold) {
                const midiNote = this.frequencyToMidiNote(pitch.freq);
                detectedNotes.add(midiNote);
                this.sendNoteOn(midiNote, 100); // Example velocity: 100
            }
        });

        // Turn off notes that are no longer detected
        this.activeNotes.forEach((activeNote) => {
            if (!detectedNotes.has(activeNote)) {
                this.sendNoteOff(activeNote);
            }
        });
    }
}

// Export the MIDIConverter class
export default MIDIConverter;
