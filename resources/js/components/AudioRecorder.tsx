import AudioVisualizer from '@/components/AudioVisualizer';
import MicrophoneSelector from '@/components/MicrophoneSelector';
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
    const [selected_device_id, set_selected_device_id] = useState<string>(() => {
        const saved_id = localStorage.getItem('voice-vault-microphone-id') || 'default';
        console.log('Loading device ID from localStorage:', saved_id);
        return saved_id;
    });
    const [selected_device_label, set_selected_device_label] = useState<string>(() => {
        return localStorage.getItem('voice-vault-microphone-label') || '';
    });

    const recorder_ref = useRef<Recorder | null>(null);
    const stream_ref = useRef<MediaStream | null>(null);
    const audio_context_ref = useRef<AudioContext | null>(null);
    const analyser_ref = useRef<AnalyserNode | null>(null);

    const checkPermissions = async () => {
        try {
            const permission_status = await navigator.permissions.query({ name: 'microphone' as PermissionName });

            if (permission_status.state === 'granted') {
                set_permission_granted(true);
                // Delay validation slightly to ensure device list is fully populated
                setTimeout(() => validateSavedDevice(), 100);
            }
        } catch {
            // Fallback: try to enumerate devices to check permissions
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const microphones = devices.filter(device => device.kind === 'audioinput');

                // If we can see device labels, permissions are granted
                if (microphones.some(device => device.label)) {
                    set_permission_granted(true);
                    // Delay validation slightly to ensure device list is fully populated
                    setTimeout(() => validateSavedDevice(), 100);
                }
            } catch (err) {
                console.log('Cannot check permissions:', err);
            }
        }
    };

    const validateSavedDevice = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const microphones = devices.filter(device => device.kind === 'audioinput');

            if (microphones.length > 0) {
                const saved_device_id = selected_device_id; // Use the ID from state (loaded from localStorage)
                console.log('Validating saved device ID:', saved_device_id);
                
                // Check if saved device still exists
                const saved_device = microphones.find(device => device.deviceId === saved_device_id);
                console.log('Found saved device:', saved_device);
                
                let device_label = '';
                
                if (saved_device_id === 'default') {
                    // Default is always available
                    device_label = 'Default Microphone';
                } else if (saved_device && saved_device.label) {
                    // Use saved device if it exists and has a label
                    device_label = saved_device.label;
                } else if (saved_device) {
                    // Device exists but no label (shouldn't happen with permissions granted)
                    device_label = `Microphone ${saved_device_id.slice(0, 8)}`;
                } else {
                    // Saved device not found - this might be temporary if permissions aren't fully loaded
                    // Only fall back to default if we're sure the device list is complete
                    console.log('Saved device not found, available devices:', microphones.map(d => ({id: d.deviceId, label: d.label})));
                    
                    // If we have labeled devices, it means permissions are granted and device list is complete
                    if (microphones.some(device => device.label)) {
                        console.log('Device list appears complete, falling back to default');
                        set_selected_device_id('default');
                        device_label = 'Default Microphone';
                        localStorage.setItem('voice-vault-microphone-id', 'default');
                        localStorage.setItem('voice-vault-microphone-label', 'Default Microphone');
                    } else {
                        // Permissions might not be fully granted yet, keep the saved ID but use a placeholder label
                        console.log('Device list incomplete, keeping saved ID but using placeholder label');
                        device_label = 'Loading...';
                        return; // Don't update localStorage yet
                    }
                }
                
                set_selected_device_label(device_label);
                // Only update localStorage if we're not falling back to default
                if (saved_device || saved_device_id === 'default') {
                    localStorage.setItem('voice-vault-microphone-label', device_label);
                }
            }
        } catch (error) {
            console.error('Error validating saved device:', error);
        }
    };

    useEffect(() => {
        checkPermissions();

        return () => {
            if (stream_ref.current) {
                stream_ref.current.getTracks().forEach((track) => track.stop());
            }
            if (audio_context_ref.current) {
                audio_context_ref.current.close();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const requestMicrophonePermission = async (device_id?: string) => {
        try {
            const constraints: MediaStreamConstraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                    ...(device_id && device_id !== 'default' && { deviceId: { exact: device_id } }),
                },
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            // Stop existing stream if any
            if (stream_ref.current) {
                stream_ref.current.getTracks().forEach((track) => track.stop());
            }

            stream_ref.current = stream;
            set_permission_granted(true);
            set_error_message(null);

            // Close existing audio context if any
            if (audio_context_ref.current) {
                audio_context_ref.current.close();
            }

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
            stream = await requestMicrophonePermission(selected_device_id);
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

    const handle_device_change = async (device_id: string) => {
        console.log('Saving device ID to localStorage:', device_id);
        set_selected_device_id(device_id);

        // Save selection to localStorage
        localStorage.setItem('voice-vault-microphone-id', device_id);

        // Update device label
        let device_label = '';
        if (device_id === 'default') {
            device_label = 'Default Microphone';
        } else {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const selected_device = devices.find(device => device.deviceId === device_id);
                device_label = selected_device?.label || 'Unknown Device';
            } catch (error) {
                console.error('Error getting device label:', error);
                device_label = 'Unknown Device';
            }
        }

        set_selected_device_label(device_label);
        localStorage.setItem('voice-vault-microphone-label', device_label);

        // If we already have permission and we're not currently recording,
        // reinitialize with the new device
        if (permission_granted && !is_recording) {
            await requestMicrophonePermission(device_id);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-6">
            <div className="h-32 w-full">
                {(is_recording || permission_granted) && analyser_ref.current && (
                    <AudioVisualizer analyser={analyser_ref.current} is_recording={is_recording} />
                )}
            </div>

            <div className="relative flex items-center gap-2">
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

                <MicrophoneSelector
                    selected_device_id={selected_device_id}
                    on_device_change={handle_device_change}
                    disabled={is_recording || is_uploading}
                />
            </div>

            <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {is_uploading ? 'Uploading...' : is_recording ? 'Recording... Click to stop' : 'Click to start recording'}
                </p>
                {selected_device_label && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        Microphone: {selected_device_label}
                    </p>
                )}
            </div>

            {error_message && <div className="text-center text-sm text-red-500">{error_message}</div>}
        </div>
    );
}
