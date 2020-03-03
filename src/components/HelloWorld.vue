<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
  </div>
</template>

<script>

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  created () {
    var stdout = "";
    var stderr = "";
    const worker = new Worker('ffmpeg-worker-webm.js')
    worker.onmessage = function(e) {
      var msg = e.data;
      switch (msg.type) {
      case "ready":
        console.log("ready")
        // worker.postMessage({type: "run", arguments: ["-version"]});
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
