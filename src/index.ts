import { RecordHandler, load } from './adapter'

type Listener<EventType> = (ev: EventType) => void;

// Observer - PubSub
function createObs<EventType>(): {
  subscribe: (listener: Listener<EventType>) => () => void;
  publish: (event: EventType) => void;
} {
  let listeners: Listener<EventType>[] = [];

  return {
    subscribe: (listener: Listener<EventType>): (() => void) => {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(l => l !== listener);
      };
    },
    publish: (ev: EventType) => {
      listeners.forEach(l => l(ev));
    },
  };
}

interface BeforeSetEvent<T> {
  value: T;
  newValue: T;
}

interface AfterSetEvent<T> {
  value: T;
}

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

  onBeforeAdd(listener: Listener<BeforeSetEvent<T>>): () => void;
  onAfterAdd(listener: Listener<AfterSetEvent<T>>): () => void;

  visit(visitor: (item: T) => void): void;
}

// Factory
function createDb<T extends BaseRecord>() {
  class InMemoryDb implements Database<T> {
    private db: Record<string, T> = {};

    // called on class itself, cant be called on instances of the class
    static instance: InMemoryDb = new InMemoryDb();

    private beforeAddListeners = createObs<BeforeSetEvent<T>>();
    private afterAddListeners = createObs<AfterSetEvent<T>>();

    public set(newValue: T): void {
      this.beforeAddListeners.publish({
        newValue,
        value: this.db[newValue.id],
      });
      this.db[newValue.id] = newValue;

      this.afterAddListeners.publish({
        value: newValue,
      });
    }

    public get(id: string): T | undefined {
      return this.db[id];
    }

    onBeforeAdd(listener: Listener<BeforeSetEvent<T>>): () => void {
      return this.beforeAddListeners.subscribe(listener);
    }
    onAfterAdd(listener: Listener<AfterSetEvent<T>>): () => void {
      return this.afterAddListeners.subscribe(listener);
    }

    // Visitor
    visit(visitor: (item: T) => void): void {
      Object.values(this.db).forEach(visitor);
    }

    // Strategy
    selectStrongest(scoreStrategy: (item: T) => number): T | undefined {
      const found: {
        max: number;
        item: T | undefined;
      } = {
        max: 0,
        item: undefined,
      };

      Object.values(this.db).reduce((f, item) => {
        const score = scoreStrategy(item);
        if (score > f.max) {
          f.max = score;
          f.item = item;
        }
        return f;
      }, found);

      return found.item;
    }
  }
  // // Singleton method 1
  // const db = new InMemoryDb();
  // return db;

  // Singleton method 2 with static method
  return InMemoryDb;
}

const PokemonDB = createDb<Pokemon>();

// Adapter : set incoming record
class PokemonDBAdapter implements RecordHandler<Pokemon> {
  addRecord(record: Pokemon) {
    PokemonDB.instance.set(record);
  }
}

load('./data.json', new PokemonDBAdapter)

const unsub = PokemonDB.instance.onAfterAdd(({ value }) => {
  console.log(value);
});

PokemonDB.instance.set({
  id: 'Pikachu',
  attack: 50,
  defense: 10,
});

unsub();

PokemonDB.instance.visit(item => {
  const { id, attack, defense } = item;
  console.log(`${id}: ${attack}/${defense}`);
});

const strongestAttack = PokemonDB.instance.selectStrongest(({ attack }) => attack);

console.log(`Strongest: ${strongestAttack?.id}`);