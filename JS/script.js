console.log("Lets do some java Script");
let currentSong = new Audio() ;
let songs1;
let currFolder;


function convertSecondsToMinutes(seconds) {
    
    if(isNaN(seconds) || seconds < 0){
        return " 00:00 ";
    }
    // Calculate the minutes and seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Pad with leading zeros if needed
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    // Return the formatted string
    return `${paddedMinutes}:${paddedSeconds}`;
}



async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    songs1 = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs1.push(element.href.split(`/${currFolder}/`)[1]); // Extract song name from the URL
        }
    }

    console.log("Loaded songs:", songs1); // Debugging line to check loaded songs

    // Play the first song after populating songs1
    if (songs1.length > 0) {
        playMusic(songs1[0]); // Play the first song
    } else {
        console.log("No songs available to play."); // Debugging line for empty songs
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""; // Clear the existing song list

    // Add each song to the list after replacing %20 with spaces
    for (const song of songs1) {
        // Replace %20 with a space in the song name
        let formattedSong = song.replace(/%20/g, " ");
        songUL.innerHTML += `<li>        
                                <img class="invert" src="image/music.svg" alt="">
                                <div class="info">
                                    <div>${formattedSong}</div>
                                    <div>Santosh</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img class="invert" src="image/play.svg" alt="">
                                </div>  
                            </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs1;
}













const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    
    if (!pause) {
        currentSong.play();
        play.src = "image/pause.svg"; // Show pause icon when a song is playing
    } else {
        currentSong.pause();
        play.src = "image/play.svg"; // Show play icon when no song is playing
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    // Event listener to update the icon when the song ends
    currentSong.onended = () => {
        play.src = "image/play.svg"; // Show play icon when the song ends
    };
};









async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs1/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs1")) {
            let folder = e.href.split("/").slice(-1)[0];

            try {
                // Corrected path for fetching info.json
                let a = await fetch(`http://127.0.0.1:5500/songs1/${folder}/info.json`);

                // Check if the request was successful
                if (!a.ok) {
                    throw new Error(`Failed to load info.json for folder: ${folder}`);
                }

                // Parse JSON if the request succeeded
                let response = await a.json();
                console.log(response);

                // Display album card
                cardContainer.innerHTML += ` <div data-folder="songs1/${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/songs1/${folder}/cover.jpg" alt="">
                    <h2> ${response.title} </h2>
                    <p> ${response.description} </p>
                </div>`;
            } catch (error) {
                console.error("Error fetching or parsing info.json:", error);
            }
        }
    }

   // Load the playlist whenever a card is clicked
Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
        console.log("Fetching Songs");
        const folder = item.currentTarget.dataset.folder;  // Now only 'cs' or 'ncs'
        await getSongs(folder); // Fetch from folder 'cs' or 'ncs'
    });
});


}


async function main() {

    // Get the list of all the songs
    await getSongs("songs1/ncs");
    playMusic(songs1[0],true)

    //display all the albums on the page
    displayAlbums()
   

        //attach an event listener to play. next and previous 
        play.addEventListener("click",()=>{
               if(currentSong.paused){
                    currentSong.play()
                    play.src = "image/pause.svg"
               }
               else{
                   currentSong.pause()
                   play.src = "image/play.svg"
                }
        })
        // listen for time update event
        currentSong.addEventListener("timeupdate",()=>{
            document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)} / ${convertSecondsToMinutes(currentSong.duration)}`
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration)*100 + "%";          //command to move seekbar
        })
     
        //adding an event listener to seekbar
        document.querySelector(".seekbar").addEventListener("click",e=>{
            // document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
            let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100 ;
            document.querySelector(".circle").style.left = percent + "%" ;
           currentSong.currentTime =((currentSong.duration)* percent)/100
        })
        //add an event listener for hamburger
         document.querySelector(".hamburger").addEventListener("click", ()=>{
            document.querySelector(".left").style.left = "0"
         })
        //add an event listener for close button
         document.querySelector(".close").addEventListener("click", ()=>{
            document.querySelector(".left").style.left = "-120%"
         })

         //now on previous & next listener
        //add event listener to previous
         previous.addEventListener("click",()=>{
            console.log("Previous Clicked")

            let index = songs1.indexOf(currentSong.src.split("/").slice(-1) [0])
            console.log(songs1,index)
            if((index-1) >= 0){
                playMusic(songs1[index-1])
            }

        })
         //add event listener to next
         next.addEventListener("click",()=>{
            console.log("Next Clicked")

            let index = songs1.indexOf(currentSong.src.split("/").slice(-1) [0])
            console.log(songs1,index)
            if((index+1) < songs1.length){
                playMusic(songs1[index+1])
            }
         })
         //add an event to volume
         document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
                  console.log("Setting Volume to ",e.target,e.target.value,"/100")
                  currentSong.volume = parseInt(e.target.value)/100 
         })


         //add the event listener to mute the track
         document.querySelector(".volume>img").addEventListener("click",e=>{
                if(e.target.src.includes("image/volume.svg")){
                    e.target.src = e.target.src.replace("image/volume.svg","image/mute.svg")
                    currentSong.volume = 0;
                    document.querySelector(".range").getElementsByTagName("input")[0].value = 0; 
                }
                else{
                    e.target.src = e.target.src.replace("image/mute.svg","image/volume.svg")
                    currentSong.volume = 0.1;
                    document.querySelector(".range").getElementsByTagName("input")[0].value = 16; 

                }
         })
       

}

main();

