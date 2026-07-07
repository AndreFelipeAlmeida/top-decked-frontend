export const storeKeys = {
  all: ["store"],

  mine: (id: number | undefined) => [...storeKeys.all, 'mine', id],

  list: () => [...storeKeys.all, 'list'],
};
