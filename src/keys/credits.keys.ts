export const creditsKeys = {
  all: ["credits"],

  storeLinks: (search: string) => [...creditsKeys.all, 'store-links', search],

  playerCredits: () => [...creditsKeys.all, 'player'],
};
