/* js/ui.js */

/**
 * UI Module
 * This module handles user interface interactions, visual feedback, and settings management.
 * It interacts with the DOM elements defined in index.html and provides a seamless user experience.
 */

class UI {
    constructor() {
        // DOM Elements
        this.startButton = document.getElementById('startButton');
        this.onsetThresholdSlider = document.getElementById('onsetThreshold');
        this.onsetThresholdValue = document.getElementById('onsetThresholdValue');
        this.noteThresholdSlider = document.getElementById('noteThreshold');
        this.noteThresholdValue = document.getElementById('noteThresholdValue');
        this.outputDiv = document.getElementById('outputDiv');
        this.visualizerCanvas = document.getElementById('visualizerCanvas');
        this.visualizerContext = this.visualizerCanvas.getContext('2d');

        // Event Listeners
        this.startButton.addEventListener('click', () => this.handleStartButtonClick());
        this.onsetThresholdSlider.addEventListener('input', (event) => this.updateOnsetThreshold(event));
        this.noteThresholdSlider.addEventListener('input', (event) => this.updateNoteThreshold(event));

        // Visualizer Properties
        this.visualizerAnimationFrame = null;
        this.audioDataArray = null;
        this.audioAnalyser = null;

        // Callback Placeholders
        this.onStart = null; // Callback for start button click
        this.onThresholdChange = null; // Callback for threshold changes
    }

    /**
     * Sets the callback for the start button click.
     * @param {Function} callback - The callback function to execute on start button click.
     */
    setStartCallback(callback) {
        this.onStart = callback;
    }

    /**
     * Sets the callback for threshold changes.
     * @param {Function} callback - The callback function to execute on threshold changes.
     */
    setThresholdChangeCallback(callback) {
        this.onThresholdChange = callback;
    }

    /**
     * Handles the start button click event.
     */
    handleStartButtonClick() {
        if (this.onStart) {
            this.onStart();
        }
    }

    /**
     * Updates the onset threshold value and triggers the callback.
     * @param {Event} event - The input event from the slider.
     */
    updateOnsetThreshold(event) {
        const value = parseFloat(event.target.value);
        this.onsetThresholdValue.textContent = value.toFixed(2);
        if (this.onThresholdChange) {
            this.onThresholdChange('onsetThreshold', value);
        }
    }

    /**
     * Updates the note confidence threshold value and triggers the callback.
     * @param {Event} event - The input event from the slider.
     */
    updateNoteThreshold(event) {
        const value = parseFloat(event.target.value);
        this.noteThresholdValue.textContent = value.toFixed(2);
        if (this.onThresholdChange) {
            this.onThresholdChange('noteThreshold', value);
        }
    }

    /**
     * Displays the detected MIDI note in the output section.
     * @param {string} note - The note name to display.
     * @param {string} action - The action type ('on' or 'off').
     */
    displayNote(note, action) {
        if (action === 'on') {
            this.outputDiv.textContent += `${note} `;
        } else if (action === 'off') {
            this.outputDiv.textContent = this.outputDiv.textContent.replace(`${note} `, '');
        }
    }

    /**
     * Initializes the audio visualizer with an analyser node.
     * @param {AnalyserNode} analyser - The Web Audio API AnalyserNode.
     */
    initializeVisualizer(analyser) {
        this.audioAnalyser = analyser;
        this.audioDataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
        this.startVisualizer();
    }

    /**
     * Starts the audio visualizer animation.
     */
    startVisualizer() {
        const draw = () => {
            this.visualizerAnimationFrame = requestAnimationFrame(draw);

            // Clear the canvas
            this.visualizerContext.clearRect(0, 0, this.visualizerCanvas.width, this.visualizerCanvas.height);

            // Get audio data
            this.audioAnalyser.getByteTimeDomainData(this.audioDataArray);

            // Draw waveform
            this.visualizerContext.lineWidth = 2;
            this.visualizerContext.strokeStyle = '#4CAF50';
            this.visualizerContext.beginPath();

            const sliceWidth = this.visualizerCanvas.width / this.audioDataArray.length;
            let x = 0;

            for (let i = 0; i < this.audioDataArray.length; i++) {
                const v = this.audioDataArray[i] / 128.0;
                const y = (v * this.visualizerCanvas.height) / 2;

                if (i === 0) {
                    this.visualizerContext.moveTo(x, y);
                } else {
                    this.visualizerContext.lineTo(x, y);
                }

                x += sliceWidth;
            }

            this.visualizerContext.lineTo(this.visualizerCanvas.width, this.visualizerCanvas.height / 2);
            this.visualizerContext.stroke();
        };

        draw();
    }

    /**
     * Stops the audio visualizer animation.
     */
    stopVisualizer() {
        if (this.visualizerAnimationFrame) {
            cancelAnimationFrame(this.visualizerAnimationFrame);
            this.visualizerAnimationFrame = null;
        }
    }
}

// Export the UI class
export default UI;
