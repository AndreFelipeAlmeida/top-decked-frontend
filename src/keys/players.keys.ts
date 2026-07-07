export const playersKeys = {
  all: ["players"],

  lists: () => [...playersKeys.all, 'list'],

  list: (page: number, search: string) => [...playersKeys.lists(), page, search],

  detail: (id: number | undefined) => [...playersKeys.all, 'detail', id],

  statistics: () => [...playersKeys.all, 'statistics'],

  byOrganizer: () => [...playersKeys.all, 'by-organizer'],

  impactoTrocaGameId: (tcg: string) => [...playersKeys.all, 'impacto-troca-gameid', tcg],
};
