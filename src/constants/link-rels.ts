export enum AudioRels {
    Download = 'download',
}

export enum ImageRels {
    Custom = 'custom',
    Enlargement = 'enlargement',
    Icon = 'icon',
    Logo = 'logo',
    LogoSquare = 'logo_square',
    Square = 'square',
    Standard = 'standard',
    Wide = 'wide',
}

export enum StationBrandRels {
    Facebook = 'facebook',
    HelloAudio = 'hello-id-audio',
    Homepage = 'homepage',
    Logo = 'logo',
    SmallLogo = 'small-logo',
    Twitter = 'twitter',
}

export enum WebRels {
    Embed = 'embed',
    Transcript = 'transcript',
}

export type LinkRel = AudioRels | ImageRels | StationBrandRels | WebRels;
export default LinkRel;
