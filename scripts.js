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
        },
        {
            url: 'audio/main-menu-swim.mp3',
            title: 'Main Menu: Campaign of Water',
            genre: 'Game / Epic'
        },
        {
            url: 'audio/centurion.mp3',
            title: 'Centurion: Boss of the Arena',
            genre: 'Game / Epic'
        }
        // After adding a track, run: python3 tools/generate_peaks.py
    ];

    const videoData = [
        {
            id: '7tLFFcQvb1k',
            title: 'LOOKING FORWARD: From Vision Loss to the Paralympics 🏆 Documentary Short Film',
            description: 'Documentary / Sports'
        },
        {
            id: 'kvIvoc9aJ1g',
            title: 'The Gaze (2023) - Score Clip 1',
            description: 'Short Film / Drama'
        },
        {
            id: '6OGEWhuFCsU',
            title: 'The Gaze (2023) - Score Clip 2',
            description: 'Short Film / Drama'
        },
        {
            id: 'A4otF1ENM0k',
            title: 'The Gaze (2023) - Score Clip 3',
            description: 'Short Film / Drama'
        },
        {
            id: 'VYwNl2wS7fM',
            title: 'Guaranteed Income (2023) - Score Clip 1',
            description: 'Documentary / Drama'
        },
        {
            id: 'o3kIm_ze774',
            title: 'Guaranteed Income (2023) - Score Clip 2',
            description: 'Documentary / Drama'
        }
        // To add more videos, add a new object with the YouTube video ID and title
    ];

    // --- Render Dynamic Content ---
    const contentList = document.querySelector('.content-list');
    if (contentList) {
        audioData.forEach(audio => {
            const audioHTML = `
                <div class="track" data-category="audio" data-audio-src="${audio.url}">
                    <div class="track-info">
                        <div class="track-title">${audio.title}</div>
                        <div class="track-desc" data-genre="${audio.genre}">${audio.genre}</div>
                    </div>
                    <div class="audio-player">
                        <button class="play-btn" aria-label="Play ${audio.title}"></button>
                        <button class="restart-btn" aria-label="Restart ${audio.title}" disabled></button>
                        <div class="waveform-container"></div>
                    </div>
                </div>
            `;
            contentList.insertAdjacentHTML('beforeend', audioHTML);
        });

        videoData.forEach(video => {
            const videoHTML = `
                <div class="video-item" data-category="video">
                    <div class="video-info">
                        <div class="video-title">${video.title}</div>
                        <div class="video-desc">${video.description}</div>
                    </div>
                    <div class="video-embed-container" data-video-id="${video.id}" data-video-title="${video.title}"></div>
                </div>
            `;
            contentList.insertAdjacentHTML('beforeend', videoHTML);
        });
    }

    // --- Lightweight YouTube Embeds ---
    // Show a thumbnail until the visitor clicks, then swap in the real player.
    // This avoids loading YouTube's heavy player for every video on page load.
    const videoContainers = document.querySelectorAll('.video-embed-container');

    const showVideoThumbnail = (container) => {
        const { videoId, videoTitle } = container.dataset;
        container.innerHTML = `
            <button class="video-facade" aria-label="Play video: ${videoTitle}">
                <img src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="" loading="lazy">
                <span class="video-play-icon"></span>
            </button>
        `;
        container.querySelector('.video-facade').addEventListener('click', () => {
            container.innerHTML = `
                <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1"
                        title="${videoTitle}"
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        allowfullscreen></iframe>
            `;
        });
    };

    // Resetting a loaded player back to its thumbnail also stops playback
    const stopAllVideos = () => {
        videoContainers.forEach(container => {
            if (container.querySelector('iframe')) showVideoThumbnail(container);
        });
    };

    videoContainers.forEach(showVideoThumbnail);

    // Helper function to format time from seconds to MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const paddedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${minutes}:${paddedSeconds}`;
    };

    // --- WaveSurfer Initialization ---
    // Players are created the first time the Audio tab is opened. Waveforms are
    // drawn from precomputed peaks (audio/peaks.js), so each MP3 is only
    // downloaded when its play button is pressed.
    const waveSurfers = [];

    const initAudioPlayers = () => {
        if (waveSurfers.length > 0) return;

        // Cache computed styles to avoid re-calculating in the loop
        const computedStyles = getComputedStyle(document.documentElement);
        const waveColor = computedStyles.getPropertyValue('--secondary-text-color');
        const progressColor = computedStyles.getPropertyValue('--accent-color');
        const allPeaks = window.AUDIO_PEAKS || {};

        document.querySelectorAll('.track').forEach(track => {
            const container = track.querySelector('.waveform-container');
            const playBtn = track.querySelector('.play-btn');
            const restartBtn = track.querySelector('.restart-btn');
            const audioSrc = track.dataset.audioSrc;
            const trackDesc = track.querySelector('.track-desc');
            const trackTitle = track.querySelector('.track-title').textContent;
            const precomputed = allPeaks[audioSrc];

            const media = new Audio();
            media.preload = 'none';

            const waveSurfer = WaveSurfer.create({
                container: container,
                waveColor: waveColor,
                progressColor: progressColor,
                url: audioSrc,
                media: media,
                // Without precomputed peaks, WaveSurfer falls back to downloading and decoding the file
                peaks: precomputed ? [precomputed.peaks] : undefined,
                duration: precomputed ? precomputed.duration : undefined,
                barWidth: 2,
                barGap: 1,
                barRadius: 2,
                height: 50,
                cursorWidth: 0,
            });

            waveSurfers.push(waveSurfer);

            // Set a default volume (e.g., 80%)
            waveSurfer.setVolume(0.8);

            // When the waveform is ready, add the duration to the track description
            waveSurfer.on('ready', (duration) => {
                const formattedTime = formatTime(duration);
                const genre = trackDesc.dataset.genre;
                trackDesc.textContent = `${genre} - ${formattedTime}`;
            });

            playBtn.onclick = () => waveSurfer.playPause();
            // Jump back to the start and play, whether currently playing or paused
            restartBtn.onclick = () => waveSurfer.play(0);
            waveSurfer.on('play', () => {
                playBtn.classList.add('playing');
                playBtn.setAttribute('aria-label', `Pause ${trackTitle}`);
                restartBtn.disabled = false;
                // Only one track plays at a time
                waveSurfers.forEach(other => {
                    if (other !== waveSurfer) other.pause();
                });
            });
            waveSurfer.on('pause', () => {
                playBtn.classList.remove('playing');
                playBtn.setAttribute('aria-label', `Play ${trackTitle}`);
            });
        });
    };

    // --- Filter Logic ---
    // Hidden items get the `hidden` attribute so they are removed from
    // the layout, tab order and screen readers, not just visually collapsed.
    const setupFilter = (controls, items, onChange) => {
        if (!controls) return;

        controls.addEventListener('click', (e) => {
            const clickedButton = e.target.closest('.filter-btn');
            if (!clickedButton) return;

            const filterValue = clickedButton.dataset.filter;

            // Update active button state (aria-pressed tells screen readers which tab is on)
            const previousButton = controls.querySelector('.active');
            previousButton.classList.remove('active');
            previousButton.setAttribute('aria-pressed', 'false');
            clickedButton.classList.add('active');
            clickedButton.setAttribute('aria-pressed', 'true');

            items.forEach(item => {
                item.hidden = item.dataset.category !== filterValue;
            });

            // Runs after the new tab is visible, so players are created at full width
            if (onChange) onChange(filterValue);
        });

        // Simulate a click on the default active filter button
        const defaultFilter = controls.querySelector('.filter-btn.active');
        if (defaultFilter) {
            defaultFilter.click();
        }
    };

    // Selected Works: pause whatever is playing when switching tabs
    setupFilter(
        document.querySelector('#music .filter-controls'),
        document.querySelectorAll('.content-list > div'),
        (filterValue) => {
            waveSurfers.forEach(ws => ws.pause());
            stopAllVideos();
            if (filterValue === 'audio') initAudioPlayers();
        }
    );

    // Behind the Scenes
    setupFilter(
        document.querySelector('.gallery-filters'),
        document.querySelectorAll('.gallery-content > div')
    );
});
