type ParseUserSession<T> = (value: unknown) => T;

const hasStoredValue = (value: string | null): value is string => {
    return value !== null && value !== '' && value !== 'null' && value !== 'undefined';
};

const safeParseJSON = <T>(value: string): T | null => {
    try {
        return JSON.parse(value) as T;
    } catch (error) {
        console.warn('Invalid JSON value:', error);
        return null;
    }
};

class SesionStorage<T = unknown> {
    item: string;
    value: T | null;

    constructor(key = '', initValue: T | null = null, parseUserSesion: ParseUserSession<T> | null = null) {
        this.item = key;
        this.value = initValue;

        const raw = sessionStorage.getItem(this.item);
        if (!hasStoredValue(raw)) {
            return;
        }

        const parsed = safeParseJSON<unknown>(raw);
        if (parsed === null) {
            return;
        }

        this.value = parseUserSesion ? parseUserSesion(parsed) : (parsed as T);
    }

    save(): void {
        sessionStorage.setItem(this.item, JSON.stringify(this.value));
    }

    update(newValue: T | null = null): void {
        this.value = newValue;
        this.save();
    }

    delete(): void {
        sessionStorage.removeItem(this.item);
        this.value = null;
    }
}

class BoxStorage<T = unknown> {
    item: string;
    value: T | null;

    constructor(key = '', initValue: T | null = null) {
        this.item = key;
        this.value = initValue;

        const raw = localStorage.getItem(this.item);
        if (!hasStoredValue(raw)) {
            return;
        }

        const parsed = safeParseJSON<T>(raw);
        this.value = parsed ?? initValue;
    }

    save(): void {
        localStorage.setItem(this.item, JSON.stringify(this.value));
    }

    update(newValue: T | null = null): void {
        this.value = newValue;
        this.save();
    }

    delete(): void {
        localStorage.removeItem(this.item);
        this.value = null;
    }
}

class BoxCollectionStorage {
    private static instance: BoxCollectionStorage | null = null;
    private collections: Map<string, BoxStorage<unknown>>;

    private constructor() {
        this.collections = new Map<string, BoxStorage<unknown>>();
        this.loadStorage();
    }

    static getInstance(): BoxCollectionStorage {
        if (!BoxCollectionStorage.instance) {
            BoxCollectionStorage.instance = new BoxCollectionStorage();
        }
        return BoxCollectionStorage.instance;
    }

    private loadStorage(): void {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) {
                continue;
            }

            const raw = localStorage.getItem(key);
            const parsed = hasStoredValue(raw) ? safeParseJSON<unknown>(raw) : null;
            this.addCollection(key, parsed);
        }
    }

    addCollection(name = '', defaultValue: unknown = null): BoxStorage<unknown> {
        if (!this.collections.has(name)) {
            const box = new BoxStorage(name, defaultValue);
            box.save();
            this.collections.set(name, box);
        }

        return this.collections.get(name) as BoxStorage<unknown>;
    }

    getCollection(name = ''): BoxStorage<unknown> | undefined {
        return this.collections.get(name);
    }

    removeCollection(name = ''): boolean {
        const box = this.collections.get(name);
        if (!box) {
            return false;
        }

        box.delete();
        this.collections.delete(name);
        return true;
    }

    getCollectionNames(): string[] {
        return Array.from(this.collections.keys());
    }

    hasCollection(name = ''): boolean {
        return this.collections.has(name);
    }

    clearAll(): void {
        for (const collection of this.collections.values()) {
            collection.delete();
        }
        this.collections.clear();
    }
}

export { SesionStorage, BoxStorage, BoxCollectionStorage };
