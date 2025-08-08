import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex justify-center items-center rounded-md aspect-square size-8 bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="text-white fill-current dark:text-black size-5" />
            </div>
            <div className="grid flex-1 ml-1 text-sm text-left">
                <span className="mb-0.5 font-semibold leading-tight truncate">Laravel Starter Kit</span>
            </div>
        </>
    );
}
