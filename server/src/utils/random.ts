export function pickRandomItem<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('Cannot pick a random item from an empty collection');
  }

  const index = Math.floor(Math.random() * items.length);
  const selected = items[index];

  if (selected === undefined) {
    return items[0] as T;
  }

  return selected;
}
