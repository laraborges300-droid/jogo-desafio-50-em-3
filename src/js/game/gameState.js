export const gameState = {
  foundCountries: new Set(),

  addCountry(countryCode) {
    if (this.foundCountries.has(countryCode)) {
      return false;
    }

    this.foundCountries.add(countryCode);

    return true;
  },

  reset() {
    this.foundCountries.clear();
  },

  getScore() {
    return this.foundCountries.size;
  },
};
