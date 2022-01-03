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
 * @returns void
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

const calculatePosition = (sectionOrder: Array<string>, currentSection: string): number => {
    const currentSectionIndex = sectionOrder.indexOf(currentSection);
    let finalValue = 0;

    if (currentSectionIndex > 0) {
        finalValue = currentSectionIndex * -100;
    }

    return finalValue;
};

const calculateTransform = (section: HTMLElement): number => {
    const style = window.getComputedStyle(section);
    const matrix = new DOMMatrix(style.transform);
    const height = section.offsetHeight;

    return Math.round((matrix.m42 / height) * 100);
};

const getElementIds = (sections: Array<HTMLElement>): string[] => {
    return sections.map((element: HTMLElement) => element.id);
};

const handleTransition = (sections: Array<HTMLElement>): void => {
    const sectionIds = getElementIds(sections);
    const currentLocation = window.location.hash.substring(1).concat('-id');
    const newPosition = calculatePosition(sectionIds, currentLocation);
    const oldPosition = calculateTransform(sections[0]);

    translateElements(sections, 1200, oldPosition, newPosition);
};

/** Initialization */
const sections: Array<HTMLElement> = ['landing-id', 'about-id', 'skills-id', 'contact-id'].map((elementId: string) => {
   return document.getElementById(elementId);
}).filter(isDefinedType);
window.location.hash = '#landing';

/** Event listeners */
window.addEventListener('hashchange', () => handleTransition(sections));