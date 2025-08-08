import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Loader2 } from 'lucide-react';

interface TranscriptCardProps {
    transcript?: string;
    isLoading?: boolean;
}

export default function TranscriptCard({ transcript, isLoading = false }: TranscriptCardProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex gap-2 items-center text-lg">
                    <FileText className="w-5 h-5" />
                    Current Transcript
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-sm text-muted-foreground">
                                Transcribing...
                            </span>
                        </div>
                    ) : transcript ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {transcript}
                        </p>
                    ) : (
                        <p className="py-8 text-sm italic text-center text-muted-foreground">
                            No transcript available. Start recording to generate a transcript.
                        </p>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
