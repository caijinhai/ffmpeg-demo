const ffmpeg = require('ffmpeg.js') // default ffmpeg-webm 视频帧截图功能
// const ffmpeg = require('ffmpeg.js/ffmpeg-mp4') // 获取video音频功能

var stdout = "";
var stderr = "";
// Print FFmpeg's version.
ffmpeg({
  arguments: ["-version"],
  print: function(data) { stdout += data + "\n"; },
  printErr: function(data) { stderr += data + "\n"; },
  onExit: function(code) {
    console.log("Process exited with code " + code);
    console.log(stdout);
    console.log(stderr);
  },
});