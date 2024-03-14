export function getMediaType(url) {
    const imagePattern = /\.(jpeg|jpg|gif|png|tiff|bmp|webp|avif|svg|heif|heic|ico|raw|psd|ai|eps|jfif)$/i;
    const videoPattern = /\.(mp4|avi|mov|flv|wmv|mkv|m4v|webm|mpg|mpeg|vob|ogv|3gp|3g2|asf|rm|rmvb|ts)$/i;

    if (imagePattern.test(url)) {
        return 'image';
        // eslint-disable-next-line no-else-return
    } else if (videoPattern.test(url)) {
        return 'video';
    } else {
        return `seems like not media: ${url}`;
    }
}
