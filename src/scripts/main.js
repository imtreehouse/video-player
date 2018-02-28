let hoverTimeout
let hoverOnControls = false
let volumeinterval
let hidevolume = true
let beforeMuted = {}
const video = $(".main-video")[0]

$(".main-video").single_double_click(togglePlay, toggleFullscreen)
$(".container, progressBar").mousemove(resetHoverTimeout)
$("controls").mouseenter(hoveringOnControls)
$("controls").mouseleave(notHoveringOnControls)
$("#togglePlay").click(togglePlay)
$(document).mouseup(function() {
  hidevolume = true
})

setInterval(function() {
  const currentTime = video.currentTime
  const duration = video.duration
  const buffered = video.buffered
  let currentTimeText = {
    minutes: Math.floor(currentTime / 60) < 10 ? `0${Math.floor(currentTime / 60)}` : Math.floor(currentTime / 60),
    seconds: Math.floor(currentTime % 60) < 10 ? `0${Math.floor(currentTime % 60)}` : Math.floor(currentTime % 60)
  }
  let durationText = {
    minutes: Math.floor(duration / 60) < 10 ? `0${Math.floor(duration / 60)}` : Math.floor(duration / 60),
    seconds: Math.floor(duration % 60) < 10 ? `0${Math.floor(duration % 60)}` : Math.floor(duration % 60)
  }
  const oldtext = $("time").text()
  const newtext = `${currentTimeText.minutes}:${currentTimeText.seconds} / ${durationText.minutes}:${durationText.seconds}`
  if(oldtext !== newtext)
    $("time").text(newtext)
  $("buffered").empty()
  for(let i = 0; buffered.length > i; i++) {
    $("buffered").append("<div></div>")
    let length = buffered.end(i) - buffered.start(i)
    let width = $("progressBar").width() / duration * length
    let left = $("progressBar").width() / duration * buffered.start(i)
    $(`buffered div:nth-child(${i+1})`).css("left", `${left}px`).width(width)
  }
  $("played").css("transform", `scaleX(${currentTime / duration})`)
  $("scrubber").css("transform", `translateX(${currentTime / duration * $("progressBar").width() - $("scrubber").width() / 2}px)`)
}, 1)

$("volume").hover(function() {
  $("volume slider").css("width", "100px")
}, function() {
  volumeinterval = setInterval(function() {
    if(hidevolume) {
      $("volume slider").removeAttr("style")
      clearInterval(volumeinterval)
    }
  }, 10)
})
.mousedown(function() {
  hidevolume = false
})

$("progressBar").click(function(e) {
  video.currentTime = video.duration * (e.offsetX / $("progressBar").width())
})
.mousemove(function(e) {
  const offset = e.offsetX
  const previewOffset = offset > $("progressBar").width() - $("preview").width()/2 ? $("progressBar").width() - $("preview").width() : offset < $("preview").width()/2 ? 0 : offset - $("preview").width()/2
  $("preview").css("opacity", "1").css("left", `${previewOffset}px`)
  $("previewTime").css("left", ($("preview").width() - $("previewTime").width())/2)
  $("hover").css("transform", `scaleX(${offset / $("progressBar").width()})`)
  const timestamp = {
    minutes: Math.floor(video.duration / $("progressBar").width() * offset / 60) < 10 ? `0${Math.floor(video.duration / $("progressBar").width() * offset / 60)}` : Math.floor(video.duration / $("progressBar").width() * offset / 60),
    seconds: Math.floor(video.duration / $("progressBar").width() * offset % 60) < 10 ? `0${Math.floor(video.duration / $("progressBar").width() * offset % 60)}` : Math.floor(video.duration / $("progressBar").width() * offset % 60)
  }
  $("previewTime").text(`${timestamp.minutes}:${timestamp.seconds}`)
})
.mouseout(function(e) {
  $("preview").removeAttr("style")
  $("hover").removeAttr("style")
})
$("volume slider").on("mousedown", function(e) {
  $(this).focus()
  if((e.which === 3 || e.button === 2))
    return
  let released = false
  const ox = e.offsetX

  changeVolume(e)
  $(document).on("mouseup", e => released = true)
  $("volume slider").on("mousemove", function(e) {
    if(!released) {
      if(ox !== e.offsetX)
        changeVolume(e)
    } else
      return
  })
})
$("#fullscreen").click(toggleFullscreen)

function hoveringOnControls() {
  hoverOnControls = true
}

function notHoveringOnControls() {
  hoverOnControls = false
  resetHoverTimeout()
}

function resetHoverTimeout() {
  if (!$(".container").hasClass("controlsVisible"))
    $(".container").addClass("controlsVisible").css("cursor", "auto")
  clearTimeout(hoverTimeout)
  if (!hoverOnControls) {
    hoverTimeout = setTimeout(function() {
      if ($(".container").hasClass("controlsVisible"))
        $(".container").removeClass("controlsVisible").css("cursor", "none")
    }, 3000)
  }
}

function toggleFullscreen() {
  if(document.webkitIsFullScreen) {
    document.webkitExitFullscreen()
    $("#fullscreen").html("fullscreen")
  } else {
    $(".main-video")[0].webkitEnterFullscreen()
    $("#fullscreen").html("fullscreen_exit")
  }
}

function changeVolume(e) {
  let left = e.offsetX - $("volume slider thumb").width()/2 || 0
  left = left >= 88 ? 88 : left <= 0 ? 0 : left
  $("volume slider thumb").css("left", left)
  $(".main-video")[0].volume = left / ($("volume slider").width() - $("volume slider thumb").width())
  let icon = $(".main-video")[0].volume == 0 ? "volume_off" : $(".main-video")[0].volume > .66 ? "volume_up" : $(".main-video")[0].volume < .33 ? "volume_mute" : "volume_down"
  $("volume")[0].childNodes[0].nodeValue = icon 
}

function togglePlay() {
  if($(".main-video")[0].paused) {
    $(".main-video")[0].play()
    $("#togglePlay").html("pause")
  }
  else {
    $(".main-video")[0].pause()
    $("#togglePlay").html("play_arrow")
  }
}

function init() {
  let left = 88 / $(".main-video")[0].volume
  left = left >= 88 ? 88 : left <= 0 ? 0 : left
  $("volume slider thumb").css("left", left)
  $(".main-video")[0].volume = left / (100 - $("volume slider thumb").width())
  let icon = $(".main-video")[0].volume == 0 ? "volume_off" : $(".main-video")[0].volume > .66 ? "volume_up" : $(".main-video")[0].volume < .33 ? "volume_mute" : "volume_down"
  $("volume")[0].childNodes[0].nodeValue = icon 
}

init()