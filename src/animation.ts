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
 * Translate each element in a list vertically in an easing motion
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
  let currentTimestamp: number | null = null;

  function frame(timestamp: number) {
    if (!currentTimestamp) {
      currentTimestamp = timestamp;
    }

    const elapsed = timestamp - currentTimestamp;

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

    if (elapsed < duration) {
      window.requestAnimationFrame(frame);
    }
  }

  window.requestAnimationFrame(frame);
};

/**
 * Creates a particle animation on a canvas
 * @param canvas (HTMLCanvasElement)
 * @param numberOfStars (number)
 * @param parentElement (HTMLElement)
 */
export const animateCanvas = (
  canvas: HTMLCanvasElement,
  numberOfStars: number,
  parentElement: HTMLElement
) => {
  canvas.style.width = `${parentElement.offsetWidth}px`;
  canvas.style.height = `${parentElement.offsetHeight}px`;
  canvas.width = parentElement.offsetWidth;
  canvas.height = parentElement.offsetHeight;
  const randomInt = (max: number, min: number): number => {
    return Math.floor(Math.random() * (max - min) + min);
  };
  const colors = [
    "#FF5400",
    "#0077B6",
    "#FF6D00",
    "#0096C7",
    "#FF8500",
    "#00B4D8",
  ];
  const stars = Array<Star>();
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  class Star {
    private x: number;
    private y: number;
    private radius: number;
    private deltaX: number;
    private color: string;

    constructor(x?: number, y?: number, radius?: number, color?: string) {
      this.x = x || randomInt(canvas.offsetWidth, 0);
      this.y = y || randomInt(canvas.offsetHeight, 0);
      this.radius = radius || Math.random() * 1.1;
      this.color = color || colors[randomInt(colors.length - 1, 0)];
      this.deltaX = Math.random() * 0.3;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.shadowBlur = randomInt(12, 3);
      ctx.shadowColor = this.color;
      ctx.strokeStyle = this.color;
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    }

    createNewStar(stars: Array<Star> = Array<Star>()) {
      const index = stars.indexOf(this);
      stars.splice(index, 1);
      stars.push(new Star(-5));
    }

    update(stars: Array<Star> = Array<Star>()) {
      this.x - this.radius > canvas.offsetWidth && this.createNewStar(stars);
      this.x += this.deltaX;
      this.draw();
    }
  }

  const initialize = () => {
    for (let index = 0; index < numberOfStars; index++) {
      stars.push(new Star());
    }
  };

  window.addEventListener("resize", () => {
    canvas.style.width = `${parentElement.offsetWidth}px`;
    canvas.style.height = `${parentElement.offsetHeight}px`;
    canvas.width = parentElement.offsetWidth;
    canvas.height = parentElement.offsetHeight;
    stars.splice(0, stars.length);
    initialize();
  });

  function frame() {
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    ctx.fillStyle = "#00001e";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    stars.forEach((star: Star) => star.update(stars));
    requestAnimationFrame(frame);
  }

  initialize();
  requestAnimationFrame(frame);
};
