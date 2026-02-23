console.log("lets write JavaScript!!");
let currFolder;
let currentSong = new Audio();
let play = document.querySelector("#plays");

let songs = [];  // moved to top so accessible everywhere

// ---------------- PLAY MUSIC FUNCTION ----------------
const playMusic = (track) => {
    currentSong.src = `${currFolder}` + track;
    currentSong.play();
    play.src = "pause.svg";

    document.querySelector(".songinfo").innerHTML =
        track.replace("%20", " ")
            .replace("%5", " ")
            .replace("C", " ")
            .replace(".mp3", " ");

    function formatTime(totalSeconds) {
        totalSeconds = Math.floor(totalSeconds);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentSong.currentTime)} / ${isNaN(currentSong.duration)
                ? "0:00"
                : formatTime(currentSong.duration)
            }`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });
    //event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
    });
};

// ---------------- GET SONGS FUNCTION ----------------
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let a_s = div.getElementsByTagName("a");
    // let songs = [];

    for (let i = 0; i < a_s.length; i++) {
        const element = a_s[i];
        if (element.href.endsWith(".mp3")) {
            // console.log(element.href.split(`${folder}`)[1])
            let files = [];
            files.push(element.href.split("/").pop());
            // console.log(element.href.split("/").pop())
            for (const s of files) {
                let filename = decodeURIComponent(s)
                    .replace(/\\/g, "")
                    .replace(/\//g, "")
                    .replace(/_/g, " ")
                    .replace("songshindi","").replace("songsEnglish","");

                
                    songs.push(filename);
            }
            // console.log(currFolder)
            console.log(songs)
            // console.log(files)
        }
    }

    return songs;
}

// ---------------- MAIN FUNCTION ----------------
async function main() {

    // songs = await getSongs("songs/hindi/");
    //if card-1 is clicked
    document.querySelector(".English").addEventListener("click",async()=>{
        return songs = await getSongs("songs/English/");

    });
    // console.log(songs);
    // Preload first song (do not play)
    if (songs.length > 0) {
        currentSong.src = `${currFolder}` + songs[0];
        currentSong.load();   // prepares it
        document.querySelector(".songinfo").innerHTML =
            decodeURI(songs[0]).replace("%20", " ")
                .replace("%5", " ")
                .replace("C", " ")
                .replace(".mp3", " ")
                .replace(/\\/g, "");
        currentSong.onloadedmetadata = function () {
            currentSong.dispatchEvent(new Event("timeupdate"));
        };
    }
    function formatTime(totalSeconds) {
        totalSeconds = Math.floor(totalSeconds);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Attach timeupdate listener once for preloaded song
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentSong.currentTime)} / ${isNaN(currentSong.duration)
                ? "0:00"
                : formatTime(currentSong.duration)
            }`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
        //event listener to seekbar
        document.querySelector(".seekbar").addEventListener("click", e => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentSong.currentTime = ((currentSong.duration) * percent) / 100;
        });
    });

    play.src = "plays.svg";

    let songUL = document.querySelector(".songlists")
        .getElementsByTagName("ul")[0];

    for (const song of songs) {
        let cleanSong = decodeURIComponent(song)
            .replace(/\\/g, "")
            .replace(/\//g, "")
            .replace(".mp3", "")
            .replace(/_/g, " ");

        songUL.innerHTML = songUL.innerHTML + `
            <li class="rounded">
                <img src="music.svg" class="invert svg-size">
                <div class="info">
                    <div>${cleanSong}</div>
                    <div>Rockson</div>
                </div>
            </li>`;
    }

    // Song click listeners
    Array.from(document.querySelector(".songlists")
        .getElementsByTagName("li"))
        .forEach((li, index) => {
            li.addEventListener("click", () => {
                playMusic(songs[index]);
            });
        });

    // Play / Pause button
    play.addEventListener("click", () => {
        // If no song loaded yet, load first song
        if (!currentSong.src) {
            currentSong.src = "songs" + songs[0];
            currentSong.load();

        }
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "plays.svg";
        }
    });
    //add an event listener for hamberger
    document.querySelector(".hamberger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = -120 + "%";
    })
    //add event listener for previous and next
    let previous = document.querySelector("#prev");
    let next = document.querySelector("#next");

    previous.addEventListener("click", () => {
        // alert("xxx")
        let index = songs.indexOf(currentSong.src.split("/songs").slice(-1)[0]);

        if (index <= 0) {
            // console.warn("You are already at the first song. No previous track available.");
            // alert("This is the first song in the playlist.");
            return; // stop execution
        }
        playMusic(songs[index - 1]);
    });
    next.addEventListener("click", () => {
        // alert("yyy")
        let index = songs.indexOf(currentSong.src.split("/songs").slice(-1)[0]);

        if ((index + 1) > (songs.length - 1)) {
            playMusic(songs[0]);
        } else {

            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {

        currentSong.volume = parseInt(e.target.value) / 100;
    })
    //load the file when card is clicked

}


// ---------------- START APP ----------------
main();

