import AppLogoIcon from '@/components/app-logo-icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="flex flex-col gap-6 justify-center items-center p-6 md:p-10 min-h-svh bg-muted">
            <div className="flex flex-col gap-6 w-full max-w-md">
                <Link href={route('home')} className="flex gap-2 items-center self-center font-medium">
                    <div className="flex justify-center items-center w-9 h-9">
                        <AppLogoIcon className="text-black fill-current dark:text-white size-9" />
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-xl">
                        <CardHeader className="px-10 pt-8 pb-0 text-center">
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="py-8 px-10">{children}</CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
