// Simple LRU cache for bitmaps keyed by string. Evicts least-recently-used.
// Optimized for frequent get/set and limited memory usage.

export class LruCache {
	constructor(limit = 20) {
		this.limit = Math.max(1, limit);
		this.map = new Map(); // key -> { value, size }
		this.size = 0; // number of entries
	}

	get(key) {
		if (!this.map.has(key)) return undefined;
		const entry = this.map.get(key);
		// refresh recency
		this.map.delete(key);
		this.map.set(key, entry);
		return entry.value;
	}

	set(key, value) {
		if (this.map.has(key)) {
			this.map.delete(key);
			this.size -= 1;
		}
		this.map.set(key, { value });
		this.size += 1;
		this._evictIfNeeded();
	}

	has(key) {
		return this.map.has(key);
	}

	delete(key) {
		if (this.map.has(key)) {
			this.map.delete(key);
			this.size -= 1;
		}
	}

	clear() {
		this.map.clear();
		this.size = 0;
	}

	_evictIfNeeded() {
		while (this.size > this.limit) {
			// delete oldest (first inserted) item
			const oldestKey = this.map.keys().next().value;
			this.delete(oldestKey);
		}
	}
}

export const createBitmapCache = (limit = 20) => new LruCache(limit);


