const audioUrl = 'https://raw.githubusercontent.com/random197854/test2145/refs/heads/new_branch/data/disc_data.json';
const imageUrl = 'https://github.com/random197854/test2145/raw/refs/heads/new_branch/images/discs.webp';
const baseTrackUrl = 'https://github.com/random197854/test2145/raw/refs/heads/new_branch/discs/';
const baseTrackUrlJson = 'https://raw.githubusercontent.com/random197854/test2145/refs/heads/new_branch/discs/';

const audioContainer = document.getElementById('audioContainer');
const resetFilter = document.getElementById('resetFilter');
const popup = document.getElementById('popup');
const closePopup = document.getElementById('closePopup');
const popupTitle = document.getElementById('popupTitle');
const audioPlayer = document.getElementById('audioPlayer');
const lyricsContainer = document.getElementById('lyrics');

let audioData = [];
let currentFilter = null;

// Fetch audio data
async function fetchData() {
    const response = await fetch(audioUrl);
    audioData = await response.json();
    renderCards(audioData);
}

// Render audio cards
function renderCards(data) {
    audioContainer.innerHTML = '';
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${imageUrl}" style="object-position: -${item.x}px -${item.y}px; width: ${item.w}px; height: ${item.h}px;">
            <div class="info">
                <h3>${item.code}</h3>
                <div class="tags">
                    ${item.characters.map(char => `<button onclick="filterByTag('${char}')">${char}</button>`).join('')}
                </div>
                <button onclick='showPopup(${JSON.stringify(item)})'>Abrir</button>
            </div>
        `;
        audioContainer.appendChild(card);
    });
}

// Filter by tag
function filterByTag(tag) {
    currentFilter = tag;
    const filteredData = audioData.filter(item => item.characters.includes(tag));
    renderCards(filteredData);
    resetFilter.classList.remove('hidden');
}

// Reset filters
function resetFilters() {
    currentFilter = null;
    renderCards(audioData);
    resetFilter.classList.add('hidden');
}

// Mostrar pop-up con nueva funcionalidad
function showPopup(item) {
    popup.classList.add('show');
    popupTitle.textContent = item.code;

    // Cargar lista de tracks
    const trackList = document.getElementById('track-list');
    //trackList.className = 'track-list';
    trackList.innerHTML = item.tracks.map(
        (track, index) => `
            <button onclick="playTrack('${item.code}', '${track.name_id}')">
                ${track.name_id}
            </button>
        `
    ).join('');

    popupTitle.insertAdjacentElement('afterend', trackList);

    // Iniciar con el primer track
    playTrack(item.code, item.tracks[0].name_id);
    
}

// Reproducir track y sincronizar letras
function playTrack(code, trackId) {
    const trackUrl = `${baseTrackUrl}${code}/${trackId}.ogg`;
    audioPlayer.src = trackUrl;
    audioPlayer.play();

    // Cargar letras sincronizadas
    const lyricsUrl = `${baseTrackUrlJson}${code}/${trackId}.json`;
    console.log(lyricsUrl)
    fetch(lyricsUrl)
        .then(response => response.json())
        .then(lyrics => syncLyrics(lyrics))
        .catch(() => {
            lyricsContainer.textContent = 'No se pudieron cargar las letras.';
        });
}

// Sincronizar letras con el audio
function syncLyrics(lyrics) {
    let currentLine = 0;

    lyricsContainer.textContent = lyrics[currentLine].text;
    audioPlayer.ontimeupdate = () => {
        if (
            currentLine < lyrics.length - 1 &&
            audioPlayer.currentTime >= lyrics[currentLine + 1].start
        ) {
            currentLine++;
            lyricsContainer.textContent = lyrics[currentLine].text;
        }
    };
}

// Detener audio al cerrar pop-up
closePopup.addEventListener('click', () => {
    popup.classList.remove('show');
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
});



resetFilter.addEventListener('click', resetFilters);

// Initialize
fetchData();
