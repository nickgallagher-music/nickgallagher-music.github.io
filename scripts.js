document.addEventListener('DOMContentLoaded', () => {
    const tracks = document.querySelectorAll('.track');

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
});