export let aminId;

export default function animate({timing, draw, duration}) {
    let start = performance.now();

    aminId = requestAnimationFrame(function animate(time) {
        let timeFraction = (time - start) / duration;
        if (timeFraction > 1) timeFraction = 1;

        let progress = timing(timeFraction);

        draw(progress);

        if (timeFraction < 1) {
            aminId = requestAnimationFrame(animate);
        }

    });
}

