export interface Track {
  id: string;
  name: string;
  color: string;
  audioFile: string; // Path or URL to the audio file
  volume: number; // Volume level (0-100)
  isMuted: boolean; // Mute status
  effects: {
    reverb: number; // Reverb effect intensity (0-100)
    echo: number; // Echo effect intensity (0-100)
    eq: number; // Equalizer effect intensity (0-100)
  };
}

export interface Project {
  id: string;
  name: string;
  tracks: Track[]; // List of tracks in the project
  masterVolume: number; // Master volume level (0-100)
  bpm: number; // Beats per minute
  timeSignature: string; // Time signature (e.g., "4/4", "3/4")
  createdAt: Date; // Project creation date
  updatedAt?: Date; // Project last updated date
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string; // Hashed password for security
  createdAt: Date; // User account creation date
  updatedAt?: Date; // User account last updated date
}

export interface AudioProcessing {
  id: string;
  trackId: string; // Associated track ID
  effectType: 'reverb' | 'echo' | 'eq' | 'pitchShift'; // Type of audio effect
  intensity: number; // Effect intensity (0-100)
}

export interface ApiResponse<T> {
  success: boolean; // Indicates if the API request was successful
  message: string; // Response message
  data?: T; // Generic type for response data
}
