import * as Tone from 'tone';

interface AudioTrack {
  id: string;
  name: string;
  audioBuffer: AudioBuffer | null;
  volume: number;
  isMuted: boolean;
  effects: {
    reverb: number;
    echo: number;
    pitchShift: number;
  };
}

class AudioEngine {
  private tracks: Map<string, AudioTrack>;
  private masterVolume: Tone.Volume;
  private reverb: Tone.Reverb;
  private delay: Tone.FeedbackDelay;
  private pitchShift: Tone.PitchShift;

  constructor() {
    this.tracks = new Map();
    this.masterVolume = new Tone.Volume(0).toDestination();
    this.reverb = new Tone.Reverb({ decay: 2, wet: 0 }).connect(this.masterVolume);
    this.delay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.5, wet: 0 }).connect(this.masterVolume);
    this.pitchShift = new Tone.PitchShift({ pitch: 0, wet: 0 }).connect(this.masterVolume);
  }

  async loadAudioFile(id: string, name: string, file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await Tone.getContext().rawContext.decodeAudioData(arrayBuffer);

    const track: AudioTrack = {
      id,
      name,
      audioBuffer,
      volume: 100,
      isMuted: false,
      effects: {
        reverb: 0,
        echo: 0,
        pitchShift: 0,
      },
    };

    this.tracks.set(id, track);
  }

  setTrackVolume(id: string, volume: number): void {
    const track = this.tracks.get(id);
    if (track) {
      track.volume = volume;
      if (!track.isMuted) {
        const gain = volume / 100;
        const player = new Tone.Player(track.audioBuffer!).connect(this.masterVolume);
        player.volume.value = Tone.gainToDb(gain);
      }
    }
  }

  toggleMuteTrack(id: string): void {
    const track = this.tracks.get(id);
    if (track) {
      track.isMuted = !track.isMuted;
      if (track.isMuted) {
        this.setTrackVolume(id, 0);
      } else {
        this.setTrackVolume(id, track.volume);
      }
    }
  }

  applyEffect(id: string, effect: 'reverb' | 'echo' | 'pitchShift', value: number): void {
    const track = this.tracks.get(id);
    if (track) {
      track.effects[effect] = value;

      switch (effect) {
        case 'reverb':
          this.reverb.wet.value = value / 100;
          break;
        case 'echo':
          this.delay.wet.value = value / 100;
          break;
        case 'pitchShift':
          this.pitchShift.pitch = value;
          break;
      }
    }
  }

  async exportAudio(): Promise<Blob> {
    const offlineContext = new OfflineAudioContext(2, Tone.getContext().rawContext.sampleRate * 30, Tone.getContext().rawContext.sampleRate);

    const destination = offlineContext.destination;
    const gainNode = offlineContext.createGain();
    gainNode.connect(destination);

    for (const track of this.tracks.values()) {
      if (track.audioBuffer) {
        const bufferSource = offlineContext.createBufferSource();
        bufferSource.buffer = track.audioBuffer;

        const trackGain = offlineContext.createGain();
        trackGain.gain.value = track.isMuted ? 0 : track.volume / 100;

        bufferSource.connect(trackGain);
        trackGain.connect(gainNode);
        bufferSource.start();
      }
    }

    const renderedBuffer = await offlineContext.startRendering();
    const wavBlob = this.audioBufferToWav(renderedBuffer);
    return wavBlob;
  }

  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const numOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numOfChannels * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + buffer.length * numOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * numOfChannels * 2, true);
    view.setUint16(32, numOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, buffer.length * numOfChannels * 2, true);

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numOfChannels; channel++) {
        const sample = buffer.getChannelData(channel)[i];
        const intSample = Math.max(-1, Math.min(1, sample)) * 0x7fff;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return new Blob([bufferArray], { type: 'audio/wav' });
  }
}

export const audioEngine = new AudioEngine();
