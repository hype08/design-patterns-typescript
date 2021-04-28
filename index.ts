interface Pokemon {
  id: string;
  attack: number;
  defense: number;
}

interface BaseRecord {
  id: string;
}

interface Database<T extends BaseRecord> {
  set(newValue: T): void
  get(id: string): T
}

class InMemoryDb<T extends BaseRecord> implements Database<T>{
  private db: Record<string, T> = {};
  
  public set(newValue: T): void {
    this.db[newValue.id] = newValue;
  }

  public get(id: string): T {
    return this.db[id]
  }
}

const pokemonDb = new InMemoryDb<Pokemon>();

pokemonDb.set({
  id: 'Pikachu',
  attack: 50,
  defense: 10
})

console.log(pokemonDb.get("Pikachu"));