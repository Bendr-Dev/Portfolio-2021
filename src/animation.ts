/**
 * Cubic easing in/out function, equation provided by Robert Penner.
 * @param currentTime (number): Value between 0 and duration
 * @param startValue (number): Position value, not related to the time
 * @param change (number): Difference between the startValue and where the value stops
 * @param duration (number): Length of easing
 * @returns updated position value based off time
 */
const cubicEasingInOut = (
  currentTime: number,
  startValue: number,
  change: number,
  duration: number
): number => {
  currentTime /= duration / 2;
  if (currentTime < 1) {
    return (change / 2) * currentTime * currentTime * currentTime + startValue;
  }
  currentTime -= 2;
  return (
    (change / 2) * (currentTime * currentTime * currentTime + 2) + startValue
  );
};

/**
 * Translates child elements
 * @param section (HTMLElement): Parent element
 * @param value (number): Value of translation on x-axis in percentage
 * @param borderWidth (number): Width value in rem
 * @param coverHeight (number): Height of photo overlay in percentage
 */
const translateChildContentElements = (
  section: HTMLElement,
  value: number,
  borderWidth: number,
  coverHeight: number
) => {
  for (const firstLevelChild of section.children) {
    if (firstLevelChild.classList.contains("content")) {
      for (const secondLevelChild of firstLevelChild.children) {
        if (!secondLevelChild.classList.contains("border")) {
          (
            secondLevelChild as HTMLElement
          ).style.transform = `translateX(${value}%)`;
        } else {
          (secondLevelChild as HTMLElement).style.width = `${borderWidth}rem`;
        }
      }
    } else if (firstLevelChild.classList.contains("photo-content")) {
      for (const secondLevelChild of firstLevelChild.children) {
        if (secondLevelChild.classList.contains("cover")) {
          (secondLevelChild as HTMLElement).style.height = `${coverHeight}%`;
        }
      }
    }
  }
};

/**
 * Translates elements in an easing motion
 * @param sections (Array<HTMLElement>): List of elements
 * @param duration (number): Time to go from previous section to next section
 * @param oldPosition (number): Displacement (by percentage) of element leaving
 * @param newPosition (number): Displacement (by percentage) of element going to
 */
export const translateElements = (
  sections: Array<HTMLElement>,
  duration: number,
  oldPosition: number,
  newPosition: number
): void => {
  const currentLocationIndex = Math.round(Math.abs(newPosition / 100));
  let isBreakpoint = false;
  let isCalled = false;
  let currentTimestamp: number | null = null;

  translateChildContentElements(sections[currentLocationIndex], -150, 0, 100);

  function frame(timestamp: number) {
    if (!currentTimestamp) {
      currentTimestamp = timestamp;
    }

    const elapsed = timestamp - currentTimestamp;

    if (elapsed >= duration / 3 && !isBreakpoint) {
      isBreakpoint = true;
    }

    const nextPosition = Math.min(
      cubicEasingInOut(
        elapsed,
        oldPosition,
        newPosition - oldPosition,
        duration
      ),
      0
    );
    sections.forEach((section: HTMLElement) => {
      section.style.transform = `translateY(${nextPosition}%)`;
    });

    if (!isCalled && isBreakpoint) {
      sections[currentLocationIndex].classList.add("active");
      translateChildContentElements(sections[currentLocationIndex], 0, 5, 0);
      isCalled = true;
    }

    if (elapsed < duration) {
      window.requestAnimationFrame(frame);
    }
  }

  window.requestAnimationFrame(frame);
};
