import { translateElements } from "./animation";

interface AppHtmlElements {
  mainContent: Array<HTMLElement>;
  sideNavLinks: NodeListOf<HTMLElement>;
  menuContent: HTMLElement;
  menuButton: HTMLElement;
}

interface Point {
  x: number | null;
  y: number | null;
}

/**
 * Type narrows an object
 * @param item (T | undefined | null): object to check
 * @returns item is T
 */
const isDefinedType = <T>(item: T | null | undefined): item is T => {
  return item !== null && item !== undefined;
};

/**
 * Gets an HTMLElement based off of it's id
 * @param elementId (string)
 * @returns HTMLElement
 */
const getSingleElement = (elementId: string): HTMLElement => {
  return [elementId]
    .map((elementId: string) => {
      return document.getElementById(elementId);
    })
    .filter(isDefinedType)[0];
};

/**
 * Limits a function call to once per wait interval.
 * @param func (Function): Function to apply throttle
 * @param wait (number): Interval in ms the function must wait before being able to be called again
 * @returns function
 */
const throttle = (func: Function, wait: number = 500) => {
  let isThrottled: boolean = false;
  return function (this: any) {
    const context = this;
    const args = arguments;

    if (isThrottled) {
      return;
    }

    isThrottled = true;
    func.apply(context, args);

    // Reset boolean to true after wait has been reached from the last function call
    const lastFunctionCall = setTimeout(() => {
      isThrottled = false;
      clearInterval(lastFunctionCall);
    }, wait);
  };
};

/**
 * Finds the index of a hash and calculates the displacement (by percentage) based off of index location
 * @param sectionOrder (Array<string>): List of hashes
 * @param currentSection (string): Hash in list
 * @returns percentage displaced (number)
 */
const calculateDisplacementByHash = (
  sectionOrder: Array<string>,
  currentSection: string
): number => {
  const currentSectionIndex = sectionOrder.indexOf(currentSection);
  let finalValue = 0;

  if (currentSectionIndex > 0) {
    finalValue = currentSectionIndex * -100;
  }

  return finalValue;
};

/**
 * Calculates the vertical displacement, gets the height and calculates the distance (by percentage) displaced from original location
 * @param section (HTMLElement)
 * @returns percentage displaced (number)
 */
const calculateDisplacementByElement = (section: HTMLElement): number => {
  const style = window.getComputedStyle(section);
  const matrix = new DOMMatrix(style.transform);
  const height = section.offsetHeight;

  return Math.round((matrix.m42 / height) * 100);
};

/**
 * Gets all the id's of elements in an array
 * @param sections (Array<HTMLElement>)
 * @returns Array<string>
 */
const getElementIds = (sections: Array<HTMLElement>): Array<string> => {
  return sections.map((element: HTMLElement) => element.id);
};

/**
 * Toggles 'active' class on menu elements
 * @param menu (HTMLElement)
 * @param menuButton (HTMLElement)
 * @returns void
 */
const toggleMenu = (menu: HTMLElement, menuButton: HTMLElement): void => {
  menu.classList.toggle("active");
  menuButton.classList.toggle("active");
};

/**
 * Handles Keyboard, Wheel, and Touch UIEvents
 * @param event (UIEvent)
 * @param param1 (AppHtmlElements)
 * @param initialContact (Point)
 * @returns void
 */
const handleUIEvent = <UIEvent>(
  event: UIEvent,
  { mainContent, menuButton }: AppHtmlElements,
  initialContact: Point
) => {
  const sectionIds = getElementIds(mainContent);
  const calculateNextHash = (
    sectionIds: Array<string>,
    direction: 1 | -1
  ): string => {
    const currentLocationIndex = sectionIds.indexOf(
      window.location.hash.substring(1).concat("-id")
    );
    let nextLocationHash: string = "#landing";

    if (
      currentLocationIndex !== -1 &&
      currentLocationIndex + direction < sectionIds.length &&
      currentLocationIndex + direction > -1
    ) {
      nextLocationHash = `#${sectionIds[
        currentLocationIndex + direction
      ].substring(0, sectionIds[currentLocationIndex + direction].length - 3)}`;
    }

    return nextLocationHash;
  };

  if (menuButton.classList.contains("active")) {
    return;
  }

  if (event instanceof KeyboardEvent) {
    switch (event.key) {
      case "ArrowUp":
      case "w":
      case "W":
        window.location.hash = calculateNextHash(sectionIds, -1);
        break;
      case "ArrowDown":
      case "s":
      case "S":
        window.location.hash = calculateNextHash(sectionIds, 1);
        break;
    }
  } else if (event instanceof WheelEvent) {
    if (event.deltaY < 0) {
      window.location.hash = calculateNextHash(sectionIds, -1);
    } else if (event.deltaY > 0) {
      window.location.hash = calculateNextHash(sectionIds, 1);
    }
  } else if (event instanceof TouchEvent) {
    if (!!!initialContact.x || !!!initialContact.y) {
      return;
    }

    const xFinalTouch = event.touches[0].clientX;
    const yFinalTouch = event.touches[0].clientY;

    const xTouchDifference = xFinalTouch - initialContact.x;
    const yTouchDifference = yFinalTouch - initialContact.y;

    if (Math.abs(xTouchDifference) < Math.abs(yTouchDifference)) {
      if (yTouchDifference > 0) {
        window.location.hash = calculateNextHash(sectionIds, -1);
      } else if (yTouchDifference < 0) {
        window.location.hash = calculateNextHash(sectionIds, 1);
      }
    }

    initialContact.x = null;
    initialContact.y = null;
  }
};

/**
 * Performs UI changes for when hash fragment changes
 * @param sections (Array<HTMLElement>)
 * @param sideNavLinks (NodeListOf<HTMLElement>)
 * @returns void
 */
const handleTransition = ({
  mainContent,
  sideNavLinks,
  menuContent,
  menuButton,
}: AppHtmlElements): void => {
  const sectionIds = getElementIds(mainContent);
  const currentLocation = window.location.hash.substring(1).concat("-id");
  const newPosition = calculateDisplacementByHash(sectionIds, currentLocation);
  const oldPosition = calculateDisplacementByElement(mainContent[0]);
  const newPositionIndex = sectionIds.indexOf(currentLocation);

  // Make sure hash is valid

  // Update side navigation
  sideNavLinks.forEach((element: HTMLElement) => {
    if (element.className === "active") {
      element.removeAttribute("class");
      return;
    }
  });

  // Close menu navigation
  menuContent.classList.remove("active");
  menuButton.classList.remove("active");
  sideNavLinks[newPositionIndex].setAttribute("class", "active");

  // Move elements to new location
  translateElements(mainContent, 1200, oldPosition, newPosition);
};

/** Initialization */
const appHtmlElements: AppHtmlElements = {
  mainContent: ["landing-id", "about-id", "skills-id", "contact-id"]
    .map((elementId: string) => {
      return document.getElementById(elementId);
    })
    .filter(isDefinedType),
  sideNavLinks: document.querySelectorAll<HTMLElement>("#side-nav > a"),
  menuContent: getSingleElement("menu-dropdown"),
  menuButton: getSingleElement("menu-button"),
};

const initialContactPoint: Point = {
  x: null,
  y: null,
};

const throttleTime: number = 1200;

window.location.hash = "#landing";

/** Event listeners */
window.addEventListener("hashchange", () => handleTransition(appHtmlElements));

appHtmlElements.menuButton.addEventListener("click", () =>
  toggleMenu(appHtmlElements.menuContent, appHtmlElements.menuButton)
);

window.addEventListener("touchstart", (event: TouchEvent) => {
  initialContactPoint.x = event.touches[0].clientX;
  initialContactPoint.y = event.touches[0].clientY;
});

window.addEventListener(
  "touchmove",
  throttle((event: TouchEvent) => {
    handleUIEvent<TouchEvent>(event, appHtmlElements, initialContactPoint);
  }, throttleTime),
  { passive: false }
);

window.addEventListener(
  "keydown",
  throttle((event: KeyboardEvent) => {
    event.preventDefault();
    handleUIEvent<KeyboardEvent>(event, appHtmlElements, initialContactPoint);
  }, throttleTime)
);

window.addEventListener(
  "wheel",
  throttle((event: WheelEvent) => {
    event.preventDefault();
    handleUIEvent<WheelEvent>(event, appHtmlElements, initialContactPoint);
  }, throttleTime),
  { passive: false }
);
