export enum AudioContentTypes {
    HLS = 'application/vnd.apple.mpegurl',
    MP3 = 'audio/mp3',
    MP4 = 'audio/aac',
    WAV = 'audio/wav',
    WMA = 'audio/x-ms-wax',
}

export enum ImageContentTypes {
    GIF = 'image/gif',
    JPEG = 'image/jpeg',
    PNG = 'image/png',
}

export enum WebContentTypes {
    HTML = 'text/html',
    JSON = 'application/json',
    XML = 'application/xml',
}

export type ContentType = AudioContentTypes | ImageContentTypes | WebContentTypes;
export default ContentType;
