import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Loader2 } from 'lucide-react';

interface TranscriptCardProps {
    transcript?: string;
    isLoading?: boolean;
}

export default function TranscriptCard({ transcript, isLoading = false }: TranscriptCardProps) {
    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex gap-2 items-center text-lg">
                    <FileText className="w-5 h-5" />
                    Current Transcript
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-48">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                Transcribing...
                            </span>
                        </div>
                    ) : transcript ? (
                        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap dark:text-gray-300">
                            {transcript}
                        </p>
                    ) : (
                        <p className="py-8 text-sm italic text-center text-gray-500 dark:text-gray-400">
                            No transcript available. Start recording to generate a transcript.
                        </p>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}