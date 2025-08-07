import AudioVisualizer from '@/components/AudioVisualizer';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Recorder from 'recorder-js';

interface AudioRecorderProps {
    onRecordingComplete?: (blob: Blob) => void;
    onRecordingStart?: () => void;
    onRecordingStop?: () => void;
}

export default function AudioRecorder({ onRecordingComplete, onRecordingStart, onRecordingStop }: AudioRecorderProps) {
    const [is_recording, set_is_recording] = useState(false);
    const [is_uploading, set_is_uploading] = useState(false);
    const [permission_granted, set_permission_granted] = useState(false);
    const [error_message, set_error_message] = useState<string | null>(null);

    const recorder_ref = useRef<Recorder | null>(null);
    const stream_ref = useRef<MediaStream | null>(null);
    const audio_context_ref = useRef<AudioContext | null>(null);
    const analyser_ref = useRef<AnalyserNode | null>(null);

    useEffect(() => {
        return () => {
            if (stream_ref.current) {
                stream_ref.current.getTracks().forEach((track) => track.stop());
            }
            if (audio_context_ref.current) {
                audio_context_ref.current.close();
            }
        };
    }, []);

    const requestMicrophonePermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                },
            });
            stream_ref.current = stream;
            set_permission_granted(true);
            set_error_message(null);

            // Create AudioContext for visualization
            audio_context_ref.current = new AudioContext();
            const source = audio_context_ref.current.createMediaStreamSource(stream);
            analyser_ref.current = audio_context_ref.current.createAnalyser();
            analyser_ref.current.fftSize = 256;
            source.connect(analyser_ref.current);

            // Initialize recorder with WAV export
            recorder_ref.current = new Recorder(audio_context_ref.current);
            recorder_ref.current.init(stream);

            return stream;
        } catch (err) {
            set_error_message('Microphone permission denied. Please enable microphone access.');
            console.error('Error accessing microphone:', err);
            return null;
        }
    };

    const startRecording = async () => {
        let stream = stream_ref.current;

        if (!stream) {
            stream = await requestMicrophonePermission();
            if (!stream) return;
        }

        if (!recorder_ref.current) {
            set_error_message('Recorder not initialized');
            return;
        }

        try {
            recorder_ref.current.start();
            set_is_recording(true);

            if (onRecordingStart) {
                onRecordingStart();
            }
        } catch (err) {
            set_error_message('Failed to start recording');
            console.error('Recording start error:', err);
        }
    };

    const stopRecording = async () => {
        if (!recorder_ref.current || !is_recording) return;

        try {
            const { blob } = await recorder_ref.current.stop();
            set_is_recording(false);

            if (onRecordingStop) {
                onRecordingStop();
            }

            if (onRecordingComplete) {
                onRecordingComplete(blob);
            }

            await uploadRecording(blob);
        } catch (err) {
            set_error_message('Failed to stop recording');
            console.error('Recording stop error:', err);
        }
    };

    const uploadRecording = async (blob: Blob) => {
        set_is_uploading(true);
        set_error_message(null);

        const form_data = new FormData();
        const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
        form_data.append('audio', file);

        router.post('/recordings', form_data, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                set_is_uploading(false);
            },
            onError: (errors) => {
                set_error_message('Failed to upload recording. Please try again.');
                set_is_uploading(false);
                console.error('Upload errors:', errors);
            },
        });
    };

    const toggleRecording = () => {
        if (is_recording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="flex flex-col items-center space-y-6">
            <div className="h-32 w-full">
                {(is_recording || permission_granted) && analyser_ref.current && (
                    <AudioVisualizer analyser={analyser_ref.current} is_recording={is_recording} />
                )}
            </div>

            <Button
                onClick={toggleRecording}
                disabled={is_uploading}
                size="lg"
                className={`relative h-20 w-20 rounded-full transition-all duration-200 ${
                    is_recording ? 'animate-pulse bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'
                }`}
            >
                {is_uploading ? (
                    <span className="text-white">...</span>
                ) : is_recording ? (
                    <div className="h-6 w-6 rounded-sm bg-white" />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-white" />
                )}
            </Button>

            <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {is_uploading ? 'Uploading...' : is_recording ? 'Recording... Click to stop' : 'Click to start recording'}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">WAV format, highest quality</p>
            </div>

            {error_message && <div className="text-center text-sm text-red-500">{error_message}</div>}
        </div>
    );
}
