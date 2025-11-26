declare module 'lucide-react' {
    import { FC, SVGProps } from 'react';

    export interface LucideProps extends Partial<Omit<SVGProps<SVGSVGElement>, 'ref'>> {
        size?: string | number;
        absoluteStrokeWidth?: boolean;
        strokeWidth?: string | number;
    }

    export type LucideIcon = FC<LucideProps>;

    export const Mail: LucideIcon;
    export const Phone: LucideIcon;
    export const Linkedin: LucideIcon;
    export const MapPin: LucideIcon;
    export const Globe: LucideIcon;
    export const Github: LucideIcon;
    export const Briefcase: LucideIcon;
    export const GraduationCap: LucideIcon;
    export const Star: LucideIcon;
    export const Award: LucideIcon;
    export const User: LucideIcon;
    export const Loader: LucideIcon;
    export const Sparkles: LucideIcon;
    export const ArrowLeft: LucideIcon;
    export const ArrowRight: LucideIcon;
    export const Upload: LucideIcon;
    export const XCircle: LucideIcon;
    export const Download: LucideIcon;
    export const Heart: LucideIcon;
    export const MessageCircle: LucideIcon;
    export const Share2: LucideIcon;
    export const Edit: LucideIcon;
    export const Trash2: LucideIcon;
    export const Facebook: LucideIcon;
    export const Instagram: LucideIcon;
    export const Camera: LucideIcon;
    export const Copy: LucideIcon;
    export const Clipboard: LucideIcon;
}
