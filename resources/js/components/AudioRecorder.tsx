import AudioVisualizer from '@/components/AudioVisualizer';
import MicrophoneSelector from '@/components/MicrophoneSelector';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Recorder from 'recorder-js';

interface AudioRecorderProps {
    vault_id?: number;
    onRecordingComplete?: (blob: Blob) => void;
    onRecordingStart?: () => void;
    onRecordingStop?: () => void;
}

export default function AudioRecorder({ vault_id, onRecordingComplete, onRecordingStart, onRecordingStop }: AudioRecorderProps) {
    const [is_recording, set_is_recording] = useState(false);
    const [is_uploading, set_is_uploading] = useState(false);
    const [permission_granted, set_permission_granted] = useState(false);
    const [error_message, set_error_message] = useState<string | null>(null);
    const [selected_device_id, set_selected_device_id] = useState<string>(() => {
        return localStorage.getItem('voice-vault-microphone-id') || 'default';
    });
    const [selected_device_label, set_selected_device_label] = useState<string>(() => {
        return localStorage.getItem('voice-vault-microphone-label') || '';
    });
    const [analyser_ready, set_analyser_ready] = useState<boolean>(false);

    const recorder_ref = useRef<Recorder | null>(null);
    const stream_ref = useRef<MediaStream | null>(null);
    const audio_context_ref = useRef<AudioContext | null>(null);
    const analyser_ref = useRef<AnalyserNode | null>(null);

    const checkPermissions = async () => {
        try {
            const permission_status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            console.log('Permission status:', permission_status.state);

            if (permission_status.state === 'granted') {
                set_permission_granted(true);
                // Delay validation slightly to ensure device list is fully populated
                setTimeout(async () => {
                    console.log('About to validate device...');
                    const device_id = await validateSavedDevice();
                    console.log('Validated device ID:', device_id);
                    // Initialize audio stream to show which device is being used
                    if (device_id) {
                        console.log('Initializing stream with device:', device_id);
                        await initializeAudioStream(device_id);
                    } else {
                        console.log('No device ID returned from validation');
                    }
                }, 100);
            }
        } catch (e) {
            console.log('Permission query failed, using fallback:', e);
            // Fallback: try to enumerate devices to check permissions
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const microphones = devices.filter(device => device.kind === 'audioinput');

                // If we can see device labels, permissions are granted
                console.log('Microphones found:', microphones.length, 'Has labels:', microphones.some(device => device.label));
                if (microphones.some(device => device.label)) {
                    set_permission_granted(true);
                    // Delay validation slightly to ensure device list is fully populated
                    setTimeout(async () => {
                        console.log('About to validate device (fallback)...');
                        const device_id = await validateSavedDevice();
                        console.log('Validated device ID (fallback):', device_id);
                        // Initialize audio stream to show which device is being used
                        if (device_id) {
                            console.log('Initializing stream with device (fallback):', device_id);
                            await initializeAudioStream(device_id);
                        } else {
                            console.log('No device ID returned from validation (fallback)');
                        }
                    }, 100);
                }
            } catch {
                // Silent fallback
            }
        }
    };

    const initializeAudioStream = async (device_id?: string) => {
        const target_device_id = device_id || selected_device_id;
        console.log('initializeAudioStream: target_device_id:', target_device_id);
        if (!target_device_id) {
            console.log('initializeAudioStream: No device ID, aborting');
            return;
        }
        
        try {
            console.log('initializeAudioStream: Requesting permission for device:', target_device_id);
            const stream = await requestMicrophonePermission(target_device_id);
            console.log('initializeAudioStream: Stream result:', !!stream);
            console.log('initializeAudioStream: Analyser ready:', analyser_ready);
        } catch (e) {
            console.error('initializeAudioStream: Error:', e);
        }
    };

    const validateSavedDevice = async (): Promise<string | null> => {
        try {
            console.log('validateSavedDevice: Starting validation');
            const devices = await navigator.mediaDevices.enumerateDevices();
            const microphones = devices.filter(device => device.kind === 'audioinput');
            console.log('validateSavedDevice: Found microphones:', microphones);

            if (microphones.length > 0) {
                const saved_device_id = selected_device_id; // Use the ID from state (loaded from localStorage)
                console.log('validateSavedDevice: Saved device ID:', saved_device_id);
                
                let device_label = '';
                let final_device_id = saved_device_id;
                
                // Special handling for 'default' device
                if (saved_device_id === 'default') {
                    // Default is always available
                    console.log('validateSavedDevice: Using default device');
                    device_label = 'Default Microphone';
                    set_selected_device_label(device_label);
                    localStorage.setItem('voice-vault-microphone-label', device_label);
                    console.log('validateSavedDevice: Returning default');
                    return 'default';
                }
                
                // Check if saved device still exists (for non-default devices)
                const saved_device = microphones.find(device => device.deviceId === saved_device_id);
                
                // If we don't have proper device info (empty deviceIds), we need to get permission first
                if (microphones.every(device => !device.deviceId || device.deviceId === '')) {
                    console.log('validateSavedDevice: Device IDs are empty, need to request permission');
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        stream.getTracks().forEach(track => track.stop());
                        
                        // Re-enumerate devices after getting permission
                        const refreshed_devices = await navigator.mediaDevices.enumerateDevices();
                        const refreshed_mics = refreshed_devices.filter(device => device.kind === 'audioinput');
                        console.log('validateSavedDevice: Refreshed devices after permission:', refreshed_mics);
                        
                        // Try to find the saved device again
                        const found_device = refreshed_mics.find(device => device.deviceId === saved_device_id);
                        if (found_device) {
                            device_label = found_device.label || `Microphone ${saved_device_id.slice(0, 8)}`;
                            set_selected_device_label(device_label);
                            localStorage.setItem('voice-vault-microphone-label', device_label);
                            return saved_device_id;
                        } else {
                            // Device not found, use default
                            console.log('validateSavedDevice: Saved device not found after refresh, using default');
                            set_selected_device_id('default');
                            set_selected_device_label('Default Microphone');
                            localStorage.setItem('voice-vault-microphone-id', 'default');
                            localStorage.setItem('voice-vault-microphone-label', 'Default Microphone');
                            return 'default';
                        }
                    } catch (e) {
                        console.log('validateSavedDevice: Failed to get permission:', e);
                        // Use default on permission failure
                        set_selected_device_id('default');
                        set_selected_device_label('Default Microphone');
                        return 'default';
                    }
                }
                
                if (saved_device && saved_device.label) {
                    // Use saved device if it exists and has a label
                    device_label = saved_device.label;
                } else if (saved_device) {
                    // Device exists but no label (shouldn't happen with permissions granted)
                    device_label = `Microphone ${saved_device_id.slice(0, 8)}`;
                } else {
                    // Saved device not found
                    console.log('validateSavedDevice: Saved device not found in list');
                    console.log('validateSavedDevice: Has labels?', microphones.some(device => device.label));
                    
                    // If we don't have device labels, we need to request permission first
                    if (!microphones.some(device => device.label)) {
                        console.log('validateSavedDevice: No labels found, requesting permission to get full device info');
                        // Request permission to get device labels
                        try {
                            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                            stream.getTracks().forEach(track => track.stop());
                            
                            // Re-enumerate devices after getting permission
                            const refreshed_devices = await navigator.mediaDevices.enumerateDevices();
                            const refreshed_mics = refreshed_devices.filter(device => device.kind === 'audioinput');
                            console.log('validateSavedDevice: Refreshed devices:', refreshed_mics);
                            
                            // Now check again for the saved device
                            const found_device = refreshed_mics.find(device => device.deviceId === saved_device_id);
                            if (found_device) {
                                device_label = found_device.label || `Microphone ${saved_device_id.slice(0, 8)}`;
                                set_selected_device_label(device_label);
                                localStorage.setItem('voice-vault-microphone-label', device_label);
                                return saved_device_id;
                            }
                        } catch (e) {
                            console.log('validateSavedDevice: Failed to get permission:', e);
                        }
                    }
                    
                    // Fall back to default
                    console.log('validateSavedDevice: Falling back to default');
                    final_device_id = 'default';
                    set_selected_device_id('default');
                    device_label = 'Default Microphone';
                    localStorage.setItem('voice-vault-microphone-id', 'default');
                    localStorage.setItem('voice-vault-microphone-label', 'Default Microphone');
                }
                
                set_selected_device_label(device_label);
                localStorage.setItem('voice-vault-microphone-label', device_label);
                
                return final_device_id;
            }
        } catch {
            // Silent error handling
        }
        
        return null;
    };

    useEffect(() => {
        console.log('useEffect: Starting permission check');
        checkPermissions();

        return () => {
            if (stream_ref.current) {
                stream_ref.current.getTracks().forEach((track) => track.stop());
            }
            if (audio_context_ref.current) {
                audio_context_ref.current.close();
                set_analyser_ready(false);
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
                set_analyser_ready(false);
            }

            // Create AudioContext for visualization
            audio_context_ref.current = new AudioContext();
            const source = audio_context_ref.current.createMediaStreamSource(stream);
            analyser_ref.current = audio_context_ref.current.createAnalyser();
            analyser_ref.current.fftSize = 256;
            source.connect(analyser_ref.current);

            // Signal that the analyser is ready
            set_analyser_ready(true);

            // Initialize recorder with WAV export
            recorder_ref.current = new Recorder(audio_context_ref.current);
            recorder_ref.current.init(stream);

            return stream;
        } catch {
            set_error_message('Microphone permission denied. Please enable microphone access.');
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
        } catch {
            set_error_message('Failed to start recording');
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
        } catch {
            set_error_message('Failed to stop recording');
        }
    };

    const uploadRecording = async (blob: Blob) => {
        set_is_uploading(true);
        set_error_message(null);

        const form_data = new FormData();
        const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
        form_data.append('audio', file);
        
        if (vault_id) {
            form_data.append('vault_id', vault_id.toString());
        }

        router.post('/recordings', form_data, {
            preserveScroll: true,
            preserveState: false, // Allow vault data to refresh
            onSuccess: () => {
                set_is_uploading(false);
            },
            onError: () => {
                set_error_message('Failed to upload recording. Please try again.');
                set_is_uploading(false);
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

    const handle_permission_granted = async () => {
        console.log('handle_permission_granted: Permission was granted, re-checking...');
        set_permission_granted(true);
        
        // Re-check permissions and initialize stream
        setTimeout(async () => {
            const device_id = await validateSavedDevice();
            if (device_id) {
                console.log('handle_permission_granted: Initializing stream with device:', device_id);
                await initializeAudioStream(device_id);
            }
        }, 100);
    };

    const handle_device_change = async (device_id: string) => {
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
            } catch {
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
            <div className="w-full h-32">
                {analyser_ref.current && analyser_ready ? (
                    <AudioVisualizer analyser={analyser_ref.current} is_recording={is_recording} />
                ) : !permission_granted ? (
                    <div className="flex justify-center items-center h-full bg-gray-100 rounded-lg dark:bg-gray-800">
                        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                            Please grant microphone permission by clicking the settings icon →
                        </p>
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-full bg-gray-100 rounded-lg dark:bg-gray-800">
                        <p className="text-sm text-center text-gray-500 dark:text-gray-500">
                            Initializing microphone...
                        </p>
                    </div>
                )}
            </div>

            <div className="flex relative gap-2 items-center">
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
                        <div className="w-6 h-6 bg-white rounded-sm" />
                    ) : (
                        <div className="w-8 h-8 bg-white rounded-full" />
                    )}
                </Button>

                <MicrophoneSelector
                    selected_device_id={selected_device_id}
                    on_device_change={handle_device_change}
                    on_permission_granted={handle_permission_granted}
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

            {error_message && <div className="text-sm text-center text-red-500">{error_message}</div>}
        </div>
    );
}
