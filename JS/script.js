// Add environment detection at the top
const isGitHubPages = window.location.hostname === 'santoshcode2.github.io';
const REPO_NAME = 'HearoFy';
const BASE_PATH = isGitHubPages ? `/${REPO_NAME}/` : '/'; 

console.log("Lets do some java Script");
// let currentSong = new Audio();
let currentSong = document.querySelector('audio') || new Audio();
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
        const cleanFolder = folder.replace(/^\/|\/$/g, '');// Remove trailing slash
        const albumInfoPath = `${BASE_PATH}${cleanFolder}/info.json`;
        
        // Fetch album information
        const infoResponse = await fetch(albumInfoPath);
        if (!infoResponse.ok) throw new Error(`Failed to load album info: ${infoResponse.status}`);
        
        const albumInfo = await infoResponse.json();
        
        // Set current folder and process songs
        currFolder = cleanFolder;
        songs1 = albumInfo.songs.map(song => 
            `${cleanFolder}/${song}` 
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
    // Only auto-play if we're loading the initial "ncs" folder
    const shouldAutoPlay = folder === 'songs1/ncs';
    playMusic(songs1[0], !shouldAutoPlay); // ✅ Plays only for ncs
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

        // 🔴 FIXED: Clear current song properly
        if (currentSong && currentSong.src) {
            currentSong.pause();
            currentSong.removeAttribute('src'); // Clear src properly
        }

        // 🔴 FIXED: Path handling
        const cleanTrackPath = trackPath
            .replace(/%25/g, '%') // Fix double encoding
            .replace(/\/{2,}/g, '/'); // Remove duplicate slashes

        // 🔴 FIXED: Single encoding pass
        const encodedPath = encodeURI(cleanTrackPath);

        // 🔴 FIXED: Construct final URL
        currentSong.src = `${BASE_PATH}${encodedPath}`.replace(/([^:]\/)\/+/g, '$1');
        console.log('Final Audio URL:', currentSong.src);

        // 🔴 FIXED: Wait for audio to load
        // await new Promise((resolve, reject) => {
        //     currentSong.onloadedmetadata = resolve; // Use onloadedmetadata
        //     currentSong.onerror = reject;
        // });

// Replace the loading promise with:
await new Promise((resolve, reject) => {
    const handleLoad = () => {
        currentSong.removeEventListener('canplaythrough', handleLoad);
        currentSong.removeEventListener('error', handleError);
        resolve();
    };
    const handleError = (e) => {
        currentSong.removeEventListener('canplaythrough', handleLoad);
        currentSong.removeEventListener('error', handleError);
        reject(new Error(`Audio load failed: ${e.message}`));
    };
    
    currentSong.addEventListener('canplaythrough', handleLoad);
    currentSong.addEventListener('error', handleError);
});

        // 🔴 FIXED: Update UI safely
        const fileName = decodeURIComponent(encodedPath.split('/').pop())
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/.mp3$/i, ''); // Remove .mp3 extension

        const songInfo = document.querySelector(".songinfo");
        if (songInfo) songInfo.textContent = fileName;

        if (!pause) {
            await currentSong.play().catch(error => {
                console.error('Play failed:', error);
            });
            const playImg = document.querySelector(".play img");
            if (playImg) playImg.src = `${BASE_PATH}/image/pause.svg`;
        }

    } catch (error) {
        console.error("Playback error:", error);
        const playImg = document.querySelector(".play img");
        if (playImg) playImg.src = `${BASE_PATH}/image/play.svg`;
    }
};

async function displayAlbums() {
    try {
        // 🔴 FIXED: Use BASE_PATH consistently
        const manifestResponse = await fetch(`${BASE_PATH}songs1/manifest.json`);
        if (!manifestResponse.ok) throw new Error('Manifest not found');

        // 🔴 FIXED: Parse manifest with error handling
        let manifest;
        try {
            manifest = await manifestResponse.json();
        } catch (jsonError) {
            console.error('Invalid JSON in manifest:', jsonError);
            throw new Error('Invalid manifest file');
        }

        // 🔴 FIXED: Clear card container safely
        const cardContainer = document.querySelector(".cardContainer");
        if (!cardContainer) {
            console.error('Card container not found');
            return;
        }
        cardContainer.innerHTML = "";

        // 🔴 FIXED: Handle card clicks
        const handleCardClick = async (event) => {
            const card = event.currentTarget;
            if (!card?.dataset?.folder) return;
            try {
                await getSongs(card.dataset.folder);
            } catch (error) {
                console.error('Error loading songs:', error);
            }
        };

        // 🔴 FIXED: Create album cards
        for (const folder of manifest.albums) {
            try {
                const infoResponse = await fetch(`${BASE_PATH}songs1/${folder}/info.json`);
                if (!infoResponse.ok) {
                    console.warn(`Album info not found: ${folder}`);
                    continue;
                }

                const data = await infoResponse.json();

                // 🔴 FIXED: Use BASE_PATH for images
                cardContainer.innerHTML += `
                <div data-folder="songs1/${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M5 20V4L19 12L5 20Z" fill="#000"/>
                        </svg>
                    </div>
                    <img src="${BASE_PATH}songs1/${folder}/cover.jpg" alt="${data.title}">
                    <h2>${data.title}</h2>
                    <p>${data.description}</p>
                </div>`;
            } catch (error) {
                console.error(`Error loading album ${folder}:`, error);
            }
        }

        // 🔴 FIXED: Add event listeners safely
        const cards = document.getElementsByClassName("card");
        if (cards) {
            Array.from(cards).forEach(card => {
                card?.addEventListener("click", handleCardClick);
            });
        } else {
            console.error('No album cards found');
        }

    } catch (error) {
        console.error("Error loading albums:", error);
        const cardContainer = document.querySelector(".cardContainer");
        if (cardContainer) {
            cardContainer.innerHTML = "<p>Error loading albums. Please check the manifest file.</p>";
        }
    }
}






async function main() {
    try {
        // 🔴 FIXED: Wait for DOM to fully load before initialization
        await new Promise(resolve => {
            if (document.readyState === 'complete') resolve();
            else document.addEventListener('DOMContentLoaded', resolve);
        });

        // 🔴 FIXED: Initialize with correct base path
        await getSongs(`songs1/ncs`);
        await playMusic(songs1[0], true);
        await displayAlbums();
        console.log('Initial Album Path:', `songs1/ncs`); // Debugging

        // 🔴 FIXED: Helper function for safe event listener addition
        const addListener = (selector, event, handler) => {
            const element = document.querySelector(selector);
            if (element) {
                element.addEventListener(event, handler);
            } else {
                console.error(`Element not found: ${selector}`);
            }
        };

        // Player controls
        addListener('.play', 'click', () => {
            currentSong[currentSong.paused ? "play" : "pause"]();
            const playImg = document.querySelector(".play img");
            if (playImg) {
                playImg.src = `${BASE_PATH}/image/${currentSong.paused ? "play" : "pause"}.svg`;
            }
        });

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
        addListener('.seekbar', 'click', e => {
            const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            currentSong.currentTime = (currentSong.duration * percent) / 100;
        });

        // Navigation controls
        addListener('.hamburger', 'click', () => {
            const leftPanel = document.querySelector(".left");
            if (leftPanel) leftPanel.style.left = "0";
        });

        addListener('.close', 'click', () => {
            const leftPanel = document.querySelector(".left");
            if (leftPanel) leftPanel.style.left = "-120%";
        });

        addListener('.previous', 'click', () => {
            const index = songs1.indexOf(currentSong.src.split("/").pop());
            if (index > 0) playMusic(songs1[index - 1]);
        });

        addListener('.next', 'click', () => {
            // const index = songs1.indexOf(currentSong.src.split("/").pop());
            const currentPath = currentSong.src.replace(window.location.origin + BASE_PATH, '');
const index = songs1.indexOf(decodeURIComponent(currentPath));
            if (index < songs1.length - 1) playMusic(songs1[index + 1]);
        });

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

        addListener('.range input', 'input', e => {
            currentSong.volume = parseInt(e.target.value) / 100;
        });

    } catch (error) {
        console.error('Error in main function:', error);
    }
}
main();
