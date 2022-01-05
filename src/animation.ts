/**
 * Cubic easing in/out function, equation provided by Robert Penner.
 * @param currentTime (number): Value between 0 and duration
 * @param startValue (number): Position value, not related to the time
 * @param change (number): Difference between the startValue and where the value stops
 * @param duration (number): Length of easing
 * @returns updated position value based off time
 */
const cubicEasingInOut = (currentTime: number, startValue: number, change: number, duration: number): number => {
    currentTime /= duration / 2;
    if (currentTime < 1) {
        return change / 2 * currentTime * currentTime * currentTime + startValue;
    }
    currentTime -= 2;
    return change / 2 * (currentTime * currentTime * currentTime + 2) + startValue;
};

/**
 * Translate each element in a list vertically in an easing motion
 * @param sections (Array<HTMLElement>): List of elements
 * @param duration (number): Time to go from previous section to next section
 * @param oldPosition (number): Displacement (by percentage) of element leaving
 * @param newPosition (number): Displacement (by percentage) of element going to
 */
export const translateElements = (sections: Array<HTMLElement>, duration: number, oldPosition: number, newPosition: number): void => {
    let currentTimestamp: number | null = null;

    function frame(timestamp: number) {
        if (!currentTimestamp) {
            currentTimestamp = timestamp; 
        }

        const elapsed = timestamp - currentTimestamp;

        const nextPosition = Math.min(cubicEasingInOut(elapsed, oldPosition, newPosition - oldPosition, duration), 0);
        sections.forEach((section: HTMLElement) => {
            section.style.transform = `translateY(${nextPosition}%)`;
        });

        if (elapsed < duration) {
            window.requestAnimationFrame(frame);
        }
    }

    window.requestAnimationFrame(frame);
};