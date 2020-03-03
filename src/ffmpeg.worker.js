var stdout = "";
var stderr = "";
const worker = new Worker('lib/ffmpeg/ffmpeg-worker-webm.js'); // js文件一定要网页可读，不能引用node_modules
worker.onmessage = function(e) {
  var msg = e.data;
  console.log(msg)
  switch (msg.type) {
    case "ready":
      console.log("ready")
      worker.postMessage({type: "run", arguments: ["-version"]});
      break;
    case "stdout":
      stdout += msg.data + "\n";
      break;
    case "stderr":
      stderr += msg.data + "\n";
      break;
    case "exit":
      console.log("Process exited with code " + msg.data);
      console.log(stdout);
      console.log(stderr)
      worker.terminate();
      break;
  }
};

worker.onerror = (e) => {
  console.log(e)
}
console.log(worker);