import { Stream } from 'stream';

export default (stream: Stream) => new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
});