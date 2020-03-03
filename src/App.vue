<template>
  <div id="app">
    <div>
      <Row type="flex" justify="center" align="middle" :style="{ height: '40px', lineHeight: '40px' }">
        <h3 :style="{ margin: '0 10px' }">视频抽帧图片测试</h3>
        <Upload
          :style="{ height: '40px', margin: '0 10px' }"
          :before-upload="handleUpload"
          action="//jsonplaceholder.typicode.com/posts/">
            <Button icon="ios-cloud-upload-outline">Upload files</Button>
        </Upload>
        <Button v-if="file !== null" @click="ffmpegImage">视频抽帧</Button>
        <Button v-if="file !== null" @click="initFFmpeg2">视频截取</Button>
        <Button v-if="file !== null" @click="ffmpegMp3">提取mp3</Button>
      </Row>
      <div v-if="pictures.length > 0">
        <Row type="flex" justify="start" align="top">
          <i-col span="4" v-for="(picture, index) in pictures" :key="index">
            <Card>
              <div style="text-align:center">
                <img :src="picture.url" height="120px">
                <h3>{{ picture.name }}</h3>
              </div>
            </Card>
          </i-col>
        </Row>
      </div>
      <div v-if="video !== null">
        <h3>{{ video.name }}</h3>
        <video controls :src="video.url"></video>
      </div>
      <div v-if="mp3 !== null">
        <h3>{{ mp3.name }}</h3>
        <audio controls :src="mp3.url"></audio>
      </div>
    </div>
  </div>
</template>

<script>
const { createWorker } = require('@ffmpeg/ffmpeg');

export default {
  name: 'app',
  data () {
    return {
      file: null,
      webmWorker: null,
      mp4Worker: null,
      pictures: [],
      video: null,
      mp3: null
    }
  },
  components: {
  },
  mounted () {
  },
  created () {
    this.initWebmWorker()
    this.initMp4Worker()
  },
  beforeDestroy () {
    this.mp4Worker = null
    this.webmWorker = null
  },
  methods: {
    handleUpload (file) {
      this.file = file
      return false
    },
    generatePictures (arrData) {
      arrData.forEach((item) => {
        let blob = new Blob([item.data], { type: 'image/jpeg' })
        this.pictures.push({
          name: item.name,
          url: window.URL.createObjectURL(blob),
        })
      })
    },
    async ffmpegImage () {
      // -i inputfile.avi -r 1 -f image2 image-%05d.jpeg
      let data = await new Response(this.file).arrayBuffer()
      var stdout = "";
      var stderr = "";
      this.webmWorker.onmessage = (e) => {
        var msg = e.data;
        switch (msg.type) {
          case "stdout":
            stdout += msg.data + "\n";
            break;
          case "stderr":
            stderr += msg.data + "\n";
            break;
          case "exit":
            console.log("Process exited with code " + msg.data);
            console.log(stdout);
            console.log(stderr);
            break;
          case "done":
            this.generatePictures(msg.data.MEMFS)
            break;
        }
      }
      this.webmWorker.postMessage({
        type: "run",
        arguments: ['-i', this.file.name, '-r', '1', '-f', 'image2', 'image-%5d.jpeg'],
        MEMFS: [
          { name: this.file.name, data: data }
        ]
      });
      // this.worker.terminate();
    },
    generateVideo (info) {
      let blob = new Blob([info.data], { type: 'video/mp4' })
      this.video = {
        name: info.name,
        url: window.URL.createObjectURL(blob),
      }
    },
    async ffmpegVideo () {
      // ffmpeg -i test.mp4 -ss 60 -t 60 -c copy test-copy1.mp4
      let data = await new Response(this.file).arrayBuffer()
      this.mp4Worker.onmessage = (e) => {
        var msg = e.data;
        switch (msg.type) {
          case "stdout":
            console.log(msg.data);
            break;
          case "stderr":
            console.log(msg.data);
            break;
          case "exit":
            console.log("Process exited with code " + msg.data);
            break;
          case "done":
            console.log(msg.data.MEMFS)
            console.log(msg.data.WORKERFS)
            this.generateVideo(msg.data.MEMFS[0])
            break;
        }
      }
      this.mp4Worker.postMessage({
        type: "run",
        arguments: ['-i', this.file.name, '-ss', '60', '-t', '60', 'test-copy1.mp4'],
        MEMFS: [
          { name: this.file.name, data: data }
        ],
        TOTAL_MEMORY: 512 * 1024 * 1024
      });
      // this.worker.terminate();
    },
    generateMp3 (info) {
      let blob = new Blob([info.data], { type: 'audio/mp3' })
      this.mp3 = {
        name: info.name,
        url: window.URL.createObjectURL(blob),
      }
    },
    async ffmpegMp3 () {
      // ffmpeg -i test.mp4 -f mp3 -vn test.mp3
      let data = await new Response(this.file).arrayBuffer()
      var stdout = "";
      var stderr = "";
      this.mp4Worker.onmessage = (e) => {
        var msg = e.data;
        switch (msg.type) {
          case "stdout":
            stdout += msg.data + "\n";
            break;
          case "stderr":
            stderr += msg.data + "\n";
            break;
          case "exit":
            console.log("Process exited with code " + msg.data);
            console.log(stdout);
            console.log(stderr);
            break;
          case "done":
            this.generateMp3(msg.data.MEMFS[0])
            break;
        }
      }
      this.mp4Worker.postMessage({
        type: "run",
        arguments: ['-i', this.file.name, '-f', 'mp3', '-vn', 'test.mp3'],
        MEMFS: [
          { name: this.file.name, data: data }
        ],
        TOTAL_MEMORY: 128 * 1024 * 1024
      });
      // this.worker.terminate();
    },
    initWebmWorker () {
      if (this.webmWorker === null) {
        this.webmWorker = new Worker('lib/ffmpeg/ffmpeg-worker-webm.js');
        this.webmWorker.onmessage = function(e) {
          var msg = e.data;
          switch (msg.type) {
            case "ready":
              console.log("webmWorker ready")
              break;
          }
        };
      }
    },
    initMp4Worker () {
      if (this.mp4Worker === null) {
        this.mp4Worker = new Worker('lib/ffmpeg/ffmpeg-worker-mp4.js')
        this.mp4Worker.onmessage = function(e) {
          var msg = e.data;
          switch (msg.type) {
            case "ready":
              console.log("mp4Worker ready")
              break;
          }
        };
      }
    },
    async initFFmpeg2 () {
      const worker = createWorker({
        corePath: '/lib/ffmpeg2/ffmpeg-core.js',
        logger: ({ message }) => console.log(message),
      });
      await worker.load();
      let name = this.file.name;
      await worker.write(name, this.file);
      await worker.run(`-i /data/${name} -ss 10 -t 10 output.mp4`, { input: name, output: 'output.mp4' });
      const { data } = await worker.read('output.mp4');
      this.video = {
        name: 'output.mp4',
        url: URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
      }
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
