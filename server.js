const express = require("express")
const fs = require("fs")
const path = require("path")
const app = express()
const JavaScriptObfuscator = require("javascript-obfuscator")

app.use(express.static(path.join(__dirname, "public")))

app.get("/js/main.js", function(req, res) {
  fs.readFile(`${__dirname}/src/scripts/main.js`, function(err, data) {
    if(err) throw err
    const obfuscationOptions = {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 1,
      identifierNamesGenerator: 'mangled',
      renameGlobals: true,
      rotateStringArray: true,
      stringArrayEncoding: true,
      target: 'browser',
      unicodeEscapeSequence: true
  }
    const obfuscatedJS = JavaScriptObfuscator.obfuscate(data.toString(), obfuscationOptions)
    res.end(obfuscatedJS.getObfuscatedCode())
  })
})

app.get("/video", function(req, res) {
  const path = "assets/SampleVideo_1280x720_30mb.mp4"
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1

    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})

app.listen(3000, function () {
  console.log("Listening on port 3000!")
})
