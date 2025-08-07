import AudioRecorder from '@/components/AudioRecorder';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Voice Vault - Voice Transcription" />
            <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
                <header className="border-b border-gray-200 dark:border-gray-800">
                    <div className="container mx-auto px-4 py-4">
                        <nav className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Voice Vault</h1>
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="inline-block rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                </header>

                <main className="flex flex-1 items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center">
                            <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Start Recording</h2>
                            <p className="text-gray-600 dark:text-gray-400">Click the button below to record your voice</p>
                        </div>

                        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
                            <AudioRecorder />
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
