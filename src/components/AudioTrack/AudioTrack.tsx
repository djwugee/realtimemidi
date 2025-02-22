import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Slider } from '@mui/material';
import './AudioTrack.css';

interface AudioTrackProps {
  id: string;
  name: string;
  color: string;
  audioFile: File | string;
  onReorder: (draggedId: string, targetId: string) => void;
  onMuteToggle: (id: string, isMuted: boolean) => void;
  onVolumeChange: (id: string, volume: number) => void;
  effects: {
    reverb: number;
    echo: number;
    eq: number;
  };
  onEffectChange: (id: string, effect: string, value: number) => void;
}

const AudioTrack: React.FC<AudioTrackProps> = ({
  id,
  name,
  color,
  audioFile,
  onReorder,
  onMuteToggle,
  onVolumeChange,
  effects,
  onEffectChange,
}) => {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    if (waveformRef.current) {
      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: color,
        progressColor: '#555',
        cursorColor: '#333',
        height: 80,
        responsive: true,
      });

      waveSurferRef.current.load(typeof audioFile === 'string' ? audioFile : URL.createObjectURL(audioFile));
    }

    return () => {
      waveSurferRef.current?.destroy();
    };
  }, [audioFile, color]);

  const handleMuteToggle = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    waveSurferRef.current?.setMute(newMuteState);
    onMuteToggle(id, newMuteState);
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const newVolume = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(newVolume);
    waveSurferRef.current?.setVolume(newVolume / 100);
    onVolumeChange(id, newVolume);
  };

  const handleEffectChange = (effect: string, value: number) => {
    onEffectChange(id, effect, value);
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const draggedId = event.dataTransfer.getData('text/plain');
    onReorder(draggedId, id);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div
      className="audio-track"
      draggable
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="track-header" style={{ backgroundColor: color }}>
        <span className="track-name">{name}</span>
        <button className="mute-button" onClick={handleMuteToggle}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
      <div className="waveform-container" ref={waveformRef}></div>
      <div className="controls">
        <div className="volume-control">
          <label>Volume</label>
          <Slider
            value={volume}
            onChange={handleVolumeChange}
            aria-labelledby="volume-slider"
            min={0}
            max={100}
          />
        </div>
        <div className="effects-control">
          <label>Reverb</label>
          <Slider
            value={effects.reverb}
            onChange={(e, value) => handleEffectChange('reverb', value as number)}
            aria-labelledby="reverb-slider"
            min={0}
            max={100}
          />
          <label>Echo</label>
          <Slider
            value={effects.echo}
            onChange={(e, value) => handleEffectChange('echo', value as number)}
            aria-labelledby="echo-slider"
            min={0}
            max={100}
          />
          <label>EQ</label>
          <Slider
            value={effects.eq}
            onChange={(e, value) => handleEffectChange('eq', value as number)}
            aria-labelledby="eq-slider"
            min={0}
            max={100}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioTrack;
