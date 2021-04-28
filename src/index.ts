
// Observer - PubSub


interface Pokemon {
  id: string;
  attack: number;
  defense: number;
}

interface BaseRecord {
  id: string;
}

interface Database<T extends BaseRecord> {
  set(newValue: T): void;
  get(id: string): T | undefined;
}

// Factory
function createDb<T extends BaseRecord>() {
  class InMemoryDb implements Database<T> {
    private db: Record<string, T> = {};

    // called on class itself, cant be called on instances of the class
    static instance:InMemoryDb = new InMemoryDb();

    public set(newValue: T): void {
      this.db[newValue.id] = newValue;
    }

    public get(id: string): T | undefined {
      return this.db[id];
    }
  }
    // // Singleton method 1
    // const db = new InMemoryDb();
    // return db;

  // Singleton method 2 with static method
  return InMemoryDb;
}

const pokemonDB = createDb<Pokemon>();

pokemonDB.instance.set({
  id: "Pikachu",
  attack: 50,
  defense: 10,
});

console.log(pokemonDB.instance.get("Pikachu"));
