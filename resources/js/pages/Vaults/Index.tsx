import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { type Vault } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Trash2, Mic } from 'lucide-react';
import { useState } from 'react';

interface VaultsIndexPageProps {
    vaults: Vault[];
}

export default function VaultsIndex({ vaults }: VaultsIndexPageProps) {
    const [show_new_vault_form, set_show_new_vault_form] = useState(false);
    const [new_vault_name, set_new_vault_name] = useState('');
    const [delete_vault, set_delete_vault] = useState<Vault | null>(null);

    const handleCreateVault = (e: React.FormEvent) => {
        e.preventDefault();
        if (new_vault_name.trim()) {
            router.post('/vaults', { name: new_vault_name.trim() }, {
                onSuccess: () => {
                    set_new_vault_name('');
                    set_show_new_vault_form(false);
                },
            });
        }
    };

    const handleDeleteVault = () => {
        if (delete_vault) {
            router.delete(`/vaults/${delete_vault.id}`, {
                onSuccess: () => {
                    set_delete_vault(null);
                },
            });
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'My Vaults', href: '/vaults' }
            ]}
        >
            <Head title="Vaults" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                            My Vaults
                        </h2>
                        {!show_new_vault_form && (
                            <Button
                                onClick={() => set_show_new_vault_form(true)}
                                size="sm"
                            >
                                <Plus className="mr-2 w-4 h-4" />
                                New Vault
                            </Button>
                        )}
                    </div>
                    {show_new_vault_form && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Vault</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateVault} className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Vault name"
                                        value={new_vault_name}
                                        onChange={(e) => set_new_vault_name(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <Button type="submit">Create</Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            set_show_new_vault_form(false);
                                            set_new_vault_name('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {vaults.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Mic className="w-12 h-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No vaults yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    Create your first vault to start recording
                                </p>
                                <Button onClick={() => set_show_new_vault_form(true)}>
                                    <Plus className="mr-2 w-4 h-4" />
                                    Create Vault
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {vaults.map((vault) => (
                                <Card key={vault.id} className="relative">
                                    <Link
                                        href={route('vaults.show', vault.id)}
                                        className="block"
                                    >
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg">
                                                {vault.name}
                                            </CardTitle>
                                            <CardDescription>
                                                {vault.recording_count || 0} recordings
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                Created {new Date(vault.created_at).toLocaleDateString()}
                                            </p>
                                        </CardContent>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            set_delete_vault(vault);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AlertDialog open={!!delete_vault} onOpenChange={() => set_delete_vault(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Vault</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{delete_vault?.name}"? This will permanently delete 
                            the vault and all {delete_vault?.recording_count || 0} recordings. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteVault}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}