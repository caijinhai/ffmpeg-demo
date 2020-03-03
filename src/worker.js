
import * as Comlink from 'comlink';
const ffmpegjs = require('ffmpeg.js')
Comlink.expose(ffmpegjs, self);