import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

interface Recording {
    id: number;
    file_name: string;
    file_size: number;
    duration?: number;
    mime_type: string;
    transcription?: string;
    created_at: string;
    updated_at: string;
}

interface PaginatedRecordings {
    data: Recording[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url?: string;
    next_page_url?: string;
}

interface RecordingsIndexProps {
    recordings: PaginatedRecordings;
}

export default function RecordingsIndex({ recordings }: RecordingsIndexProps) {
    const formatFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString();
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remaining_seconds = seconds % 60;
        return `${minutes}:${remaining_seconds.toString().padStart(2, '0')}`;
    };

    const handleDelete = (recording_id: number) => {
        if (confirm('Are you sure you want to delete this recording?')) {
            router.delete(`/recordings/${recording_id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout>
            <Head title="My Recordings" />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Recordings</h1>
                    <Link href="/">
                        <Button>New Recording</Button>
                    </Link>
                </div>

                {recordings.data.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="mb-4 text-gray-500 dark:text-gray-400">You haven't made any recordings yet.</p>
                        <Link href="/">
                            <Button>Make Your First Recording</Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {recordings.data.map((recording) => (
                            <Card key={recording.id} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{recording.file_name}</h3>
                                        <div className="mt-1 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                            <p>Size: {formatFileSize(recording.file_size)}</p>
                                            <p>Duration: {formatDuration(recording.duration)}</p>
                                            <p>Format: {recording.mime_type}</p>
                                            <p>Recorded: {formatDate(recording.created_at)}</p>
                                        </div>
                                        {recording.transcription && (
                                            <div className="mt-3 rounded bg-gray-50 p-3 dark:bg-gray-800">
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{recording.transcription}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(recording.id)}>
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {recordings.last_page > 1 && (
                    <div className="mt-6 flex justify-center space-x-2">
                        {recordings.prev_page_url && (
                            <Button variant="outline" onClick={() => router.visit(recordings.prev_page_url!)}>
                                Previous
                            </Button>
                        )}
                        <span className="flex items-center px-4 text-gray-600 dark:text-gray-400">
                            Page {recordings.current_page} of {recordings.last_page}
                        </span>
                        {recordings.next_page_url && (
                            <Button variant="outline" onClick={() => router.visit(recordings.next_page_url!)}>
                                Next
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
