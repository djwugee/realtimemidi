
## Project Description
Real-time MIDI Guitar is a web-based application that converts guitar audio input into MIDI notes in real-time. It supports polyphonic pitch detection, allowing multiple notes to be detected simultaneously, and provides low-latency performance for a seamless user experience.

## Setup Instructions
### Prerequisites
- A modern web browser with Web Audio API and Web MIDI API support (e.g., Chrome, Edge).
- A guitar and an audio interface or microphone for input.
- (Optional) A MIDI output device for testing.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/djwugee/realtimemidi.git
   ```
2. Navigate to the project directory:
   ```bash
   cd realtimemidi
   ```
3. Open `index.html` in your browser to launch the application.

## Features
- **Real-Time Pitch Detection**: Detects guitar notes with minimal latency.
- **Polyphonic Support**: Handles multiple notes played simultaneously.
- **MIDI Conversion**: Converts detected pitches into MIDI messages.
- **User-Friendly Interface**: Provides visual feedback and controls for customization.
- **Cross-Browser Compatibility**: Works on modern browsers with Web Audio and Web MIDI API support.

## Usage Guidelines
1. Connect your guitar to your computer via an audio interface or microphone.
2. Open the application in your browser.
3. Click the "Start" button to begin audio processing.
4. Play your guitar, and the application will display detected notes and send MIDI messages.

## Contribution Guidelines
We welcome contributions from the community! To contribute:
1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes and push them to your fork.
4. Submit a pull request with a detailed description of your changes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.