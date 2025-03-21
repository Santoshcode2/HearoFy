// Add environment detection at the top
const isGitHubPages = window.location.hostname === 'santoshcode2.github.io';
const REPO_NAME = 'HearoFy';
const BASE_PATH = isGitHubPages ? `/${REPO_NAME}` : '';

console.log("Lets do some java Script");
let currentSong = new Audio();
let songs1;
let currFolder;

function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// async function getSongs(folder) {
//     currFolder = folder;
//     try {
//         const response = await fetch(`${folder}/`);
//         const text = await response.text();
//         const div = document.createElement("div");
//         div.innerHTML = text;

//         songs1 = Array.from(div.getElementsByTagName("a"))
//             .filter(element => element.href.endsWith(".mp3"))
//             .map(element => element.href.split(`/${currFolder}/`)[1]);

//         const songUL = document.querySelector(".songList ul");
//         songUL.innerHTML = songs1.map(song => {
//             const formattedSong = song.replace(/%20/g, " ");
//             return `<li>        
//                 <img class="invert" src="${BASE_PATH}/image/music.svg" alt="">
//                 <div class="info">
//                     <div>${formattedSong}</div>
//                     <div>Santosh</div>
//                 </div>
//                 <div class="playnow">
//                     <span>Play Now</span>
//                     <img class="invert" src="${BASE_PATH}/image/play.svg" alt="">
//                 </div>  
//             </li>`;
//         }).join('');

//         Array.from(songUL.children).forEach(e => {
//             e.addEventListener("click", () => {
//                 playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
//             });
//         });

//         if (songs1.length > 0) playMusic(songs1[0], true);

//     } catch (error) {
//         console.error("Error loading songs:", error);
//     }
// }

async function getSongs(folder) {
    try {
        // Clean up folder path and fetch album info
        const cleanFolder = folder.replace(/\/$/, ''); // Remove trailing slash
        const albumInfoPath = `${cleanFolder}/info.json`;
        
        // Fetch album information
        const infoResponse = await fetch(albumInfoPath);
        if (!infoResponse.ok) throw new Error(`Failed to load album info: ${infoResponse.status}`);
        
        const albumInfo = await infoResponse.json();
        
        // Set current folder and process songs
        currFolder = cleanFolder;
        songs1 = albumInfo.songs.map(song => 
            `${cleanFolder}/${encodeURIComponent(song)}`
        );

        // Update song list display
        const songUL = document.querySelector(".songList ul");
        songUL.innerHTML = songs1.map(song => {
            const fileName = decodeURIComponent(song.split('/').pop());
            const formattedSong = fileName.replace(/_/g, ' ').replace(/.mp3$/, '');
            
            return `<li>        
                <img class="invert" src="${BASE_PATH}/image/music.svg" alt="">
                <div class="info">
                    <div>${formattedSong}</div>
                    <div>${albumInfo.artist || "Santosh"}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="${BASE_PATH}/image/play.svg" alt="">
                </div>  
            </li>`;
        }).join('');

        // Add click handlers safely
        if (songUL) {
            Array.from(songUL.children).forEach(e => {
                const songElement = e.querySelector(".info div:first-child");
                if (songElement) {
                    e.addEventListener("click", () => {
                        const songIndex = Array.from(songUL.children).indexOf(e);
                        playMusic(songs1[songIndex]);
                    });
                }
            });
        }

        // Play first song if available
        if (songs1.length > 0) {
            playMusic(songs1[0], true);
        }

    } catch (error) {
        console.error("Error loading songs:", error);
        songs1 = [];
        const songUL = document.querySelector(".songList ul");
        if (songUL) songUL.innerHTML = "<li>Error loading songs</li>";
    }
}















// const playMusic = async (track, pause = false) => {
//     try {
//         if (currentSong.src) {
//             currentSong.pause();
//             currentSong.src = "";
//         }

//         currentSong.src = `${BASE_PATH}/${currFolder}/${track}`;

//         await new Promise((resolve, reject) => {
//             currentSong.onloadeddata = resolve;
//             currentSong.onerror = reject;
//         });

//         const playButton = document.querySelector(".play img");
//         if (!pause) {
//             await currentSong.play();
//             playButton.src = `${BASE_PATH}/image/pause.svg`;
//         } else {
//             playButton.src = `${BASE_PATH}/image/play.svg`;
//         }

//         document.querySelector(".songinfo").textContent = decodeURI(track);
//         document.querySelector(".songtime").textContent = "00:00 / 00:00";

//         currentSong.onended = () => {
//             playButton.src = `${BASE_PATH}/image/play.svg`;
//         };

//     } catch (error) {
//         console.error("Error playing music:", error);
//     }
// };


const playMusic = async (trackPath, pause = false) => {
    try {
        if (!trackPath) throw new Error("No track specified");
        
        // Clear current song
        if (currentSong.src) {
            currentSong.pause();
            currentSong.src = "";
        }

        // Load new song
        currentSong.src = `${BASE_PATH}${trackPath}`;
        
        await new Promise((resolve, reject) => {
            currentSong.onloadeddata = resolve;
            currentSong.onerror = reject;
        });

        // Update UI elements safely
        const playButton = document.querySelector(".play img");
        if (playButton) {
            playButton.src = `${BASE_PATH}/image/${
                pause ? "play" : "pause"
            }.svg`;
        }

        // Update song info
        const songName = trackPath.split('/').pop().replace(/%20/g, " ");
        document.querySelector(".songinfo").textContent = songName;

    } catch (error) {
        console.error("Playback error:", error);
        if (document.querySelector(".play img")) {
            document.querySelector(".play img").src = `${BASE_PATH}/image/play.svg`;
        }
    }
};

// async function displayAlbums() {
//     try {
//         const response = await fetch(`${BASE_PATH}/songs1/`);
//         const text = await response.text();
//         const div = document.createElement("div");
//         div.innerHTML = text;
//         const cardContainer = document.querySelector(".cardContainer");
//         cardContainer.innerHTML = "";

//         Array.from(div.getElementsByTagName("a")).forEach(async (e) => {
//             if (!e.href.includes("/songs1")) return;

//             const url = new URL(e.href);
//             const pathSegments = url.pathname.split('/').filter(part => part !== "");
            
//             if (pathSegments.length < 2 || 
//                (isGitHubPages && pathSegments[1] !== REPO_NAME) || 
//                pathSegments[pathSegments.length - 2] !== "songs1") {
//                 return;
//             }

//             const folder = pathSegments[pathSegments.length - 1];

//             try {
//                 const infoResponse = await fetch(`${BASE_PATH}/songs1/${folder}/info.json`);
//                 if (!infoResponse.ok) return;
                
//                 const data = await infoResponse.json();
                
//                 cardContainer.innerHTML += `
//                     <div data-folder="${BASE_PATH}/songs1/${folder}" class="card">
//                         <div class="play">
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                                 <path d="M5 20V4L19 12L5 20Z" fill="#000"/>
//                             </svg>
//                         </div>
//                         <img src="${BASE_PATH}/songs1/${folder}/cover.jpg" alt="${data.title}">
//                         <h2>${data.title}</h2>
//                         <p>${data.description}</p>
//                     </div>`;
//             } catch (error) {
//                 console.error("Error loading album:", error);
//             }
//         });

//         Array.from(document.getElementsByClassName("card")).forEach(e => {
//             e.addEventListener("click", async (event) => {
//                 await getSongs(event.currentTarget.dataset.folder);
//             });
//         });

//     } catch (error) {
//         console.error("Error loading albums:", error);
//     }
// }

// async function displayAlbums() {
//     try {
//         // Load manifest instead of directory listing
//         const manifestResponse = await fetch(`${BASE_PATH}/songs1/manifest.json`);
//         if (!manifestResponse.ok) throw new Error('Manifest not found');
        
//         const manifest = await manifestResponse.json();

//         const cardContainer = document.querySelector(".cardContainer");
//         cardContainer.innerHTML = "";

//         // Process all albums from manifest
//         for (const folder of manifest.albums) {
//             try {
//                 const infoResponse = await fetch(`${BASE_PATH}/songs1/${folder}/info.json`);
//                 if (!infoResponse.ok) continue;
                
//                 const data = await infoResponse.json();
                
//                 cardContainer.innerHTML += `
//                     <div data-folder="${BASE_PATH}/songs1/${folder}" class="card">
//                         <div class="play">
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                                 <path d="M5 20V4L19 12L5 20Z" fill="#000"/>
//                             </svg>
//                         </div>
//                         <img src="${BASE_PATH}/songs1/${folder}/cover.jpg" alt="${data.title}">
//                         <h2>${data.title}</h2>
//                         <p>${data.description}</p>
//                     </div>`;
//             } catch (error) {
//                 console.error("Error loading album:", error);
//             }
//         }

//         // Add click handlers for cards
//         Array.from(document.getElementsByClassName("card")).forEach(e => {
//             e.addEventListener("click", async (event) => {
//                 await getSongs(event.currentTarget.dataset.folder);
//             });
//         });

//     } catch (error) {
//         console.error("Error loading albums:", error);
//     }
// }

async function displayAlbums() {
    // Detect environment and set base path
    const isGitHubPages = window.location.hostname === 'santoshcode2.github.io';
    const basePath = isGitHubPages ? '/HearoFy' : '';

    try {
        // 1. Fetch the manifest file
        const manifestResponse = await fetch(`${basePath}/songs1/manifest.json`);
        if (!manifestResponse.ok) throw new Error('Manifest not found');
        
        // 2. Parse the manifest data
        const manifest = await manifestResponse.json(); // 👈 This is the critical fix
        
        // 3. Get card container and clear it
        const cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

        // 4. Process albums from manifest
        const handleCardClick = async (event) => {
            const card = event.currentTarget;
            if (!card?.dataset?.folder) return;
            await getSongs(card.dataset.folder);
        };

        // 5. Create album cards
        for (const folder of manifest.albums) { // 👈 Now using manifest from response
            try {
                const infoResponse = await fetch(`${basePath}/songs1/${folder}/info.json`);
                if (!infoResponse.ok) continue;
                
                const data = await infoResponse.json();
                
                cardContainer.innerHTML += `
                    <div data-folder="${basePath}/songs1/${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M5 20V4L19 12L5 20Z" fill="#000"/>
                            </svg>
                        </div>
                        <img src="${basePath}/songs1/${folder}/cover.jpg" alt="${data.title}">
                        <h2>${data.title}</h2>
                        <p>${data.description}</p>
                    </div>`;
            } catch (error) {
                console.error("Error loading album:", error);
            }
        }

        // 6. Add event listeners safely
        setTimeout(() => {
            Array.from(document.getElementsByClassName("card")).forEach(e => {
                if (e) e.addEventListener("click", handleCardClick);
            });
        }, 100);

    } catch (error) {
        console.error("Error loading albums:", error);
    }
}















async function main() {
    // Initialize with correct base path
    await getSongs(`${BASE_PATH}/songs1/ncs`);
    playMusic(songs1[0], true);
    displayAlbums();

    // Player controls
    document.querySelector(".play").addEventListener("click", () => {
        currentSong[currentSong.paused ? "play" : "pause"]();
        document.querySelector(".play img").src = 
            `${BASE_PATH}/image/${currentSong.paused ? "play" : "pause"}.svg`;
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").textContent = 
            `${convertSecondsToMinutes(currentSong.currentTime)} / ${convertSecondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = 
            `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Navigation controls
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.querySelector(".previous").addEventListener("click", () => {
        const index = songs1.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs1[index - 1]);
    });

    document.querySelector(".next").addEventListener("click", () => {
        const index = songs1.indexOf(currentSong.src.split("/").pop());
        if (index < songs1.length - 1) playMusic(songs1[index + 1]);
    });

    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = `${BASE_PATH}/image/mute.svg`;
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = `${BASE_PATH}/image/volume.svg`;
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 16;
        }
    });

    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });
}

main();
