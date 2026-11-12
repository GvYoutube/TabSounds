// init web cont.
let audioCtx = null;
const soundBuffers = {};

async function loadSoundIntoBuffer(soundKey, soundFile) {
    if (!audioCtx) {
        audioCtx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    }

    if (soundBuffers[soundKey]) {
        return soundBuffers[soundKey];
    }

    try {
        const url = browser.runtime.getURL(`sounds/${soundFile}`);
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        soundBuffers[soundKey] = audioBuffer;
        return audioBuffer;
    } catch (err) {
        console.error(`Failed to load sound ${soundFile}:`, err);
        return null;
    }
}

async function playSound(soundKey, soundFile) {
    const settings = await browser.storage.local.get({
        [soundKey]: true
    });

    if (!settings[soundKey]) return;

    if (!audioCtx) {
        audioCtx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    }

    // Resume context if suspended
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    let buffer = soundBuffers[soundKey];
    if (!buffer) {
        buffer = await loadSoundIntoBuffer(soundKey, soundFile);
    }

    if (buffer) {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
    }
}

// listeners
browser.tabs.onCreated.addListener(() => {
    playSound('soundOpen', 'tabOpen.wav');
});

browser.tabs.onRemoved.addListener(() => {
    playSound('soundClose', 'tabClose.wav');
});

browser.tabs.onActivated.addListener((activeInfo) => {
    playSound('soundFocus', 'tabFocus.wav');
});

let lastActiveTabId = null;
browser.tabs.onActivated.addListener((activeInfo) => {
    if (lastActiveTabId && lastActiveTabId !== activeInfo.tabId) {
        playSound('soundUnfocus', 'tabUnfocus.wav');
    }
    lastActiveTabId = activeInfo.tabId;
});

browser.tabs.onMoved.addListener(() => {
    playSound('soundMoved', 'tabMoved.wav');
});
