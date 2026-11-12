const checkboxes = document.querySelectorAll('input[type="checkbox"]');

document.addEventListener('DOMContentLoaded', async () => {
    const prefs = await browser.storage.local.get({
        // we set all to on by default
        soundOpen: true,
        soundClose: true,
        soundFocus: true,
        soundUnfocus: true,
        soundMoved: true
    });

    checkboxes.forEach((checkbox) => {
        checkbox.checked = prefs[checkbox.id];
    });
});

checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
        browser.storage.local.set({
            [checkbox.id]: checkbox.checked
        });
    });
});
