/* js/utils.js */

/**
 * Utility Module
 * This module provides helper functions, constants, and shared functionality
 * for the Real-time MIDI Guitar application.
 */

/**
 * Converts a MIDI note number to a note name (e.g., 60 -> C4).
 * @param {number} midiNote - The MIDI note number.
 * @returns {string} - The corresponding note name.
 */
export function midiNoteToNoteName(midiNote) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteIndex = midiNote % 12;
    return notes[noteIndex] + octave;
}

/**
 * Converts a frequency in Hz to a MIDI note number.
 * @param {number} frequency - The frequency in Hz.
 * @returns {number} - The corresponding MIDI note number.
 */
export function frequencyToMidiNote(frequency) {
    return Math.round(69 + 12 * Math.log2(frequency / 440));
}

/**
 * Converts a MIDI note number to its corresponding frequency in Hz.
 * @param {number} midiNote - The MIDI note number.
 * @returns {number} - The corresponding frequency in Hz.
 */
export function midiNoteToFrequency(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Clamps a value between a minimum and maximum range.
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum allowable value.
 * @param {number} max - The maximum allowable value.
 * @returns {number} - The clamped value.
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linearly interpolates between two values.
 * @param {number} start - The starting value.
 * @param {number} end - The ending value.
 * @param {number} t - The interpolation factor (0.0 to 1.0).
 * @returns {number} - The interpolated value.
 */
export function lerp(start, end, t) {
    return start + t * (end - start);
}

/**
 * Formats a frequency value in Hz to a readable string with two decimal places.
 * @param {number} frequency - The frequency in Hz.
 * @returns {string} - The formatted frequency string (e.g., "440.00 Hz").
 */
export function formatFrequency(frequency) {
    return `${frequency.toFixed(2)} Hz`;
}

/**
 * Generates a random integer between a specified range.
 * @param {number} min - The minimum value (inclusive).
 * @param {number} max - The maximum value (inclusive).
 * @returns {number} - A random integer within the range.
 */
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculates the Root Mean Square (RMS) of an audio buffer.
 * @param {Float32Array} buffer - The audio buffer.
 * @returns {number} - The RMS value.
 */
export function calculateRMS(buffer) {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
        sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
}

/**
 * Maps a value from one range to another.
 * @param {number} value - The value to map.
 * @param {number} inMin - The minimum value of the input range.
 * @param {number} inMax - The maximum value of the input range.
 * @param {number} outMin - The minimum value of the output range.
 * @param {number} outMax - The maximum value of the output range.
 * @returns {number} - The mapped value.
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Checks if a given value is a power of two.
 * @param {number} value - The value to check.
 * @returns {boolean} - True if the value is a power of two, false otherwise.
 */
export function isPowerOfTwo(value) {
    return (value & (value - 1)) === 0 && value > 0;
}

/**
 * Converts a time value in seconds to a formatted string (e.g., "1:23").
 * @param {number} time - The time in seconds.
 * @returns {string} - The formatted time string.
 */
export function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
