import { translateElements } from "./animation";

/**
 * Type narrows an object 
 * @param item (T | undefined | null): object to check
 * @returns item is T
 */
const isDefinedType = <T>(item: T | null | undefined): item is T => {
    return item !== null && item !== undefined;
};

/**
 * Limits a function call to once per wait interval.
 * @param func (Function): Function to apply throttle
 * @param wait (number): Interval in ms the function must wait before being able to be called again
 * @returns function
 */
const throttle = (func: Function, wait: number = 500): Function => {
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
    }
};

/**
 * Finds the index of a hash and calculates the displacement (by percentage) based off of index location
 * @param sectionOrder (Array<string>): List of hashes
 * @param currentSection (string): Hash in list
 * @returns percentage displaced (number)
 */
const calculateDisplacementByHash = (sectionOrder: Array<string>, currentSection: string): number => {
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
 * Performs UI changes for when hash fragment changes
 * @param sections (Array<HTMLElement>)
 * @param sideNavLinks (NodeListOf<HTMLElement>)
 * @returns void
 */
const handleTransition = (sections: Array<HTMLElement>, sideNavLinks: NodeListOf<HTMLElement>): void => {
    const sectionIds = getElementIds(sections);
    const currentLocation = window.location.hash.substring(1).concat('-id');
    const newPosition = calculateDisplacementByHash(sectionIds, currentLocation);
    const oldPosition = calculateDisplacementByElement(sections[0]);
    const newPositionIndex = sectionIds.indexOf(currentLocation);
    
    // Update side navigation
    sideNavLinks.forEach((element: HTMLElement) => {
        if (element.className === 'active') {
            element.removeAttribute('class');
            return;
        }
    });

    sideNavLinks[newPositionIndex].setAttribute('class', 'active');

    // Move elements to new location
    translateElements(sections, 1200, oldPosition, newPosition);
};

/** Initialization */
const sections: Array<HTMLElement> = ['landing-id', 'about-id', 'skills-id', 'contact-id'].map((elementId: string) => {
   return document.getElementById(elementId);
}).filter(isDefinedType);
const sideNavLinks = document.querySelectorAll<HTMLElement>('#side-nav > a');
window.location.hash = '#landing';

/** Event listeners */
window.addEventListener('hashchange', () => handleTransition(sections, sideNavLinks));