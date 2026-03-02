document.addEventListener('DOMContentLoaded', () => {
    // --- Data for Dynamic Content ---
    const audioData = [
        {
            url: 'audio/tension-strings.mp3',
            title: "The Knife's Edge",
            genre: 'Orchestral / Tension'
        },
        {
            url: 'audio/cello-suite.mp3',
            title: 'Cello Suite',
            genre: 'Orchestral / Dark'
        },
        {
            url: 'audio/Stargardts_clip_1.mp3',
            title: 'Regression of Vision',
            genre: 'Cinematic / Ambient'
        },
        {
            url: 'audio/Stargardts_clip_2.mp3',
            title: 'Building Strength',
            genre: 'Cinematic / Uplifting'
        }
    ];

    const videoData = [
        {
            url: 'https://www.youtube.com/embed/kvIvoc9aJ1g',
            description: 'Short Film / Drama'
        },
        {
            url: 'https://www.youtube.com/embed/6OGEWhuFCsU?si=7ItFjA9BzSraDVtD',
            description: 'Short Film / Drama'
        },
        {
            url: 'https://www.youtube.com/embed/A4otF1ENM0k',
            description: 'Short Film / Drama'
        },
        // To add more videos, just add a new object here
    ];

    // --- Render Dynamic Content ---
    const contentList = document.querySelector('.content-list');
    if (contentList) {
        audioData.forEach(audio => {
            const audioHTML = `
                <div class="track" data-category="audio" data-audio-src="${audio.url}">
                    <div class="track-info">
                        <div class="track-title">${audio.title}</div>
                        <div class="track-desc" data-genre="${audio.genre}"></div>
                    </div>
                    <div class="audio-player">
                        <button class="play-btn" aria-label="Play/Pause"></button>
                        <div class="waveform-container"></div>
                    </div>
                </div>
            `;
            contentList.insertAdjacentHTML('beforeend', audioHTML);
        });

        videoData.forEach(video => {
            const videoHTML = `
                <div class="video-item hidden" data-category="video">
                    <div class="video-info">
                        <div class="video-title"></div>
                        <div class="video-desc">${video.description}</div>
                    </div>
                    <div class="video-embed-container">
                        <iframe src="${video.url}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
            `;
            contentList.insertAdjacentHTML('beforeend', videoHTML);
        });
    }

    const tracks = document.querySelectorAll('.track');
    const waveSurfers = [];

    // Helper function to format time from seconds to MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const paddedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${minutes}:${paddedSeconds}`;
    };

    tracks.forEach(track => {
        const container = track.querySelector('.waveform-container');
        const playBtn = track.querySelector('.play-btn');
        const audioSrc = track.dataset.audioSrc;
        const trackDesc = track.querySelector('.track-desc');

        const waveSurfer = WaveSurfer.create({
            container: container,
            waveColor: getComputedStyle(document.documentElement).getPropertyValue('--secondary-text-color'),
            progressColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
            url: audioSrc,
            barWidth: 2,
            barGap: 1,
            barRadius: 2,
            height: 50,
            cursorWidth: 0,
        });

        waveSurfers.push(waveSurfer);

        // Set a default volume (e.g., 80%)
        waveSurfer.setVolume(0.8);

        // When the audio is decoded and ready, update the track description
        waveSurfer.on('ready', (duration) => {
            const formattedTime = formatTime(duration);
            const genre = trackDesc.dataset.genre;
            trackDesc.textContent = `${genre} - ${formattedTime}`;
        });

        playBtn.onclick = () => waveSurfer.playPause();
        waveSurfer.on('play', () => playBtn.classList.add('playing'));
        waveSurfer.on('pause', () => playBtn.classList.remove('playing'));
    });

    // --- Dynamically Load Video Titles ---
    const videoItems = document.querySelectorAll('.video-item');
    videoItems.forEach(item => {
        const iframe = item.querySelector('iframe');
        if (!iframe) return;

        const embedUrl = iframe.src;
        let originalVideoUrl;

        if (embedUrl.includes('youtube.com/embed/')) {
            const videoId = embedUrl.split('/embed/')[1].split('?')[0];
            originalVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        } else if (embedUrl.includes('player.vimeo.com/video/')) {
            const videoId = embedUrl.split('/video/')[1].split('?')[0];
            originalVideoUrl = `https://vimeo.com/${videoId}`;
        }

        if (originalVideoUrl) {
            // Use noembed.com as a CORS-friendly oEmbed provider
            const noEmbedUrl = `https://noembed.com/embed?url=${encodeURIComponent(originalVideoUrl)}`;
            fetch(noEmbedUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.title && item.querySelector('.video-title')) {
                        item.querySelector('.video-title').textContent = data.title;
                    }
                })
                .catch(error => console.error('Error fetching video metadata:', error));
        }
    });

    // --- Filter Logic ---
    const filterControls = document.querySelector('.filter-controls');
    const contentItems = document.querySelectorAll('.content-list > div');

    filterControls.addEventListener('click', (e) => {
        const clickedButton = e.target.closest('.filter-btn');
        if (!clickedButton) return;

        const filterValue = clickedButton.dataset.filter;

        // Update active button state
        filterControls.querySelector('.active').classList.remove('active');
        clickedButton.classList.add('active');

        // Pause all audio when switching filters
        waveSurfers.forEach(ws => {
            if (ws.isPlaying()) {
                ws.pause();
            }
        });

        // Filter content
        contentItems.forEach(item => {
            item.classList.toggle('hidden', item.dataset.category !== filterValue);
        });
    });
});