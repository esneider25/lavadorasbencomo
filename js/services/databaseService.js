// Generic Realtime Database CRUD service factory
import { db } from '../firebase-config.js';
import {
  ref,
  push,
  get,
  set,
  update,
  remove,
  onValue,
  query,
  orderByChild,
  equalTo,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js';

/**
 * Applies filters client-side on an array of records.
 * Supports operators: ==, !=, >, <, >=, <=, in, array-contains
 */
function applyFilters(data, filters) {
  if (!filters || filters.length === 0) return data;

  return data.filter((item) => {
    return filters.every((f) => {
      const val = item[f.field];
      switch (f.op) {
        case '==': return val === f.value;
        case '!=': return val !== f.value;
        case '>': return val > f.value;
        case '<': return val < f.value;
        case '>=': return val >= f.value;
        case '<=': return val <= f.value;
        case 'in': return Array.isArray(f.value) && f.value.includes(val);
        case 'array-contains': return Array.isArray(val) && val.includes(f.value);
        default: return true;
      }
    });
  });
}

/**
 * Sorts an array of records by a field
 */
function applySort(data, sortField, sortDirection) {
  return [...data].sort((a, b) => {
    const aVal = a[sortField] ?? 0;
    const bVal = b[sortField] ?? 0;

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Converts a Realtime Database snapshot into an array of objects with `id`
 */
function snapshotToArray(snapshot) {
  const results = [];
  if (!snapshot.exists()) return results;

  snapshot.forEach((child) => {
    results.push({ id: child.key, ...child.val() });
  });
  return results;
}

/**
 * Creates a CRUD service for a Realtime Database path
 */
export function createService(collectionName) {
  const collectionRef = ref(db, collectionName);

  return {
    /** Add a new record with auto-generated ID */
    async add(data) {
      const newRef = push(collectionRef);
      const now = Date.now();
      const record = {
        ...data,
        creado_en: now,
        actualizado_en: now,
      };
      await set(newRef, record);
      return { id: newRef.key, ...record };
    },

    /** Get a single record by ID */
    async getById(id) {
      const snap = await get(ref(db, `${collectionName}/${id}`));
      if (!snap.exists()) return null;
      return { id: snap.key, ...snap.val() };
    },

    /** Get all records, sorted */
    async getAll(sortField = 'creado_en', sortDirection = 'desc') {
      const snap = await get(collectionRef);
      const data = snapshotToArray(snap);
      return applySort(data, sortField, sortDirection);
    },

    /** Query records with filters (applied client-side) */
    async query(filters = [], sortField = 'creado_en', sortDirection = 'desc', maxResults = 100) {
      const snap = await get(collectionRef);
      let data = snapshotToArray(snap);
      data = applyFilters(data, filters);
      data = applySort(data, sortField, sortDirection);
      return data.slice(0, maxResults);
    },

    /** Update a record */
    async update(id, data) {
      const updates = {
        ...data,
        actualizado_en: Date.now(),
      };
      await update(ref(db, `${collectionName}/${id}`), updates);
      return { id, ...updates };
    },

    /** Delete a record */
    async delete(id) {
      await remove(ref(db, `${collectionName}/${id}`));
    },

    /** Subscribe to real-time changes (entire collection) */
    subscribe(callback, filters = [], sortField = 'creado_en', sortDirection = 'desc') {
      const unsubscribe = onValue(collectionRef, (snap) => {
        let data = snapshotToArray(snap);
        data = applyFilters(data, filters);
        data = applySort(data, sortField, sortDirection);
        callback(data);
      });
      // onValue returns an unsubscribe function
      return unsubscribe;
    },

    /** Convert a Date to a numeric timestamp (millis) for storage */
    toTimestamp(date) {
      const d = date instanceof Date ? date : new Date(date);
      return d.getTime();
    },
  };
}
