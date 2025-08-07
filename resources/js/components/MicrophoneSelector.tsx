import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MediaDeviceInfo {
    device_id: string;
    group_id: string;
    kind: string;
    label: string;
}

interface MicrophoneSelectorProps {
    selected_device_id?: string;
    on_device_change: (device_id: string) => void;
    on_permission_granted?: () => void;
    disabled?: boolean;
}

export default function MicrophoneSelector({ selected_device_id, on_device_change, on_permission_granted, disabled }: MicrophoneSelectorProps) {
    const [devices, set_devices] = useState<MediaDeviceInfo[]>([]);
    const [is_open, set_is_open] = useState(false);
    const [is_loading, set_is_loading] = useState(false);

    const get_microphones = async () => {
        set_is_loading(true);
        try {
            // First check if we need to request permission
            const devices = await navigator.mediaDevices.enumerateDevices();
            const microphones = devices.filter((device) => device.kind === 'audioinput');
            
            // If no labels are visible, we need permission
            if (microphones.length > 0 && !microphones.some(device => device.label)) {
                try {
                    // Request permission by asking for user media
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach(track => track.stop()); // Stop immediately
                    
                    // Notify parent that permission was granted
                    if (on_permission_granted) {
                        on_permission_granted();
                    }
                    
                    // Re-enumerate devices after permission
                    const updated_devices = await navigator.mediaDevices.enumerateDevices();
                    const microphone_devices = updated_devices
                        .filter((device) => device.kind === 'audioinput')
                        .map((device) => ({
                            device_id: device.deviceId,
                            group_id: device.groupId,
                            kind: device.kind,
                            label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
                        }));
                    
                    // Add default option at the beginning
                    const updated_microphones = [
                        {
                            device_id: 'default',
                            group_id: '',
                            kind: 'audioinput',
                            label: 'Default Microphone',
                        },
                        ...microphone_devices
                    ];
                    set_devices(updated_microphones);
                } catch (permission_error) {
                    console.error('Permission denied:', permission_error);
                    set_devices([]);
                }
            } else {
                const microphone_devices = microphones.map((device) => ({
                    device_id: device.deviceId,
                    group_id: device.groupId,
                    kind: device.kind,
                    label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
                }));
                
                // Add default option at the beginning
                const mapped_microphones = [
                    {
                        device_id: 'default',
                        group_id: '',
                        kind: 'audioinput',
                        label: 'Default Microphone',
                    },
                    ...microphone_devices
                ];
                set_devices(mapped_microphones);
            }
        } catch (error) {
            console.error('Error getting microphones:', error);
            set_devices([]);
        } finally {
            set_is_loading(false);
        }
    };

    useEffect(() => {
        if (is_open) {
            get_microphones();
        }
    }, [is_open]);

    const handle_device_select = (device_id: string) => {
        on_device_change(device_id);
        set_is_open(false);
    };

    return (
        <Dialog open={is_open} onOpenChange={set_is_open}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={disabled}
                    title="Select microphone"
                >
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Microphone</DialogTitle>
                    <DialogDescription>Choose which microphone to use for recording.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {is_loading ? (
                        <div className="text-center text-sm text-gray-500">Loading microphones...</div>
                    ) : devices.length === 0 ? (
                        <div className="text-center text-sm text-gray-500">No microphones found</div>
                    ) : (
                        <div className="space-y-2">
                            {devices.map((device) => (
                                <div key={device.device_id} className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id={device.device_id}
                                        name="microphone"
                                        value={device.device_id}
                                        checked={selected_device_id === device.device_id}
                                        onChange={() => handle_device_select(device.device_id)}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor={device.device_id} className="flex-1 cursor-pointer text-sm">
                                        {device.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}