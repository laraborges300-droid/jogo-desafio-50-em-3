
import { countries } from "./countries.js";
import { normalizeCountry } from "./normalizeCountry.js";

export function findCountry(userAnswer) {

    const normalizedAnswer = normalizeCountry(userAnswer);

    if (!normalizedAnswer) {
        return null;
    }

    const foundCountry = countries.find(country => {

        const acceptedNames = [
            country.name,
            ...country.aliases
        ];

        return acceptedNames.some(name =>
            normalizeCountry(name) === normalizedAnswer
        );

    });

    return foundCountry || null;
}
