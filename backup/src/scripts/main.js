let hoverTimeout
let hoverOnControls = false
let beforeMuted = {}
const video = $(".main-video")[0]

$(".main-video").single_double_click(togglePlay, toggleFullscreen)
$(".container, progressBar").mousemove(resetHoverTimeout)
$("controls").mouseenter(hoveringOnControls)
$("controls").mouseleave(notHoveringOnControls)
$("#togglePlay").click(togglePlay)

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
  $("time").text(`${currentTimeText.minutes}:${currentTimeText.seconds} / ${durationText.minutes}:${durationText.seconds}`)
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
  $("volume slider").removeAttr("style")
})
$("#volume-icon").click(e=>{
  $(".main-video")[0].muted = !$(".main-video")[0].muted
  if($("#volume-icon")[0].classList.contains("fa-volume-off")) {
    $("#volume-icon").removeClass("fa-volume-off fa-volume-up fa-volume-down")
    $("#volume-icon").addClass(beforeMuted.icon)
    $("volume slider thumb").css("left", beforeMuted.left)
    beforeMuted = {}
  } else {
    beforeMuted = {
      icon: $("#volume-icon")[0].classList[1],
      left: $("volume slider thumb").css("left")
    }
    $("#volume-icon")[0].classList.remove("fa-volume-off", "fa-volume-up", "fa-volume-down")
    $("#volume-icon")[0].classList.add("fa-volume-off")
    $("volume slider thumb").css("left", "0px")
  }
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
  $(".main-video")[0].webkitEnterFullscreen()
  if(window.fullscreen)
    document.webkitExitFullscreen()
}

function changeVolume(e) {
  $(".main-video")[0].muted = false
  let left = e.offsetX - $("volume slider thumb").width()/2 || 0
  left = left >= 88 ? 88 : left <= 0 ? 0 : left
  $("volume slider thumb").css("left", left)
  $(".main-video")[0].volume = left / ($("volume slider").width() - $("volume slider thumb").width())
  let icon = $(".main-video")[0].volume >= .5 ? "fa-volume-up" : $(".main-video").volume == 0 ? "fa-volume-off" : "fa-volume-down"
  $("#volume-icon")[0].classList.remove("fa-volume-off", "fa-volume-up", "fa-volume-down")
  $("#volume-icon")[0].classList.add(icon)
}

function togglePlay() {
  if($(".main-video")[0].paused) {
    $(".main-video")[0].play()
    $("#togglePlay").removeClass("fa-play").addClass("fa-pause")
  }
  else {
    $(".main-video")[0].pause()
    $("#togglePlay").removeClass("fa-pause").addClass("fa-play")
  }
}
