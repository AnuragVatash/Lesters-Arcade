'use client';

// Advanced Game Engine for Lester's Arcade
// This file contains the core game engine with physics, rendering, and game state management

export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  rotation: number;
  scale: Vector2D;
  visible: boolean;
  active: boolean;
  layer: number;
  tags: string[];
  components: Map<string, Component>;
}

export interface Component {
  name: string;
  enabled: boolean;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  destroy(): void;
}

export interface PhysicsComponent extends Component {
  mass: number;
  friction: number;
  restitution: number;
  isStatic: boolean;
  collider: Collider;
}

export interface Collider {
  type: 'circle' | 'rectangle' | 'polygon';
  bounds: CircleBounds | RectangleBounds | PolygonBounds;
  isTrigger: boolean;
}

export interface CircleBounds {
  radius: number;
}

export interface RectangleBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PolygonBounds {
  points: Vector2D[];
}

export interface RenderComponent extends Component {
  sprite?: HTMLImageElement;
  color: string;
  opacity: number;
  blendMode: GlobalCompositeOperation;
}

export interface AudioComponent extends Component {
  sounds: Map<string, HTMLAudioElement>;
  volume: number;
  pitch: number;
  loop: boolean;
  play(soundName: string): void;
  stop(soundName: string): void;
}

export interface AnimationComponent extends Component {
  animations: Map<string, Animation>;
  currentAnimation: string;
  frame: number;
  speed: number;
  loop: boolean;
  play(animationName: string): void;
  stop(): void;
}

export interface Animation {
  name: string;
  frames: AnimationFrame[];
  duration: number;
  loop: boolean;
}

export interface AnimationFrame {
  sprite: HTMLImageElement;
  duration: number;
  offset: Vector2D;
}

export interface InputManager {
  keys: Map<string, boolean>;
  mouse: {
    position: Vector2D;
    buttons: Map<number, boolean>;
    wheel: number;
  };
  touches: Map<number, Touch>;
  init(): void;
  update(): void;
  destroy(): void;
  isKeyDown(key: string): boolean;
  isKeyPressed(key: string): boolean;
  isMouseDown(button: number): boolean;
  isMousePressed(button: number): boolean;
  getMousePosition(): Vector2D;
  addEventListener(type: string, callback: (event: Event) => void): void;
  removeEventListener(type: string, callback: (event: Event) => void): void;
  handleKeyDown(event: KeyboardEvent): void;
  handleKeyUp(event: KeyboardEvent): void;
  handleMouseDown(event: MouseEvent): void;
  handleMouseUp(event: MouseEvent): void;
  handleMouseMove(event: MouseEvent): void;
  handleTouchStart(event: TouchEvent): void;
  handleTouchEnd(event: TouchEvent): void;
  handleTouchMove(event: TouchEvent): void;
}

export interface Scene {
  name: string;
  objects: Map<string, GameObject>;
  camera: Camera;
  lighting: LightingSystem;
  background: Background;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  addObject(object: GameObject): void;
  removeObject(id: string): void;
  getObject(id: string): GameObject | undefined;
  findObjectsByTag(tag: string): GameObject[];
}

export interface Camera {
  position: Vector2D;
  zoom: number;
  rotation: number;
  bounds: Rectangle;
  followTarget?: GameObject;
  followSpeed: number;
  shake: {
    intensity: number;
    duration: number;
    timer: number;
  };
  update(deltaTime: number): void;
  worldToScreen(worldPos: Vector2D): Vector2D;
  screenToWorld(screenPos: Vector2D): Vector2D;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LightingSystem {
  ambientLight: number;
  lights: Light[];
  shadows: boolean;
  addLight(light: Light): void;
  removeLight(id: string): void;
  calculateLighting(position: Vector2D): number;
}

export interface Light {
  id: string;
  position: Vector2D;
  color: string;
  intensity: number;
  range: number;
  type: 'point' | 'directional' | 'spot';
  enabled: boolean;
}

export interface Background {
  type: 'color' | 'image' | 'gradient' | 'parallax';
  color?: string;
  image?: HTMLImageElement;
  gradient?: CanvasGradient;
  parallaxLayers?: ParallaxLayer[];
  scrollSpeed: number;
  render(ctx: CanvasRenderingContext2D, camera: Camera): void;
}

export interface ParallaxLayer {
  image: HTMLImageElement;
  speed: number;
  offset: Vector2D;
  repeat: boolean;
}

export interface GameState {
  currentScene: string;
  scenes: Map<string, Scene>;
  globalObjects: Map<string, GameObject>;
  paused: boolean;
  timeScale: number;
  deltaTime: number;
  totalTime: number;
  frameCount: number;
  fps: number;
  lastFrameTime: number;
}

export interface ResourceManager {
  images: Map<string, HTMLImageElement>;
  sounds: Map<string, HTMLAudioElement>;
  fonts: Map<string, FontFace>;
  data: Map<string, unknown>;
  init(): Promise<void>;
  loadImage(url: string, name: string): Promise<HTMLImageElement>;
  loadSound(url: string, name: string): Promise<HTMLAudioElement>;
  loadFont(url: string, name: string): Promise<FontFace>;
  loadData(url: string, name: string): Promise<unknown>;
  getImage(name: string): HTMLImageElement | undefined;
  getSound(name: string): HTMLAudioElement | undefined;
  getFont(name: string): FontFace | undefined;
  getData(name: string): unknown;
  preload(resources: ResourceDefinition[]): Promise<void>;
}

export interface ResourceDefinition {
  type: 'image' | 'sound' | 'font' | 'data';
  url: string;
  name: string;
}

export interface EventManager {
  listeners: Map<string, Array<(data?: unknown) => void>>;
  emit(event: string, data?: unknown): void;
  on(event: string, callback: (data?: unknown) => void): void;
  off(event: string, callback: (data?: unknown) => void): void;
  once(event: string, callback: (data?: unknown) => void): void;
  clear(): void;
}

export interface PhysicsEngine {
  gravity: Vector2D;
  worldBounds: Rectangle;
  objects: Map<string, PhysicsObject>;
  collisions: Collision[];
  init(): void;
  destroy(): void;
  update(deltaTime: number): void;
  addObject(object: PhysicsObject): void;
  removeObject(id: string): void;
  checkCollisions(): Collision[];
  resolveCollision(collision: Collision): void;
  raycast(origin: Vector2D, direction: Vector2D, distance: number): RaycastHit | null;
}

export interface PhysicsObject {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  mass: number;
  friction: number;
  restitution: number;
  isStatic: boolean;
  collider: Collider;
  forces: Vector2D[];
  update(deltaTime: number): void;
  applyForce(force: Vector2D): void;
  applyImpulse(impulse: Vector2D): void;
}

export interface Collision {
  objectA: PhysicsObject;
  objectB: PhysicsObject;
  point: Vector2D;
  normal: Vector2D;
  penetration: number;
  restitution: number;
  friction: number;
}

export interface RaycastHit {
  object: PhysicsObject;
  point: Vector2D;
  distance: number;
  normal: Vector2D;
}

export interface ParticleSystem {
  particles: Particle[];
  emitter: ParticleEmitter;
  gravity: Vector2D;
  wind: Vector2D;
  init(): void;
  destroy(): void;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  emit(count: number, position: Vector2D): void;
  clear(): void;
}

export interface Particle {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  scaleSpeed: number;
  gravity: number;
  friction: number;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export interface ParticleEmitter {
  position: Vector2D;
  rate: number;
  burst: number;
  spread: number;
  speed: number;
  life: number;
  size: number;
  color: string;
  enabled: boolean;
  emit(): Particle[];
}

export interface UISystem {
  elements: Map<string, UIElement>;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  init(canvas: HTMLCanvasElement): void;
  destroy(): void;
  update(deltaTime: number): void;
  render(): void;
  addElement(element: UIElement): void;
  removeElement(id: string): void;
  getElement(id: string): UIElement | undefined;
  handleInput(event: InputEvent): void;
}

export interface UIElement {
  id: string;
  position: Vector2D;
  size: Vector2D;
  visible: boolean;
  enabled: boolean;
  parent?: UIElement;
  children: UIElement[];
  style: UIStyle;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  handleInput(event: InputEvent): boolean;
  addChild(element: UIElement): void;
  removeChild(id: string): void;
}

export interface UIStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  opacity?: number;
  zIndex?: number;
}

export interface InputEvent {
  type: 'keydown' | 'keyup' | 'mousedown' | 'mouseup' | 'mousemove' | 'click' | 'touchstart' | 'touchend' | 'touchmove';
  key?: string;
  button?: number;
  position?: Vector2D;
  delta?: Vector2D;
  target?: UIElement;
}

export interface GameEngine {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  state: GameState;
  input: InputManager;
  resources: ResourceManager;
  events: EventManager;
  physics: PhysicsEngine;
  particles: ParticleSystem;
  ui: UISystem;
  scenes: Map<string, Scene>;
  currentScene?: Scene;
  running: boolean;
  targetFPS: number;
  lastFrameTime: number;
  
  init(canvas: HTMLCanvasElement): Promise<void>;
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  update(deltaTime: number): void;
  render(): void;
  setScene(name: string): void;
  addScene(scene: Scene): void;
  removeScene(name: string): void;
  getScene(name: string): Scene | undefined;
  destroy(): void;
}

// Core Game Engine Implementation
export class GameEngineImpl implements GameEngine {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  state: GameState;
  input: InputManager;
  resources: ResourceManager;
  events: EventManager;
  physics: PhysicsEngine;
  particles: ParticleSystem;
  ui: UISystem;
  scenes: Map<string, Scene>;
  currentScene?: Scene;
  running: boolean;
  targetFPS: number;
  lastFrameTime: number;

  constructor() {
    this.canvas = null as unknown as HTMLCanvasElement;
    this.context = null as unknown as CanvasRenderingContext2D;
    this.state = {
      currentScene: '',
      scenes: new Map(),
      globalObjects: new Map(),
      paused: false,
      timeScale: 1,
      deltaTime: 0,
      totalTime: 0,
      frameCount: 0,
      fps: 0,
      lastFrameTime: 0
    };
    this.input = new InputManagerImpl();
    this.resources = new ResourceManagerImpl();
    this.events = new EventManagerImpl();
    this.physics = new PhysicsEngineImpl();
    this.particles = new ParticleSystemImpl();
    this.ui = new UISystemImpl();
    this.scenes = new Map();
    this.running = false;
    this.targetFPS = 60;
    this.lastFrameTime = 0;
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!;
    
    // Initialize all systems
    await this.resources.init();
    this.input.init();
    this.physics.init();
    this.particles.init();
    this.ui.init(canvas);
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start the game loop
    this.start();
  }

  start(): void {
    this.running = true;
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  stop(): void {
    this.running = false;
  }

  pause(): void {
    this.state.paused = true;
  }

  resume(): void {
    this.state.paused = false;
  }

  private gameLoop(): void {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    this.state.deltaTime = deltaTime * this.state.timeScale;
    this.state.totalTime += this.state.deltaTime;
    this.state.frameCount++;
    this.state.fps = 1 / deltaTime;

    if (!this.state.paused) {
      this.update(this.state.deltaTime);
    }

    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  update(deltaTime: number): void {
    // Update input
    this.input.update();

    // Update physics
    this.physics.update(deltaTime);

    // Update particles
    this.particles.update(deltaTime);

    // Update current scene
    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }

    // Update UI
    this.ui.update(deltaTime);

    // Update global objects
    this.state.globalObjects.forEach(object => {
      if (object.active) {
        // Update object components
        object.components.forEach(component => {
          if (component.enabled) {
            component.update(deltaTime);
          }
        });
      }
    });
  }

  render(): void {
    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render current scene
    if (this.currentScene) {
      this.currentScene.render(this.context);
    }

    // Render particles
    this.particles.render(this.context);

    // Render UI
    this.ui.render();
  }

  setScene(name: string): void {
    const scene = this.scenes.get(name);
    if (scene) {
      this.currentScene = scene;
      this.state.currentScene = name;
    }
  }

  addScene(scene: Scene): void {
    this.scenes.set(scene.name, scene);
  }

  removeScene(name: string): void {
    this.scenes.delete(name);
  }

  getScene(name: string): Scene | undefined {
    return this.scenes.get(name);
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.input.handleKeyDown(e);
    });

    document.addEventListener('keyup', (e) => {
      this.input.handleKeyUp(e);
    });

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => {
      this.input.handleMouseDown(e);
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.input.handleMouseUp(e);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      this.input.handleMouseMove(e);
    });

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      this.input.handleTouchStart(e);
    });

    this.canvas.addEventListener('touchend', (e) => {
      this.input.handleTouchEnd(e);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      this.input.handleTouchMove(e);
    });
  }

  destroy(): void {
    this.stop();
    this.input.destroy();
    this.events.clear();
    this.physics.destroy();
    this.particles.destroy();
    this.ui.destroy();
    this.scenes.clear();
    this.state.globalObjects.clear();
  }
}

// Input Manager Implementation
class InputManagerImpl implements InputManager {
  keys: Map<string, boolean>;
  mouse: {
    position: Vector2D;
    buttons: Map<number, boolean>;
    wheel: number;
  };
  touches: Map<number, Touch>;
  private keyPressed: Map<string, boolean>;
  private mousePressed: Map<number, boolean>;

  constructor() {
    this.keys = new Map();
    this.mouse = {
      position: { x: 0, y: 0 },
      buttons: new Map(),
      wheel: 0
    };
    this.touches = new Map();
    this.keyPressed = new Map();
    this.mousePressed = new Map();
  }

  init(): void {
    // Initialize input state
  }

  update(): void {
    // Reset pressed states
    this.keyPressed.clear();
    this.mousePressed.clear();
  }

  isKeyDown(key: string): boolean {
    return this.keys.get(key) || false;
  }

  isKeyPressed(key: string): boolean {
    return this.keyPressed.get(key) || false;
  }

  isMouseDown(button: number): boolean {
    return this.mouse.buttons.get(button) || false;
  }

  isMousePressed(button: number): boolean {
    return this.mousePressed.get(button) || false;
  }

  getMousePosition(): Vector2D {
    return { ...this.mouse.position };
  }

  addEventListener(type: string, callback: (event: Event) => void): void {
    document.addEventListener(type, callback);
  }

  removeEventListener(type: string, callback: (event: Event) => void): void {
    document.removeEventListener(type, callback);
  }

  handleKeyDown(event: KeyboardEvent): void {
    this.keys.set(event.key, true);
    this.keyPressed.set(event.key, true);
  }

  handleKeyUp(event: KeyboardEvent): void {
    this.keys.set(event.key, false);
  }

  handleMouseDown(event: MouseEvent): void {
    this.mouse.buttons.set(event.button, true);
    this.mousePressed.set(event.button, true);
  }

  handleMouseUp(event: MouseEvent): void {
    this.mouse.buttons.set(event.button, false);
  }

  handleMouseMove(event: MouseEvent): void {
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    this.mouse.position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      this.touches.set(touch.identifier, touch);
    }
  }

  handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.touches.delete(touch.identifier);
    }
  }

  handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      this.touches.set(touch.identifier, touch);
    }
  }

  destroy(): void {
    this.keys.clear();
    this.mouse.buttons.clear();
    this.touches.clear();
    this.keyPressed.clear();
    this.mousePressed.clear();
  }
}

// Resource Manager Implementation
class ResourceManagerImpl implements ResourceManager {
  images: Map<string, HTMLImageElement>;
  sounds: Map<string, HTMLAudioElement>;
  fonts: Map<string, FontFace>;
  data: Map<string, unknown>;

  constructor() {
    this.images = new Map();
    this.sounds = new Map();
    this.fonts = new Map();
    this.data = new Map();
  }

  async init(): Promise<void> {
    // Initialize resource manager
  }

  async loadImage(url: string, name: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(name, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async loadSound(url: string, name: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.oncanplaythrough = () => {
        this.sounds.set(name, audio);
        resolve(audio);
      };
      audio.onerror = reject;
    });
  }

  async loadFont(url: string, name: string): Promise<FontFace> {
    const font = new FontFace(name, `url(${url})`);
    await font.load();
    this.fonts.set(name, font);
    return font;
  }

  async loadData(url: string, name: string): Promise<unknown> {
    const response = await fetch(url);
    const data: unknown = await response.json();
    this.data.set(name, data);
    return data;
  }

  getImage(name: string): HTMLImageElement | undefined {
    return this.images.get(name);
  }

  getSound(name: string): HTMLAudioElement | undefined {
    return this.sounds.get(name);
  }

  getFont(name: string): FontFace | undefined {
    return this.fonts.get(name);
  }

  getData(name: string): unknown {
    return this.data.get(name);
  }

  async preload(resources: ResourceDefinition[]): Promise<void> {
    const promises = resources.map(resource => {
      switch (resource.type) {
        case 'image':
          return this.loadImage(resource.url, resource.name);
        case 'sound':
          return this.loadSound(resource.url, resource.name);
        case 'font':
          return this.loadFont(resource.url, resource.name);
        case 'data':
          return this.loadData(resource.url, resource.name);
        default:
          return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }
}

// Event Manager Implementation
class EventManagerImpl implements EventManager {
  listeners: Map<string, Array<(data?: unknown) => void>>;

  constructor() {
    this.listeners = new Map();
  }

  emit(event: string, data?: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  on(event: string, callback: (data?: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data?: unknown) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  once(event: string, callback: (data?: unknown) => void): void {
    const onceCallback = (data?: unknown) => {
      callback(data);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  clear(): void {
    this.listeners.clear();
  }
}

// Physics Engine Implementation
class PhysicsEngineImpl implements PhysicsEngine {
  gravity: Vector2D;
  worldBounds: Rectangle;
  objects: Map<string, PhysicsObject>;
  collisions: Collision[];

  constructor() {
    this.gravity = { x: 0, y: 9.81 };
    this.worldBounds = { x: 0, y: 0, width: 0, height: 0 };
    this.objects = new Map();
    this.collisions = [];
  }

  init(): void {
    // Initialize physics engine
  }

  update(deltaTime: number): void {
    // Update all physics objects
    this.objects.forEach(object => {
      if (!object.isStatic) {
        object.update(deltaTime);
      }
    });

    // Check for collisions
    this.collisions = this.checkCollisions();

    // Resolve collisions
    this.collisions.forEach(collision => {
      this.resolveCollision(collision);
    });
  }

  addObject(object: PhysicsObject): void {
    this.objects.set(object.id, object);
  }

  removeObject(id: string): void {
    this.objects.delete(id);
  }

  checkCollisions(): Collision[] {
    const collisions: Collision[] = [];
    const objectArray = Array.from(this.objects.values());

    for (let i = 0; i < objectArray.length; i++) {
      for (let j = i + 1; j < objectArray.length; j++) {
        const objA = objectArray[i];
        const objB = objectArray[j];

        if (this.checkCollision(objA, objB)) {
          const collision = this.createCollision(objA, objB);
          if (collision) {
            collisions.push(collision);
          }
        }
      }
    }

    return collisions;
  }

  private checkCollision(objA: PhysicsObject, objB: PhysicsObject): boolean {
    // Simple AABB collision detection
    const boundsA = this.getObjectBounds(objA);
    const boundsB = this.getObjectBounds(objB);

    return boundsA.x < boundsB.x + boundsB.width &&
           boundsA.x + boundsA.width > boundsB.x &&
           boundsA.y < boundsB.y + boundsB.height &&
           boundsA.y + boundsA.height > boundsB.y;
  }

  private getObjectBounds(object: PhysicsObject): Rectangle {
    const collider = object.collider;
    if (collider.type === 'circle') {
      const circle = collider.bounds as CircleBounds;
      const radius = circle.radius;
      return {
        x: object.position.x - radius,
        y: object.position.y - radius,
        width: radius * 2,
        height: radius * 2
      };
    } else if (collider.type === 'rectangle') {
      const rect = collider.bounds as RectangleBounds;
      return {
        x: object.position.x + rect.x,
        y: object.position.y + rect.y,
        width: rect.width,
        height: rect.height
      };
    }
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  private createCollision(objA: PhysicsObject, objB: PhysicsObject): Collision | null {
    // Create collision data
    const boundsA = this.getObjectBounds(objA);
    const boundsB = this.getObjectBounds(objB);

    const centerA = {
      x: boundsA.x + boundsA.width / 2,
      y: boundsA.y + boundsA.height / 2
    };
    const centerB = {
      x: boundsB.x + boundsB.width / 2,
      y: boundsB.y + boundsB.height / 2
    };

    const distance = Math.sqrt(
      Math.pow(centerB.x - centerA.x, 2) + Math.pow(centerB.y - centerA.y, 2)
    );

    const normal = {
      x: (centerB.x - centerA.x) / distance,
      y: (centerB.y - centerA.y) / distance
    };

    return {
      objectA: objA,
      objectB: objB,
      point: {
        x: (centerA.x + centerB.x) / 2,
        y: (centerA.y + centerB.y) / 2
      },
      normal,
      penetration: distance,
      restitution: Math.min(objA.restitution, objB.restitution),
      friction: Math.sqrt(objA.friction * objB.friction)
    };
  }

  resolveCollision(collision: Collision): void {
    const { objectA, objectB, normal, penetration } = collision;

    // Separate objects
    const separation = penetration / 2;
    const separationVector = {
      x: normal.x * separation,
      y: normal.y * separation
    };

    if (!objectA.isStatic) {
      objectA.position.x -= separationVector.x;
      objectA.position.y -= separationVector.y;
    }
    if (!objectB.isStatic) {
      objectB.position.x += separationVector.x;
      objectB.position.y += separationVector.y;
    }

    // Calculate relative velocity
    const relativeVelocity = {
      x: objectB.velocity.x - objectA.velocity.x,
      y: objectB.velocity.y - objectA.velocity.y
    };

    // Calculate relative velocity along collision normal
    const velocityAlongNormal = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;

    // Do not resolve if velocities are separating
    if (velocityAlongNormal > 0) return;

    // Calculate restitution
    const restitution = collision.restitution;

    // Calculate impulse scalar
    const impulseScalar = -(1 + restitution) * velocityAlongNormal;
    const totalMass = objectA.mass + objectB.mass;
    const impulse = impulseScalar / totalMass;

    // Apply impulse
    const impulseVector = {
      x: impulse * normal.x,
      y: impulse * normal.y
    };

    if (!objectA.isStatic) {
      objectA.velocity.x -= impulseVector.x * objectB.mass;
      objectA.velocity.y -= impulseVector.y * objectB.mass;
    }
    if (!objectB.isStatic) {
      objectB.velocity.x += impulseVector.x * objectA.mass;
      objectB.velocity.y += impulseVector.y * objectA.mass;
    }
  }

  raycast(origin: Vector2D, direction: Vector2D, distance: number): RaycastHit | null {
    const normalizedDirection = {
      x: direction.x / Math.sqrt(direction.x * direction.x + direction.y * direction.y),
      y: direction.y / Math.sqrt(direction.x * direction.x + direction.y * direction.y)
    };

    let closestHit: RaycastHit | null = null;
    let closestDistance = distance;

    this.objects.forEach(object => {
      const bounds = this.getObjectBounds(object);
      const hit = this.raycastAABB(origin, normalizedDirection, bounds);
      
      if (hit && hit.distance < closestDistance) {
        closestHit = {
          object,
          point: hit.point,
          distance: hit.distance,
          normal: hit.normal
        };
        closestDistance = hit.distance;
      }
    });

    return closestHit;
  }

  private raycastAABB(origin: Vector2D, direction: Vector2D, bounds: Rectangle): RaycastHit | null {
    const t1 = (bounds.x - origin.x) / direction.x;
    const t2 = (bounds.x + bounds.width - origin.x) / direction.x;
    const t3 = (bounds.y - origin.y) / direction.y;
    const t4 = (bounds.y + bounds.height - origin.y) / direction.y;

    const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
    const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));

    if (tmax < 0 || tmin > tmax) return null;

    const t = tmin < 0 ? tmax : tmin;
    const point = {
      x: origin.x + direction.x * t,
      y: origin.y + direction.y * t
    };

    // Calculate normal
    const normal = { x: 0, y: 0 };
    if (t === t1) normal.x = -1;
    else if (t === t2) normal.x = 1;
    else if (t === t3) normal.y = -1;
    else if (t === t4) normal.y = 1;

    return {
      object: null as unknown as PhysicsObject,
      point,
      distance: t,
      normal
    };
  }

  destroy(): void {
    this.objects.clear();
    this.collisions = [];
  }
}

// Particle System Implementation
class ParticleSystemImpl implements ParticleSystem {
  particles: Particle[];
  emitter: ParticleEmitter;
  gravity: Vector2D;
  wind: Vector2D;

  constructor() {
    this.particles = [];
    this.emitter = new ParticleEmitterImpl();
    this.gravity = { x: 0, y: 9.81 };
    this.wind = { x: 0, y: 0 };
  }

  init(): void {
    // Initialize particle system
  }

  update(deltaTime: number): void {
    // Update existing particles
    this.particles = this.particles.filter(particle => {
      particle.update(deltaTime);
      return particle.life > 0;
    });

    // Emit new particles
    if (this.emitter.enabled) {
      const newParticles = this.emitter.emit();
      this.particles.push(...newParticles);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(particle => {
      particle.render(ctx);
    });
  }

  emit(count: number, position: Vector2D): void {
    this.emitter.position = position;
    for (let i = 0; i < count; i++) {
      const newParticles = this.emitter.emit();
      this.particles.push(...newParticles);
    }
  }

  clear(): void {
    this.particles = [];
  }

  destroy(): void {
    this.particles = [];
  }
}

// Particle Emitter Implementation
class ParticleEmitterImpl implements ParticleEmitter {
  position: Vector2D;
  rate: number;
  burst: number;
  spread: number;
  speed: number;
  life: number;
  size: number;
  color: string;
  enabled: boolean;

  constructor() {
    this.position = { x: 0, y: 0 };
    this.rate = 10;
    this.burst = 0;
    this.spread = Math.PI / 4;
    this.speed = 100;
    this.life = 1;
    this.size = 2;
    this.color = '#ffffff';
    this.enabled = true;
  }

  emit(): Particle[] {
    const particles: Particle[] = [];
    const count = this.burst > 0 ? this.burst : Math.floor(this.rate * 0.016); // 60fps

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * this.spread;
      const velocity = {
        x: Math.cos(angle) * this.speed * (0.5 + Math.random() * 0.5),
        y: Math.sin(angle) * this.speed * (0.5 + Math.random() * 0.5)
      };

      const particle = new ParticleImpl({
        position: { ...this.position },
        velocity,
        life: this.life * (0.5 + Math.random() * 0.5),
        size: this.size * (0.5 + Math.random() * 0.5),
        color: this.color
      });

      particles.push(particle);
    }

    return particles;
  }
}

// Particle Implementation
class ParticleImpl implements Particle {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  scaleSpeed: number;
  gravity: number;
  friction: number;

  constructor(config: Partial<Particle> = {}) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.position = config.position || { x: 0, y: 0 };
    this.velocity = config.velocity || { x: 0, y: 0 };
    this.acceleration = config.acceleration || { x: 0, y: 0 };
    this.life = config.life || 1;
    this.maxLife = this.life;
    this.size = config.size || 1;
    this.color = config.color || '#ffffff';
    this.alpha = config.alpha || 1;
    this.rotation = config.rotation || 0;
    this.rotationSpeed = config.rotationSpeed || 0;
    this.scale = config.scale || 1;
    this.scaleSpeed = config.scaleSpeed || 0;
    this.gravity = config.gravity || 0;
    this.friction = config.friction || 1;
  }

  update(deltaTime: number): void {
    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Update velocity
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;

    // Apply gravity
    this.velocity.y += this.gravity * deltaTime;

    // Apply friction
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    // Update rotation
    this.rotation += this.rotationSpeed * deltaTime;

    // Update scale
    this.scale += this.scaleSpeed * deltaTime;
    this.scale = Math.max(0, this.scale);

    // Update life
    this.life -= deltaTime;
    this.alpha = this.life / this.maxLife;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// UI System Implementation
class UISystemImpl implements UISystem {
  elements: Map<string, UIElement>;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor() {
    this.elements = new Map();
    this.canvas = null as unknown as HTMLCanvasElement;
    this.context = null as unknown as CanvasRenderingContext2D;
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!;
  }

  update(deltaTime: number): void {
    this.elements.forEach(element => {
      if (element.enabled) {
        element.update(deltaTime);
      }
    });
  }

  render(): void {
    this.elements.forEach(element => {
      if (element.visible) {
        element.render(this.context);
      }
    });
  }

  addElement(element: UIElement): void {
    this.elements.set(element.id, element);
  }

  removeElement(id: string): void {
    this.elements.delete(id);
  }

  getElement(id: string): UIElement | undefined {
    return this.elements.get(id);
  }

  handleInput(event: InputEvent): void {
    this.elements.forEach(element => {
      if (element.enabled && element.handleInput(event)) {
        return;
      }
    });
  }

  destroy(): void {
    this.elements.clear();
  }
}

// Export the main GameEngine class
export const GameEngine = GameEngineImpl;
export default GameEngineImpl;
