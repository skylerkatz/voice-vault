import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Mic } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

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
                                        href={route('vaults.index')}
                                        className="inline-block py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
                                    >
                                        My Vaults
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

                <main className="flex flex-1 justify-center items-center py-12 px-4">
                    <div className="w-full max-w-2xl">
                        <div className="mb-8 text-center">
                            <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Voice Vault</h2>
                            <p className="text-gray-600 dark:text-gray-400">Record your voice and get instant transcripts</p>
                        </div>

                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle className="flex gap-2 justify-center items-center text-xl">
                                    <Mic className="w-6 h-6" />
                                    Get Started with Voice Vault
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Voice Vault helps you record and transcribe your voice with ease. 
                                    Sign in or create an account to start recording and organizing your transcripts.
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <Link
                                        href={route('login')}
                                        className="inline-block py-2 px-6 text-sm font-medium text-gray-700 rounded-md border border-gray-300 transition-colors dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="inline-block py-2 px-6 text-sm font-medium text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
                                    >
                                        Create Account
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </>
    );
}
