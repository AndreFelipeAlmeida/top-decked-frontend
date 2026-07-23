export const formatosMD = [
  { id: 'MD1', name: 'Melhor de 1' },
  { id: 'MD3', name: 'Melhor de 3' },
  { id: 'MD5', name: 'Melhor de 5' },
];

export const nomeDoFormatoMD = (id: string | null | undefined) =>
  formatosMD.find((formato) => formato.id === id)?.name ?? id ?? '';
