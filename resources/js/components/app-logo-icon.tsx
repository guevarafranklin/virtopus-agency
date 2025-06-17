import { ImgHTMLAttributes } from 'react';


export default function AppLogoIcon({
    className,
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="../../images/logo.png"
            alt="Virtopus Agency"
            className={className}
            {...props}
        />
    );
}
