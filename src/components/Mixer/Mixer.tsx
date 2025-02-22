import React, { useState } from 'react';
import AudioTrack from '../AudioTrack/AudioTrack';
import './Mixer.css';

interface MixerProps {
  tracks: Array<{
    id: string;
    name: string;
    color: string;
    audioFile: File | string;
    effects: {
      reverb: number;
      echo: number;
      eq: number;
    };
  }>;
  onTrackReorder: (draggedId: string, targetId: string) => void;
  onTrackMuteToggle: (id: string, isMuted: boolean) => void;
  onTrackVolumeChange: (id: string, volume: number) => void;
  onTrackEffectChange: (id: string, effect: string, value: number) => void;
  onMasterVolumeChange: (volume: number) => void;
  onTransportControl: (action: 'play' | 'pause' | 'stop') => void;
  onTimeSignatureChange: (timeSignature: string) => void;
  onBPMChange: (bpm: number) => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
}

const Mixer: React.FC<MixerProps> = ({
  tracks,
  onTrackReorder,
  onTrackMuteToggle,
  onTrackVolumeChange,
  onTrackEffectChange,
  onMasterVolumeChange,
  onTransportControl,
  onTimeSignatureChange,
  onBPMChange,
  onSaveProject,
  onLoadProject,
}) => {
  const [masterVolume, setMasterVolume] = useState(100);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [bpm, setBPM] = useState(120);

  const handleMasterVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(event.target.value, 10);
    setMasterVolume(newVolume);
    onMasterVolumeChange(newVolume);
  };

  const handleTimeSignatureChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimeSignature = event.target.value;
    setTimeSignature(newTimeSignature);
    onTimeSignatureChange(newTimeSignature);
  };

  const handleBPMChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBPM = parseInt(event.target.value, 10);
    setBPM(newBPM);
    onBPMChange(newBPM);
  };

  return (
    <div className="mixer">
      <div className="mixer-header">
        <h1>Music Mixer</h1>
        <div className="project-controls">
          <button onClick={onSaveProject}>Save Project</button>
          <button onClick={onLoadProject}>Load Project</button>
        </div>
      </div>
      <div className="transport-controls">
        <button onClick={() => onTransportControl('play')}>Play</button>
        <button onClick={() => onTransportControl('pause')}>Pause</button>
        <button onClick={() => onTransportControl('stop')}>Stop</button>
      </div>
      <div className="global-controls">
        <div className="master-volume">
          <label htmlFor="master-volume">Master Volume</label>
          <input
            id="master-volume"
            type="range"
            min="0"
            max="100"
            value={masterVolume}
            onChange={handleMasterVolumeChange}
          />
        </div>
        <div className="time-signature">
          <label htmlFor="time-signature">Time Signature</label>
          <select
            id="time-signature"
            value={timeSignature}
            onChange={handleTimeSignatureChange}
          >
            <option value="4/4">4/4</option>
            <option value="3/4">3/4</option>
            <option value="6/8">6/8</option>
            <option value="7/8">7/8</option>
          </select>
        </div>
        <div className="bpm-control">
          <label htmlFor="bpm">BPM</label>
          <input
            id="bpm"
            type="number"
            min="40"
            max="240"
            value={bpm}
            onChange={handleBPMChange}
          />
        </div>
      </div>
      <div className="track-list">
        {tracks.map((track) => (
          <AudioTrack
            key={track.id}
            id={track.id}
            name={track.name}
            color={track.color}
            audioFile={track.audioFile}
            onReorder={onTrackReorder}
            onMuteToggle={onTrackMuteToggle}
            onVolumeChange={onTrackVolumeChange}
            effects={track.effects}
            onEffectChange={onTrackEffectChange}
          />
        ))}
      </div>
    </div>
  );
};

export default Mixer;
