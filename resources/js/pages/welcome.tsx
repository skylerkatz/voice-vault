import AudioRecorder from '@/components/AudioRecorder';
import TranscriptCard from '@/components/TranscriptCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { type Vault, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Mic, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WelcomePageProps extends SharedData {
    vaults?: Vault[];
    current_vault?: Vault | null;
}

export default function Welcome() {
    const { auth, vaults = [], current_vault } = usePage<WelcomePageProps>().props;
    const [active_vault, set_active_vault] = useState<Vault | null>(current_vault || null);
    const [new_vault_name, set_new_vault_name] = useState('');
    const [show_new_vault_form, set_show_new_vault_form] = useState(false);
    const [is_transcribing, set_is_transcribing] = useState(false);

    // Debug logging
    console.log('Welcome page debug:', {
        auth_user: !!auth.user,
        active_vault: !!active_vault,
        active_vault_id: active_vault?.id,
        full_transcript: active_vault?.full_transcript,
        vaults_count: vaults.length,
        current_vault: current_vault
    });

    useEffect(() => {
        // Auto-create or select session for authenticated users
        if (auth.user && vaults.length === 0 && !active_vault) {
            createNewVault('Vault 1');
        } else if (auth.user && vaults.length > 0 && !active_vault) {
            set_active_vault(vaults[0]);
        } else if (current_vault && (!active_vault || active_vault.id !== current_vault.id)) {
            // Update active vault if current_vault changes (e.g., after recording)
            set_active_vault(current_vault);
            // Reset transcribing state when we get new vault data
            set_is_transcribing(false);
        } else if (current_vault && active_vault && current_vault.id === active_vault.id) {
            // Update active vault with new data (including transcript)
            set_active_vault(current_vault);
            set_is_transcribing(false);
        }
    }, [auth.user, vaults, current_vault]);

    const createNewVault = (name: string) => {
        router.post('/vaults', { name }, {
            onSuccess: (page) => {
                const new_vault = (page.props as WelcomePageProps).current_vault;
                if (new_vault) {
                    set_active_vault(new_vault);
                }
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
        // Find the vault in the vaults array to get the full data including full_transcript
        const full_vault = vaults.find(v => v.id === vault.id);
        if (full_vault) {
            set_active_vault(full_vault);
        }
    };

    return (
        <>
            <Head title="Voice Vault - Voice Transcription" />
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="border-b border-gray-200 dark:border-gray-800">
                    <div className="container py-4 px-4 mx-auto">
                        <nav className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Voice Vault</h1>
                            <div className="flex gap-4 items-center">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-block py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="inline-block py-2 px-4 text-sm font-medium text-gray-700 rounded-md transition-colors dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="inline-block py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                </header>

                <main className="flex flex-1 justify-center items-start py-12 px-4">
                    <div className="w-full max-w-6xl">
                        <div className="mb-8 text-center">
                            <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Voice Vault</h2>
                            <p className="text-gray-600 dark:text-gray-400">Record your voice and get instant transcripts</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 w-full lg:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex gap-2 items-center text-lg">
                                        <Mic className="w-5 h-5" />
                                        Start Recording
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {auth.user && (
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
                                        {active_vault && (
                                            <div className="p-3 rounded-md bg-muted">
                                                <p className="font-medium">
                                                    {active_vault.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {active_vault.recording_count || 0} recordings
                                                </p>
                                            </div>
                                        )}

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
                                    )}

                                    <AudioRecorder
                                        vault_id={active_vault?.id}
                                        onRecordingComplete={() => set_is_transcribing(true)}
                                    />
                                </CardContent>
                            </Card>

                            {auth.user && (
                                    <TranscriptCard
                                        transcript={active_vault?.full_transcript}
                                        isLoading={is_transcribing}
                                    />
                            )}
                        </div>

                        {!auth.user && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <Link href={route('register')} className="text-blue-600 hover:underline">
                                        Create an account
                                    </Link>{' '}
                                    to save your recordings
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
