import AudioRecorder from '@/components/AudioRecorder';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

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

                <main className="flex flex-1 justify-center items-center py-12 px-4">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center">
                            <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Start Recording</h2>
                            <p className="text-gray-600 dark:text-gray-400">Click the button below to record your voice</p>
                        </div>

                        <div className="p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
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
