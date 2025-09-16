'use client';

// Advanced Data Management System for Lester's Arcade
// This file contains comprehensive data storage, caching, and synchronization

export interface DataStore {
  id: string;
  name: string;
  type: DataStoreType;
  data: Map<string, any>;
  version: number;
  lastModified: number;
  maxSize: number;
  compression: boolean;
  encryption: boolean;
  persistence: boolean;
  cache: Map<string, CacheEntry>;
  indexes: Map<string, DataIndex>;
  queries: Map<string, Query>;
  subscriptions: Map<string, Subscription>;
  events: DataEvent[];
  enabled: boolean;
  
  init(): Promise<void>;
  destroy(): void;
  set(key: string, value: any): Promise<void>;
  get(key: string): Promise<any>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  values(): Promise<any[]>;
  entries(): Promise<[string, any][]>;
  size(): Promise<number>;
  export(): Promise<string>;
  import(data: string): Promise<void>;
  backup(): Promise<string>;
  restore(backup: string): Promise<void>;
  sync(): Promise<void>;
  query(query: Query): Promise<any[]>;
  subscribe(key: string, callback: (value: any) => void): string;
  unsubscribe(id: string): void;
  createIndex(name: string, fields: string[]): DataIndex;
  removeIndex(name: string): void;
  getIndex(name: string): DataIndex | undefined;
  optimize(): Promise<void>;
  compact(): Promise<void>;
  validate(): Promise<ValidationResult>;
  getStats(): DataStoreStats;
}

export enum DataStoreType {
  MEMORY = 'memory',
  LOCAL_STORAGE = 'localStorage',
  INDEXED_DB = 'indexedDB',
  WEBSQL = 'webSQL',
  CACHE = 'cache',
  TEMPORARY = 'temporary'
}

export interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
  compressed: boolean;
  encrypted: boolean;
}

export interface DataIndex {
  name: string;
  fields: string[];
  unique: boolean;
  sparse: boolean;
  data: Map<string, Set<string>>;
  enabled: boolean;
  
  add(key: string, value: any): void;
  remove(key: string): void;
  update(key: string, oldValue: any, newValue: any): void;
  find(value: any): Set<string>;
  clear(): void;
  rebuild(): void;
  optimize(): void;
}

export interface Query {
  id: string;
  name: string;
  conditions: QueryCondition[];
  fields: string[];
  sort: SortOption[];
  limit: number;
  offset: number;
  cache: boolean;
  ttl: number;
  enabled: boolean;
  
  execute(store: DataStore): Promise<any[]>;
  explain(store: DataStore): QueryPlan;
  optimize(store: DataStore): Query;
}

export interface QueryCondition {
  field: string;
  operator: QueryOperator;
  value: any;
  logic?: QueryLogic;
}

export enum QueryOperator {
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
  IN = 'in',
  NOT_IN = 'not_in',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  REGEX = 'regex',
  EXISTS = 'exists',
  NOT_EXISTS = 'not_exists'
}

export enum QueryLogic {
  AND = 'and',
  OR = 'or',
  NOT = 'not'
}

export interface SortOption {
  field: string;
  direction: SortDirection;
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export interface QueryPlan {
  steps: QueryStep[];
  estimatedCost: number;
  estimatedRows: number;
  indexes: string[];
  fullScan: boolean;
}

export interface QueryStep {
  type: QueryStepType;
  description: string;
  cost: number;
  rows: number;
}

export enum QueryStepType {
  INDEX_SCAN = 'index_scan',
  FULL_SCAN = 'full_scan',
  FILTER = 'filter',
  SORT = 'sort',
  LIMIT = 'limit',
  PROJECT = 'project'
}

export interface Subscription {
  id: string;
  key: string;
  callback: (value: any) => void;
  filter?: (value: any) => boolean;
  once: boolean;
  created: number;
  lastTriggered: number;
  count: number;
}

export interface DataEvent {
  type: DataEventType;
  key: string;
  value: any;
  oldValue?: any;
  timestamp: number;
  source: string;
}

export enum DataEventType {
  SET = 'set',
  GET = 'get',
  DELETE = 'delete',
  CLEAR = 'clear',
  SYNC = 'sync',
  BACKUP = 'backup',
  RESTORE = 'restore',
  OPTIMIZE = 'optimize',
  COMPACT = 'compact'
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: ValidationStats;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: ValidationSeverity;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export enum ValidationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ValidationStats {
  totalFields: number;
  validFields: number;
  invalidFields: number;
  warnings: number;
  errors: number;
  duration: number;
}

export interface DataStoreStats {
  totalKeys: number;
  totalSize: number;
  memoryUsage: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  averageAccessTime: number;
  lastAccess: number;
  lastModified: number;
  version: number;
  indexes: number;
  queries: number;
  subscriptions: number;
  events: number;
}

export interface DataManager {
  stores: Map<string, DataStore>;
  defaultStore: string;
  config: DataManagerConfig;
  events: DataEvent[];
  enabled: boolean;
  
  init(config: DataManagerConfig): Promise<void>;
  destroy(): void;
  createStore(id: string, type: DataStoreType, config?: Partial<DataStore>): Promise<DataStore>;
  removeStore(id: string): Promise<void>;
  getStore(id: string): DataStore | undefined;
  setDefaultStore(id: string): void;
  syncAll(): Promise<void>;
  backupAll(): Promise<Map<string, string>>;
  restoreAll(backups: Map<string, string>): Promise<void>;
  optimizeAll(): Promise<void>;
  compactAll(): Promise<void>;
  validateAll(): Promise<Map<string, ValidationResult>>;
  getStats(): Map<string, DataStoreStats>;
  on(event: DataEventType, callback: (event: DataEvent) => void): void;
  off(event: DataEventType, callback: (event: DataEvent) => void): void;
  emit(event: DataEvent): void;
}

export interface DataManagerConfig {
  defaultStore: string;
  maxStores: number;
  maxEvents: number;
  enableLogging: boolean;
  enableMetrics: boolean;
  enableCompression: boolean;
  enableEncryption: boolean;
  compressionLevel: number;
  encryptionKey?: string;
  syncInterval: number;
  backupInterval: number;
  optimizeInterval: number;
  compactInterval: number;
  validationInterval: number;
}

// Memory Data Store Implementation
export class MemoryDataStore implements DataStore {
  id: string;
  name: string;
  type: DataStoreType;
  data: Map<string, any>;
  version: number;
  lastModified: number;
  maxSize: number;
  compression: boolean;
  encryption: boolean;
  persistence: boolean;
  cache: Map<string, CacheEntry>;
  indexes: Map<string, DataIndex>;
  queries: Map<string, Query>;
  subscriptions: Map<string, Subscription>;
  events: DataEvent[];
  enabled: boolean;

  private eventListeners: Map<DataEventType, Function[]>;
  private subscriptionIdCounter: number;

  constructor(id: string, name: string, config: Partial<DataStore> = {}) {
    this.id = id;
    this.name = name;
    this.type = DataStoreType.MEMORY;
    this.data = new Map();
    this.version = 1;
    this.lastModified = Date.now();
    this.maxSize = config.maxSize || 100 * 1024 * 1024; // 100MB
    this.compression = config.compression || false;
    this.encryption = config.encryption || false;
    this.persistence = config.persistence || false;
    this.cache = new Map();
    this.indexes = new Map();
    this.queries = new Map();
    this.subscriptions = new Map();
    this.events = [];
    this.enabled = true;
    this.eventListeners = new Map();
    this.subscriptionIdCounter = 0;
  }

  async init(): Promise<void> {
    this.log('Memory data store initialized');
  }

  destroy(): void {
    this.data.clear();
    this.cache.clear();
    this.indexes.clear();
    this.queries.clear();
    this.subscriptions.clear();
    this.events = [];
    this.eventListeners.clear();
  }

  async set(key: string, value: any): Promise<void> {
    if (!this.enabled) return;

    const oldValue = this.data.get(key);
    this.data.set(key, value);
    this.lastModified = Date.now();
    // Size is calculated dynamically via the size() method

    // Update indexes
    for (const index of this.indexes.values()) {
      if (oldValue !== undefined) {
        index.remove(key);
      }
      index.add(key, value);
    }

    // Notify subscribers
    this.notifySubscribers(key, value);

    // Emit event
    this.emit({
      type: DataEventType.SET,
      key,
      value,
      oldValue,
      timestamp: Date.now(),
      source: this.id
    });

    this.log(`Set key: ${key}`);
  }

  async get(key: string): Promise<any> {
    if (!this.enabled) return undefined;

    const value = this.data.get(key);

    // Emit event
    this.emit({
      type: DataEventType.GET,
      key,
      value,
      timestamp: Date.now(),
      source: this.id
    });

    this.log(`Get key: ${key}`);
    return value;
  }

  async has(key: string): Promise<boolean> {
    return this.data.has(key);
  }

  async delete(key: string): Promise<boolean> {
    if (!this.enabled) return false;

    const oldValue = this.data.get(key);
    const deleted = this.data.delete(key);
    
    if (deleted) {
      this.lastModified = Date.now();
      // Size is calculated dynamically via the size() method

      // Update indexes
      for (const index of this.indexes.values()) {
        index.remove(key);
      }

      // Notify subscribers
      this.notifySubscribers(key, undefined);

      // Emit event
      this.emit({
        type: DataEventType.DELETE,
        key,
        value: undefined,
        oldValue,
        timestamp: Date.now(),
        source: this.id
      });

      this.log(`Deleted key: ${key}`);
    }

    return deleted;
  }

  async clear(): Promise<void> {
    if (!this.enabled) return;

    this.data.clear();
    this.lastModified = Date.now();
    // Size is calculated dynamically via the size() method

    // Clear indexes
    for (const index of this.indexes.values()) {
      index.clear();
    }

    // Emit event
    this.emit({
      type: DataEventType.CLEAR,
      key: '',
      value: undefined,
      timestamp: Date.now(),
      source: this.id
    });

    this.log('Cleared all data');
  }

  async keys(): Promise<string[]> {
    return Array.from(this.data.keys());
  }

  async values(): Promise<any[]> {
    return Array.from(this.data.values());
  }

  async entries(): Promise<[string, any][]> {
    return Array.from(this.data.entries());
  }

  async size(): Promise<number> {
    return this.data.size;
  }

  async export(): Promise<string> {
    const data = {
      id: this.id,
      name: this.name,
      type: this.type,
      version: this.version,
      lastModified: this.lastModified,
      data: Object.fromEntries(this.data),
      indexes: Array.from(this.indexes.entries()).map(([name, index]) => ({
        name,
        fields: index.fields,
        unique: index.unique,
        sparse: index.sparse,
        data: Object.fromEntries(index.data)
      }))
    };

    return JSON.stringify(data, null, 2);
  }

  async import(data: string): Promise<void> {
    const imported = JSON.parse(data);
    
    this.id = imported.id;
    this.name = imported.name;
    this.version = imported.version;
    this.lastModified = imported.lastModified;
    this.data = new Map(Object.entries(imported.data));

    // Rebuild indexes
    this.indexes.clear();
    for (const indexData of imported.indexes) {
      const index = new DataIndexImpl(indexData.name, indexData.fields, indexData.unique, indexData.sparse);
      index.data = new Map(Object.entries(indexData.data));
      this.indexes.set(indexData.name, index);
    }

    // Size is calculated dynamically via the size() method
    this.log('Data imported successfully');
  }

  async backup(): Promise<string> {
    return this.export();
  }

  async restore(backup: string): Promise<void> {
    await this.import(backup);
  }

  async sync(): Promise<void> {
    // Memory store doesn't need sync
    this.log('Sync completed');
  }

  async query(query: Query): Promise<any[]> {
    return query.execute(this);
  }

  subscribe(key: string, callback: (value: any) => void): string {
    const id = `sub_${++this.subscriptionIdCounter}`;
    const subscription: Subscription = {
      id,
      key,
      callback,
      once: false,
      created: Date.now(),
      lastTriggered: 0,
      count: 0
    };

    this.subscriptions.set(id, subscription);
    return id;
  }

  unsubscribe(id: string): void {
    this.subscriptions.delete(id);
  }

  createIndex(name: string, fields: string[]): DataIndex {
    const index = new DataIndexImpl(name, fields, false, false);
    this.indexes.set(name, index);
    return index;
  }

  removeIndex(name: string): void {
    this.indexes.delete(name);
  }

  getIndex(name: string): DataIndex | undefined {
    return this.indexes.get(name);
  }

  async optimize(): Promise<void> {
    // Optimize indexes
    for (const index of this.indexes.values()) {
      index.optimize();
    }

    // Emit event
    this.emit({
      type: DataEventType.OPTIMIZE,
      key: '',
      value: undefined,
      timestamp: Date.now(),
      source: this.id
    });

    this.log('Optimization completed');
  }

  async compact(): Promise<void> {
    // Remove expired cache entries
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.ttl > 0 && now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }

    // Emit event
    this.emit({
      type: DataEventType.COMPACT,
      key: '',
      value: undefined,
      timestamp: Date.now(),
      source: this.id
    });

    this.log('Compaction completed');
  }

  async validate(): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let validFields = 0;
    let invalidFields = 0;

    for (const [key, value] of this.data.entries()) {
      try {
        // Basic validation
        if (value === null || value === undefined) {
          warnings.push({
            field: key,
            message: 'Value is null or undefined',
            code: 'NULL_VALUE'
          });
        } else {
          validFields++;
        }
      } catch (error) {
        errors.push({
          field: key,
          message: `Validation error: ${error}`,
          code: 'VALIDATION_ERROR',
          severity: ValidationSeverity.MEDIUM
        });
        invalidFields++;
      }
    }

    const result: ValidationResult = {
      valid: errors.length === 0,
      errors,
      warnings,
      stats: {
        totalFields: this.data.size,
        validFields,
        invalidFields,
        warnings: warnings.length,
        errors: errors.length,
        duration: Date.now() - startTime
      }
    };

    return result;
  }

  getStats(): DataStoreStats {
    const cacheHits = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.hits, 0);
    const cacheMisses = this.cache.size;
    const hitRate = cacheHits + cacheMisses > 0 ? cacheHits / (cacheHits + cacheMisses) : 0;
    const currentSize = this.calculateSize();

    return {
      totalKeys: this.data.size,
      totalSize: currentSize,
      memoryUsage: currentSize,
      cacheHits,
      cacheMisses,
      hitRate,
      averageAccessTime: 0, // Would need to track this
      lastAccess: this.lastModified,
      lastModified: this.lastModified,
      version: this.version,
      indexes: this.indexes.size,
      queries: this.queries.size,
      subscriptions: this.subscriptions.size,
      events: this.events.length
    };
  }

  private calculateSize(): number {
    let size = 0;
    for (const [key, value] of this.data.entries()) {
      size += key.length * 2; // UTF-16
      size += JSON.stringify(value).length * 2;
    }
    return size;
  }

  private notifySubscribers(key: string, value: any): void {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.key === key) {
        if (!subscription.filter || subscription.filter(value)) {
          subscription.callback(value);
          subscription.lastTriggered = Date.now();
          subscription.count++;

          if (subscription.once) {
            this.subscriptions.delete(subscription.id);
          }
        }
      }
    }
  }

  private emit(event: DataEvent): void {
    this.events.push(event);
    if (this.events.length > 1000) {
      this.events.shift();
    }

    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  private log(message: string): void {
    console.log(`[MemoryDataStore:${this.id}] ${message}`);
  }
}

// Data Index Implementation
export class DataIndexImpl implements DataIndex {
  name: string;
  fields: string[];
  unique: boolean;
  sparse: boolean;
  data: Map<string, Set<string>>;
  enabled: boolean;

  constructor(name: string, fields: string[], unique: boolean = false, sparse: boolean = false) {
    this.name = name;
    this.fields = fields;
    this.unique = unique;
    this.sparse = sparse;
    this.data = new Map();
    this.enabled = true;
  }

  add(key: string, value: any): void {
    if (!this.enabled) return;

    const indexKey = this.createIndexKey(value);
    if (indexKey) {
      if (!this.data.has(indexKey)) {
        this.data.set(indexKey, new Set());
      }
      this.data.get(indexKey)!.add(key);
    }
  }

  remove(key: string): void {
    if (!this.enabled) return;

    for (const [indexKey, keys] of this.data.entries()) {
      keys.delete(key);
      if (keys.size === 0) {
        this.data.delete(indexKey);
      }
    }
  }

  update(key: string, oldValue: any, newValue: any): void {
    this.remove(key);
    this.add(key, newValue);
  }

  find(value: any): Set<string> {
    if (!this.enabled) return new Set();

    const indexKey = this.createIndexKey(value);
    if (!indexKey) return new Set();
    return this.data.get(indexKey) || new Set();
  }

  clear(): void {
    this.data.clear();
  }

  rebuild(): void {
    this.clear();
    // Would need access to the data store to rebuild
  }

  optimize(): void {
    // Remove empty sets
    for (const [key, set] of this.data.entries()) {
      if (set.size === 0) {
        this.data.delete(key);
      }
    }
  }

  private createIndexKey(value: any): string | null {
    if (value === null || value === undefined) {
      return this.sparse ? null : 'null';
    }

    if (typeof value === 'object') {
      const keyParts: string[] = [];
      for (const field of this.fields) {
        const fieldValue = this.getFieldValue(value, field);
        if (fieldValue === null || fieldValue === undefined) {
          if (this.sparse) return null;
          keyParts.push('null');
        } else {
          keyParts.push(String(fieldValue));
        }
      }
      return keyParts.join('|');
    }

    return String(value);
  }

  private getFieldValue(value: any, field: string): any {
    const parts = field.split('.');
    let current = value;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  }
}

// Data Manager Implementation
export class DataManagerImpl implements DataManager {
  stores: Map<string, DataStore>;
  defaultStore: string;
  config: DataManagerConfig;
  events: DataEvent[];
  enabled: boolean;

  private eventListeners: Map<DataEventType, Function[]>;
  private intervals: Map<string, NodeJS.Timeout>;

  constructor() {
    this.stores = new Map();
    this.defaultStore = 'default';
    this.config = {
      defaultStore: 'default',
      maxStores: 10,
      maxEvents: 10000,
      enableLogging: true,
      enableMetrics: true,
      enableCompression: false,
      enableEncryption: false,
      compressionLevel: 6,
      syncInterval: 60000,
      backupInterval: 300000,
      optimizeInterval: 600000,
      compactInterval: 1800000,
      validationInterval: 3600000
    };
    this.events = [];
    this.enabled = true;
    this.eventListeners = new Map();
    this.intervals = new Map();
  }

  async init(config: DataManagerConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    
    // Create default store
    await this.createStore('default', DataStoreType.MEMORY);
    
    // Start background tasks
    this.startBackgroundTasks();
    
    this.log('Data manager initialized');
  }

  destroy(): void {
    // Stop background tasks
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();

    // Destroy all stores
    for (const store of this.stores.values()) {
      store.destroy();
    }
    this.stores.clear();

    this.events = [];
    this.eventListeners.clear();
  }

  async createStore(id: string, type: DataStoreType, config: Partial<DataStore> = {}): Promise<DataStore> {
    if (this.stores.has(id)) {
      throw new Error(`Store with id '${id}' already exists`);
    }

    if (this.stores.size >= this.config.maxStores) {
      throw new Error('Maximum number of stores reached');
    }

    let store: DataStore;
    switch (type) {
      case DataStoreType.MEMORY:
        store = new MemoryDataStore(id, id, config);
        break;
      default:
        throw new Error(`Unsupported store type: ${type}`);
    }

    await store.init();
    this.stores.set(id, store);
    
    this.log(`Created store: ${id} (${type})`);
    return store;
  }

  async removeStore(id: string): Promise<void> {
    const store = this.stores.get(id);
    if (store) {
      store.destroy();
      this.stores.delete(id);
      this.log(`Removed store: ${id}`);
    }
  }

  getStore(id: string): DataStore | undefined {
    return this.stores.get(id);
  }

  setDefaultStore(id: string): void {
    if (this.stores.has(id)) {
      this.defaultStore = id;
      this.log(`Set default store: ${id}`);
    }
  }

  async syncAll(): Promise<void> {
    for (const store of this.stores.values()) {
      try {
        await store.sync();
      } catch (error) {
        console.warn(`Failed to sync store ${store.id}:`, error);
      }
    }
    this.log('Synced all stores');
  }

  async backupAll(): Promise<Map<string, string>> {
    const backups = new Map<string, string>();
    for (const [id, store] of this.stores.entries()) {
      backups.set(id, await store.backup());
    }
    this.log('Backed up all stores');
    return backups;
  }

  async restoreAll(backups: Map<string, string>): Promise<void> {
    for (const [id, backup] of backups.entries()) {
      const store = this.stores.get(id);
      if (store) {
        await store.restore(backup);
      }
    }
    this.log('Restored all stores');
  }

  async optimizeAll(): Promise<void> {
    for (const store of this.stores.values()) {
      await store.optimize();
    }
    this.log('Optimized all stores');
  }

  async compactAll(): Promise<void> {
    for (const store of this.stores.values()) {
      await store.compact();
    }
    this.log('Compacted all stores');
  }

  async validateAll(): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();
    for (const [id, store] of this.stores.entries()) {
      results.set(id, await store.validate());
    }
    this.log('Validated all stores');
    return results;
  }

  getStats(): Map<string, DataStoreStats> {
    const stats = new Map<string, DataStoreStats>();
    for (const [id, store] of this.stores.entries()) {
      stats.set(id, store.getStats());
    }
    return stats;
  }

  on(event: DataEventType, callback: (event: DataEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: DataEventType, callback: (event: DataEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: DataEvent): void {
    this.events.push(event);
    if (this.events.length > this.config.maxEvents) {
      this.events.shift();
    }

    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  private startBackgroundTasks(): void {
    // Sync task
    if (this.config.syncInterval > 0) {
      const syncInterval = setInterval(() => {
        this.syncAll();
      }, this.config.syncInterval);
      this.intervals.set('sync', syncInterval);
    }

    // Backup task
    if (this.config.backupInterval > 0) {
      const backupInterval = setInterval(() => {
        this.backupAll();
      }, this.config.backupInterval);
      this.intervals.set('backup', backupInterval);
    }

    // Optimize task
    if (this.config.optimizeInterval > 0) {
      const optimizeInterval = setInterval(() => {
        this.optimizeAll();
      }, this.config.optimizeInterval);
      this.intervals.set('optimize', optimizeInterval);
    }

    // Compact task
    if (this.config.compactInterval > 0) {
      const compactInterval = setInterval(() => {
        this.compactAll();
      }, this.config.compactInterval);
      this.intervals.set('compact', compactInterval);
    }

    // Validation task
    if (this.config.validationInterval > 0) {
      const validationInterval = setInterval(() => {
        this.validateAll();
      }, this.config.validationInterval);
      this.intervals.set('validation', validationInterval);
    }
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[DataManager] ${message}`);
    }
  }
}

// Export the main classes
export const DataManager = DataManagerImpl;
// MemoryDataStore is already exported above
export default DataManagerImpl;
