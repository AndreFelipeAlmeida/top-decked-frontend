export const playertypesKeys = {
  all: ["player-types"],

  lists: () => [
    ...playertypesKeys.all,
    'list'
  ],

  list: (search?: unknown) => [
    ...playertypesKeys.lists(),
    search
  ],

  detail: (id: number) => [
    ...playertypesKeys.all,
    'detail',
    id
  ],
};