import AppLayout from '@/layouts/app-layout';
import AudioRecorder from '@/components/AudioRecorder';
import TranscriptCard from '@/components/TranscriptCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { type Vault } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Mic, Plus, ArrowLeft } from 'lucide-react';
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
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <ArrowLeft className="mr-2 w-4 h-4" />
                            Back to Vaults
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex gap-2 items-center text-lg">
                                    <Mic className="w-5 h-5" />
                                    Start Recording
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-base font-medium">
                                            Current Vault
                                        </h4>
                                        <Button
                                            onClick={() => set_show_new_vault_form(!show_new_vault_form)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Plus className="mr-2 w-4 h-4" />
                                            New Vault
                                        </Button>
                                    </div>
                                    
                                    <div className="p-3 rounded-md bg-muted">
                                        <p className="font-medium">
                                            {active_vault.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {active_vault.recording_count || 0} recordings
                                        </p>
                                    </div>

                                    {show_new_vault_form && (
                                        <form onSubmit={handleCreateVault} className="flex gap-2">
                                            <Input
                                                type="text"
                                                placeholder="Vault name"
                                                value={new_vault_name}
                                                onChange={(e) => set_new_vault_name(e.target.value)}
                                                required
                                            />
                                            <Button type="submit" size="sm">
                                                Create
                                            </Button>
                                        </form>
                                    )}

                                    {vaults.length > 1 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Switch Vault:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {vaults.map((vault) => (
                                                    <button
                                                        key={vault.id}
                                                        onClick={() => switchVault(vault)}
                                                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                                            active_vault?.id === vault.id
                                                                ? 'bg-primary/10 text-primary'
                                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                        }`}
                                                    >
                                                        {vault.name} ({vault.recording_count || 0})
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <AudioRecorder
                                    vault_id={active_vault.id}
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