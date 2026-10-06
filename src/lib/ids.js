// Simple unique ids for friends and items. (crypto.randomUUID isn't available
// when testing on a phone over plain http, so we use a counter instead.)
let next = 1;
export const newId = () => `id${next++}`;
