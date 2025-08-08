const lessOneSecond = (timeString) => {
    let [minutes, seconds] = timeString.split(":");
    minutes = +minutes;
    seconds = +seconds;
    if (minutes > 0 || seconds > 0) {
        seconds -= 1;
    }
    if (seconds < 0) {
        seconds = 59
        minutes -= 1
    }
    return `${(""+minutes).padStart(2, '0')}:${(""+seconds).padStart(2, '0')}`
}

$(window).on("sm.passage.shown", (e, { passage }) => {
    for (const t of document.querySelectorAll(".onscreentimer")) {
        setInterval(() => {
            if (t) {
                t.innerHTML = lessOneSecond(t.innerHTML);
            }
        }, 1000);
    }
});