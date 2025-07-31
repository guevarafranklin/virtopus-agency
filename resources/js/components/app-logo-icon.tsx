import { ImgHTMLAttributes } from 'react';


export default function AppLogoIcon({
    className,
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/assets/v-logo.png"
            alt="Virtopus Agency"
            className={className}
            {...props}
        />
    );
}
