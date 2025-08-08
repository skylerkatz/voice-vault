import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="overflow-hidden w-8 h-8 rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-black rounded-lg dark:text-white bg-neutral-200 dark:bg-neutral-700">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-medium truncate">{user.name}</span>
                {showEmail && <span className="text-xs truncate text-muted-foreground">{user.email}</span>}
            </div>
        </>
    );
}
