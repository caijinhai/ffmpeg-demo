import * as Comlink from 'comlink'

let worker = new Worker('./worker.js');

export async function init() {
  let ffmpegjs = await Comlink.proxy(worker);
  let stderr = '';
  let stdout = '';

  let result = await ffmpegjs({
    arguments: ["-version"],
    print: Comlink.proxy((data) => {
      stdout += data + "\n";
    }),
    printErr: Comlink.proxy((data) => {
      stderr += data + "\n";
    }),
    onExit: Comlink.proxy((code) => {
      console.log("Process exited with code " + code);
      console.log(stdout);
      console.log(stderr);
    })
  })
  console.log(result);
}