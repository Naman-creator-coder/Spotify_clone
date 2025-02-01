console.log("javascript started");
let currentSong = new Audio();

const box1 = document.getElementsByClassName("box1")[0]; // Get the first .box1 element
const bar = document.getElementsByClassName("bar")[0];
let Songs;
let currfolder;

// convert second into minutes
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60); // Get the whole minutes
  const secs = Math.floor(seconds % 60); // Truncate decimal seconds
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// to get all song from local server
async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let Songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      Songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // always play 1 song by default and display on play bar
  playMusic(Songs[0], true);
  let songUl = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of Songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li> 
                             <img src="img/music.svg" alt="music">
                             <div class="info">
                                 <div>${song.replaceAll("%20", " ")}</div>
                                 
                             </div>
                             <div class="playnow">
                                 <span>Play now</span>
                                 <img src="img/pla.svg" alt="">
                             </div>
 
     
      </li>`;
  }

  //  attach a event listner for song

  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return Songs;
}

// for play and pause music

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "0:00 / 0:00";
};

async function displayalbum() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(4)[0];

      // getting from meta data from folder

      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      cardcontainer.innerHTML =
        cardcontainer.innerHTML +
        `<div data-folder="${folder}" class="card">
                            <img src="Songs/${folder}/cover.jpg" alt="">
                            <h3>${response.title}</h3>
                            <p>Artist</p>
                            <div class="svgcontainer">
                            <div class="svg">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="45"
                                        width="45">
                                        <circle cx="256" cy="256" r="256" fill="#1ed760" />
                                        <path
                                        d="M188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9l0-176c0-8.7 4.7-16.7 12.3-20.9z"
                                        fill="black" />
                                        </svg>
                                        </div>
                                        </div>
                                        </div>`;
    }
  }

  // when card click then playlist show

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      Songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)  
       
    if (Songs.length > 0) {
      playMusic(Songs[0]); // Play the first song in the fetched list
    } 

    });
  });
}

// MAIN
async function main() {
  // song list
  await getsongs("songs/spoti");

  // display all album
  displayalbum();

  // attach an event , to backward play fordward
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // listen for time updating but in second

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSong.currentTime
    )} / ${formatTime(currentSong.duration)}`;
  });

  // Update the time display

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSong.currentTime
    )} / ${formatTime(currentSong.duration)}`;

    // Update the seek bar position

    const seekBar = document.querySelector(".seek-bar");
    if (currentSong.duration) {
      seekBar.value = (currentSong.currentTime / currentSong.duration) * 100;
    }
  });

  // Allow user to seek using the seek bar

  document.querySelector(".seek-bar").addEventListener("input", (e) => {
    const seekTo = (e.target.value / 100) * currentSong.duration;
    currentSong.currentTime = seekTo;
  });

  // Reset the time and seek bar when the song ends

  currentSong.addEventListener("ended", () => {
    const seekBar = document.querySelector(".seek-bar");
    seekBar.value = 0; // Reset seek bar to the start
    document.querySelector(".songtime").innerHTML = "0:00 / 0:00"; // Reset time display
    play.src = "img/play.svg"; // Reset play button icon to "play"
  });

  // event on home svg to display box1

  bar.addEventListener("click", () => {
    // Toggle container visibility
    if (getComputedStyle(box1).display === "none") {
      box1.style.display = "block"; // Show the box
      bar.src = "img/xmark.svg";
    } else {
      box1.style.display = "none"; // Hide the box
      bar.src = "img/bar.svg";
    }
  });

  // event listner on backword

  backward.addEventListener("click", () => {
    let index = Songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(Songs[index - 1]);
    }
  });

  // event listner on fordward

  fordward.addEventListener("click", () => {
    currentSong.pause();
    let index = Songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < Songs.length) {
      playMusic(Songs[index + 1]);
    }
  });

  //  event for volume

  // document
  //   .querySelector(".volume")
  //   .getElementsByTagName("input")[0]
  //   .addEventListener("change", (e) => {
  //     currentSong.volume = parseInt(e.target.value) / 100;
  //   });
  document.querySelector(".volume").addEventListener("input", (e) => {
    const volumelevel = e.target.value / 100;
    currentSong.volume = volumelevel;
  });

// event for mute and volume low
document.querySelector(".volume>img").addEventListener("click", e=>{
  
  if (e.target.src.includes("volume.svg")) {
    e.target.src = e.target.src.replace("volume.svg","mute.svg")
    currentSong.volume = 0;
    document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
  }
  else{
    e.target.src = e.target.src.replace("mute.svg","volume.svg")
    currentSong.volume = 1.0;
    document.querySelector(".volume").getElementsByTagName("input")[0].value = 100;
  }



})

}
main();
