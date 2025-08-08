import AppLayout from '@/layouts/app-layout';
import AudioRecorder from '@/components/AudioRecorder';
import TranscriptCard from '@/components/TranscriptCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Vault } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Mic, Plus, ArrowLeft, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VaultShowPageProps {
    current_vault: Vault;
    vaults: Vault[];
}

export default function VaultShow({ current_vault, vaults }: VaultShowPageProps) {
    const [active_vault, set_active_vault] = useState<Vault>(current_vault);
    const [new_vault_name, set_new_vault_name] = useState('');
    const [show_new_vault_form, set_show_new_vault_form] = useState(false);
    const [is_transcribing, set_is_transcribing] = useState(false);
    const [is_microphone_dialog_open, set_is_microphone_dialog_open] = useState(false);
    const [microphone_devices, set_microphone_devices] = useState<any[]>([]);
    const [is_loading_mics, set_is_loading_mics] = useState(false);
    const [selected_device_id, set_selected_device_id] = useState<string>(() => {
        return localStorage.getItem('voice-vault-microphone-id') || 'default';
    });

    useEffect(() => {
        if (current_vault && (!active_vault || active_vault.id !== current_vault.id)) {
            set_active_vault(current_vault);
            set_is_transcribing(false);
        } else if (current_vault && active_vault && current_vault.id === active_vault.id) {
            set_active_vault(current_vault);
            set_is_transcribing(false);
        }
    }, [current_vault]);

    const createNewVault = (name: string) => {
        router.post('/vaults', { name }, {
            onSuccess: () => {
                set_new_vault_name('');
                set_show_new_vault_form(false);
            },
        });
    };

    const handleCreateVault = (e: React.FormEvent) => {
        e.preventDefault();
        if (new_vault_name.trim()) {
            createNewVault(new_vault_name.trim());
        }
    };

    const switchVault = (vault: Vault) => {
        router.get(route('vaults.show', vault.id));
    };

    const getMicrophones = async () => {
        set_is_loading_mics(true);
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const microphones = devices.filter((device) => device.kind === 'audioinput');

            if (microphones.length > 0 && !microphones.some(device => device.label)) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach(track => track.stop());

                    const updated_devices = await navigator.mediaDevices.enumerateDevices();
                    const microphone_devices = updated_devices
                        .filter((device) => device.kind === 'audioinput')
                        .map((device) => ({
                            device_id: device.deviceId,
                            group_id: device.groupId,
                            kind: device.kind,
                            label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
                        }));

                    const updated_microphones = [
                        {
                            device_id: 'default',
                            group_id: '',
                            kind: 'audioinput',
                            label: 'Default Microphone',
                        },
                        ...microphone_devices
                    ];
                    set_microphone_devices(updated_microphones);
                } catch (permission_error) {
                    console.error('Permission denied:', permission_error);
                    set_microphone_devices([]);
                }
            } else {
                const microphone_devices = microphones.map((device) => ({
                    device_id: device.deviceId,
                    group_id: device.groupId,
                    kind: device.kind,
                    label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
                }));

                const mapped_microphones = [
                    {
                        device_id: 'default',
                        group_id: '',
                        kind: 'audioinput',
                        label: 'Default Microphone',
                    },
                    ...microphone_devices
                ];
                set_microphone_devices(mapped_microphones);
            }
        } catch (error) {
            console.error('Error getting microphones:', error);
            set_microphone_devices([]);
        } finally {
            set_is_loading_mics(false);
        }
    };

    const handleMicrophoneSelect = (device_id: string) => {
        set_selected_device_id(device_id);
        localStorage.setItem('voice-vault-microphone-id', device_id);

        let device_label = '';
        if (device_id === 'default') {
            device_label = 'Default Microphone';
        } else {
            const selected_device = microphone_devices.find(device => device.device_id === device_id);
            device_label = selected_device?.label || 'Unknown Device';
        }
        localStorage.setItem('voice-vault-microphone-label', device_label);

        set_is_microphone_dialog_open(false);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'My Vaults', href: '/vaults' },
                { title: active_vault.name, href: `/vaults/${active_vault.id}` }
            ]}
        >
            <Head title={`${active_vault.name} - Voice Vault`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                            {active_vault.name}
                        </h2>
                        <Link
                            href={route('vaults.index')}
                            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            <ArrowLeft className="mr-2 w-4 h-4" />
                            Back to Vaults
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex justify-between items-center text-lg">
                                    <div className="flex gap-2 items-center">
                                        <Mic className="w-5 h-5" />
                                        Start Recording
                                    </div>
                                    <Dialog open={is_microphone_dialog_open} onOpenChange={(open) => {
                                        set_is_microphone_dialog_open(open);
                                        if (open) getMicrophones();
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="w-8 h-8"
                                                title="Select microphone"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Select Microphone</DialogTitle>
                                                <DialogDescription>Choose which microphone to use for recording.</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                {is_loading_mics ? (
                                                    <div className="text-sm text-center text-gray-500">Loading microphones...</div>
                                                ) : microphone_devices.length === 0 ? (
                                                    <div className="text-sm text-center text-gray-500">No microphones found</div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {microphone_devices.map((device) => (
                                                            <div key={device.device_id} className="flex items-center space-x-2">
                                                                <input
                                                                    type="radio"
                                                                    id={device.device_id}
                                                                    name="microphone"
                                                                    value={device.device_id}
                                                                    checked={selected_device_id === device.device_id}
                                                                    onChange={() => handleMicrophoneSelect(device.device_id)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <Label htmlFor={device.device_id} className="flex-1 text-sm cursor-pointer">
                                                                    {device.label}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-full">
                                <AudioRecorder
                                    vault_id={active_vault.id}
                                    selected_device_id={selected_device_id}
                                    onRecordingComplete={() => set_is_transcribing(true)}
                                />
                            </CardContent>
                        </Card>

                        <TranscriptCard
                            transcript={active_vault.full_transcript}
                            isLoading={is_transcribing}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
