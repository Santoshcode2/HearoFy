// Add environment detection at the top
const isGitHubPages = window.location.hostname === 'santoshcode2.github.io';
const REPO_NAME = 'HearoFy';
const BASE_PATH = isGitHubPages ? `/${REPO_NAME}/` : '/';

console.log("Lets do some java Script");
// let currentSong = new Audio();
let currentSong = document.querySelector('audio');
let songs1;
let currFolder;

function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}



async function getSongs(folder) {
    try {
        // Clean up folder path and fetch album info
        const cleanFolder = folder.replace(/\/$/, ''); // Remove trailing slash
        const albumInfoPath = `${BASE_PATH}${cleanFolder}/info.json`;
        
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











const playMusic = async (trackPath, pause = false) => {
    try {
        if (!trackPath) throw new Error("No track specified");

        // Clear current song
        if (currentSong.src) {
            currentSong.pause();
            currentSong.src = "";
        }

        // Fix double encoding of spaces
        const cleanTrackPath = trackPath.replace(/%25/g, '%'); // Fix double encoding
        const encodedPath = encodeURI(cleanTrackPath);

        // Construct the full URL
        currentSong.src = `${BASE_PATH}${encodedPath}`;

        // Debugging: Log the final URL
        console.log('Final Audio URL:', currentSong.src);

        // Wait for the audio to load
        await new Promise((resolve, reject) => {
            currentSong.onloadeddata = resolve;
            currentSong.onerror = reject;
        });

        // Update UI
        const fileName = cleanTrackPath.split('/').pop().replace(/%20/g, " ");
        document.querySelector(".songinfo").textContent = fileName;

        if (!pause) {
            await currentSong.play();
            document.querySelector(".play img").src = `${BASE_PATH}/image/pause.svg`;
        }

    } catch (error) {
        console.error("Playback error:", error);
        document.querySelector(".play img").src = `${BASE_PATH}/image/play.svg`;
    }
};



async function displayAlbums() {
    // Detect environment and set base path
    const isGitHubPages = window.location.hostname === 'santoshcode2.github.io';
    const basePath = isGitHubPages ? '/HearoFy' : '';

    try {
        // 1. Fetch the manifest file
        const manifestResponse = await fetch(`${BASE_PATH}songs1/manifest.json`);
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
                <div data-folder="songs1/${folder}" class="card">  <!-- Changed data-folder -->
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M5 20V4L19 12L5 20Z" fill="#000"/>
                        </svg>
                    </div>
                    <img src="${BASE_PATH}/songs1/${folder}/cover.jpg" alt="${data.title}">
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
    try {
        // Initialize with correct base path
        await getSongs(`songs1/ncs`);
        playMusic(songs1[0], true);
        displayAlbums();
        console.log('Initial Album Path:', `songs1/ncs`); // Debugging

        // Wait for DOM to fully load before adding event listeners
        document.addEventListener('DOMContentLoaded', () => {
            // Player controls
            const playButton = document.querySelector(".play");
            if (playButton) {
                playButton.addEventListener("click", () => {
                    currentSong[currentSong.paused ? "play" : "pause"]();
                    const playImg = document.querySelector(".play img");
                    if (playImg) {
                        playImg.src = `${BASE_PATH}/image/${currentSong.paused ? "play" : "pause"}.svg`;
                    }
                });
            } else {
                console.error('Play button not found');
            }

            // Time update event
            currentSong.addEventListener("timeupdate", () => {
                const songTime = document.querySelector(".songtime");
                const circle = document.querySelector(".circle");
                if (songTime && circle) {
                    songTime.textContent = 
                        `${convertSecondsToMinutes(currentSong.currentTime)} / ${convertSecondsToMinutes(currentSong.duration)}`;
                    circle.style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
                }
            });

            // Seekbar click event
            const seekbar = document.querySelector(".seekbar");
            if (seekbar) {
                seekbar.addEventListener("click", e => {
                    const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
                    currentSong.currentTime = (currentSong.duration * percent) / 100;
                });
            } else {
                console.error('Seekbar not found');
            }

            // Navigation controls
            const hamburger = document.querySelector(".hamburger");
            if (hamburger) {
                hamburger.addEventListener("click", () => {
                    const leftPanel = document.querySelector(".left");
                    if (leftPanel) leftPanel.style.left = "0";
                });
            } else {
                console.error('Hamburger button not found');
            }

            const closeButton = document.querySelector(".close");
            if (closeButton) {
                closeButton.addEventListener("click", () => {
                    const leftPanel = document.querySelector(".left");
                    if (leftPanel) leftPanel.style.left = "-120%";
                });
            } else {
                console.error('Close button not found');
            }

            const previousButton = document.querySelector(".previous");
            if (previousButton) {
                previousButton.addEventListener("click", () => {
                    const index = songs1.indexOf(currentSong.src.split("/").pop());
                    if (index > 0) playMusic(songs1[index - 1]);
                });
            } else {
                console.error('Previous button not found');
            }

            const nextButton = document.querySelector(".next");
            if (nextButton) {
                nextButton.addEventListener("click", () => {
                    const index = songs1.indexOf(currentSong.src.split("/").pop());
                    if (index < songs1.length - 1) playMusic(songs1[index + 1]);
                });
            } else {
                console.error('Next button not found');
            }

            // Volume controls
            const volumeImg = document.querySelector(".volume img");
            if (volumeImg) {
                volumeImg.addEventListener("click", e => {
                    if (e.target.src.includes("volume.svg")) {
                        e.target.src = `${BASE_PATH}/image/mute.svg`;
                        currentSong.volume = 0;
                        const rangeInput = document.querySelector(".range input");
                        if (rangeInput) rangeInput.value = 0;
                    } else {
                        e.target.src = `${BASE_PATH}/image/volume.svg`;
                        currentSong.volume = 0.1;
                        const rangeInput = document.querySelector(".range input");
                        if (rangeInput) rangeInput.value = 16;
                    }
                });
            } else {
                console.error('Volume image not found');
            }

            const rangeInput = document.querySelector(".range input");
            if (rangeInput) {
                rangeInput.addEventListener("input", e => {
                    currentSong.volume = parseInt(e.target.value) / 100;
                });
            } else {
                console.error('Range input not found');
            }
        });

    } catch (error) {
        console.error('Error in main function:', error);
    }
}
main();
