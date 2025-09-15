'use client';

// Advanced Input System for Lester's Arcade
// This file contains comprehensive input handling for keyboard, mouse, touch, and gamepad

export interface InputEvent {
  type: InputEventType;
  timestamp: number;
  target?: HTMLElement;
  data: any;
}

export enum InputEventType {
  KEY_DOWN = 'keydown',
  KEY_UP = 'keyup',
  KEY_PRESS = 'keypress',
  MOUSE_DOWN = 'mousedown',
  MOUSE_UP = 'mouseup',
  MOUSE_MOVE = 'mousemove',
  MOUSE_WHEEL = 'wheel',
  MOUSE_ENTER = 'mouseenter',
  MOUSE_LEAVE = 'mouseleave',
  TOUCH_START = 'touchstart',
  TOUCH_END = 'touchend',
  TOUCH_MOVE = 'touchmove',
  TOUCH_CANCEL = 'touchcancel',
  GAMEPAD_CONNECTED = 'gamepadconnected',
  GAMEPAD_DISCONNECTED = 'gamepaddisconnected',
  GAMEPAD_BUTTON_DOWN = 'gamepadbuttondown',
  GAMEPAD_BUTTON_UP = 'gamepadbuttonup',
  GAMEPAD_AXIS_CHANGE = 'gamepadaxischange'
}

export interface KeyState {
  key: string;
  code: string;
  pressed: boolean;
  pressedTime: number;
  releasedTime: number;
  repeat: boolean;
  modifiers: KeyModifiers;
}

export interface KeyModifiers {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
}

export interface MouseState {
  position: Vector2D;
  delta: Vector2D;
  buttons: Map<number, ButtonState>;
  wheel: number;
  wheelDelta: number;
  locked: boolean;
  movement: Vector2D;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface ButtonState {
  pressed: boolean;
  pressedTime: number;
  releasedTime: number;
  doubleClick: boolean;
  clickCount: number;
}

export interface TouchState {
  id: number;
  position: Vector2D;
  delta: Vector2D;
  pressure: number;
  radius: Vector2D;
  rotation: number;
  force: number;
  target: HTMLElement;
  startTime: number;
  startPosition: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
}

export interface GamepadState {
  id: string;
  index: number;
  connected: boolean;
  buttons: GamepadButton[];
  axes: number[];
  mapping: string;
  timestamp: number;
  vibration: VibrationActuator | null;
}

export interface GamepadButton {
  pressed: boolean;
  touched: boolean;
  value: number;
  pressedTime: number;
  releasedTime: number;
}

export interface VibrationActuator {
  playEffect(type: string, params: any): Promise<void>;
  reset(): Promise<void>;
}

export interface InputAction {
  name: string;
  keys: string[];
  mouseButtons: number[];
  gamepadButtons: number[];
  gamepadAxes: number[];
  touchGestures: TouchGesture[];
  modifiers?: KeyModifiers;
  enabled: boolean;
  priority: number;
  onPress?: (event: InputEvent) => void;
  onRelease?: (event: InputEvent) => void;
  onHold?: (event: InputEvent) => void;
}

export interface TouchGesture {
  type: 'tap' | 'doubleTap' | 'longPress' | 'swipe' | 'pinch' | 'rotate' | 'pan';
  direction?: 'up' | 'down' | 'left' | 'right';
  threshold?: number;
  duration?: number;
  distance?: number;
  fingers?: number;
}

export interface InputMapping {
  name: string;
  actions: Map<string, InputAction>;
  enabled: boolean;
  priority: number;
  onAction?: (actionName: string, event: InputEvent) => void;
}

export interface InputManager {
  keys: Map<string, KeyState>;
  mouse: MouseState;
  touches: Map<number, TouchState>;
  gamepads: Map<number, GamepadState>;
  mappings: Map<string, InputMapping>;
  events: InputEvent[];
  maxEvents: number;
  enabled: boolean;
  
  init(): void;
  update(): void;
  destroy(): void;
  
  // Keyboard
  isKeyDown(key: string): boolean;
  isKeyPressed(key: string): boolean;
  isKeyReleased(key: string): boolean;
  getKeyState(key: string): KeyState | undefined;
  
  // Mouse
  isMouseDown(button: number): boolean;
  isMousePressed(button: number): boolean;
  isMouseReleased(button: number): boolean;
  getMousePosition(): Vector2D;
  getMouseDelta(): Vector2D;
  getMouseWheel(): number;
  lockPointer(): Promise<void>;
  unlockPointer(): void;
  
  // Touch
  getTouchCount(): number;
  getTouch(id: number): TouchState | undefined;
  getAllTouches(): TouchState[];
  isTouchDown(id: number): boolean;
  isTouchPressed(id: number): boolean;
  isTouchReleased(id: number): boolean;
  
  // Gamepad
  getGamepadCount(): number;
  getGamepad(index: number): GamepadState | undefined;
  getAllGamepads(): GamepadState[];
  isGamepadButtonDown(index: number, button: number): boolean;
  isGamepadButtonPressed(index: number, button: number): boolean;
  isGamepadButtonReleased(index: number, button: number): boolean;
  getGamepadAxis(index: number, axis: number): number;
  vibrateGamepad(index: number, duration: number, intensity: number): void;
  
  // Actions
  createAction(name: string, config: Partial<InputAction>): InputAction;
  removeAction(name: string): void;
  getAction(name: string): InputAction | undefined;
  isActionDown(actionName: string): boolean;
  isActionPressed(actionName: string): boolean;
  isActionReleased(actionName: string): boolean;
  
  // Mappings
  createMapping(name: string, config: Partial<InputMapping>): InputMapping;
  removeMapping(name: string): void;
  getMapping(name: string): InputMapping | undefined;
  setActiveMapping(name: string): void;
  
  // Events
  addEventListener(type: InputEventType, callback: (event: InputEvent) => void): void;
  removeEventListener(type: InputEventType, callback: (event: InputEvent) => void): void;
  emit(event: InputEvent): void;
  getEvents(type?: InputEventType): InputEvent[];
  clearEvents(): void;
}

// Input Manager Implementation
export class InputManagerImpl implements InputManager {
  keys: Map<string, KeyState>;
  mouse: MouseState;
  touches: Map<number, TouchState>;
  gamepads: Map<number, GamepadState>;
  mappings: Map<string, InputMapping>;
  events: InputEvent[];
  maxEvents: number;
  enabled: boolean;

  private eventListeners: Map<InputEventType, Function[]>;
  private activeMapping: string | null;
  private lastMousePosition: Vector2D;
  private lastTouchPositions: Map<number, Vector2D>;
  private lastGamepadStates: Map<number, GamepadState>;
  private animationFrame: number | null;

  constructor() {
    this.keys = new Map();
    this.mouse = {
      position: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
      buttons: new Map(),
      wheel: 0,
      wheelDelta: 0,
      locked: false,
      movement: { x: 0, y: 0 }
    };
    this.touches = new Map();
    this.gamepads = new Map();
    this.mappings = new Map();
    this.events = [];
    this.maxEvents = 1000;
    this.enabled = true;
    this.eventListeners = new Map();
    this.activeMapping = null;
    this.lastMousePosition = { x: 0, y: 0 };
    this.lastTouchPositions = new Map();
    this.lastGamepadStates = new Map();
    this.animationFrame = null;
  }

  init(): void {
    this.setupEventListeners();
    this.startUpdateLoop();
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    document.addEventListener('keypress', (e) => this.handleKeyPress(e));

    // Mouse events
    document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('wheel', (e) => this.handleMouseWheel(e));
    document.addEventListener('mouseenter', (e) => this.handleMouseEnter(e));
    document.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));

    // Touch events
    document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    document.addEventListener('touchcancel', (e) => this.handleTouchCancel(e), { passive: false });

    // Gamepad events
    window.addEventListener('gamepadconnected', (e) => this.handleGamepadConnected(e));
    window.addEventListener('gamepaddisconnected', (e) => this.handleGamepadDisconnected(e));

    // Pointer lock events
    document.addEventListener('pointerlockchange', () => this.handlePointerLockChange());
    document.addEventListener('pointerlockerror', () => this.handlePointerLockError());
  }

  private startUpdateLoop(): void {
    const update = () => {
      if (this.enabled) {
        this.update();
        this.animationFrame = requestAnimationFrame(update);
      }
    };
    this.animationFrame = requestAnimationFrame(update);
  }

  update(): void {
    this.updateGamepads();
    this.updateActions();
    this.updateGestures();
  }

  private updateGamepads(): void {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad) {
        this.updateGamepadState(i, gamepad);
      }
    }
  }

  private updateGamepadState(index: number, gamepad: Gamepad): void {
    const lastState = this.lastGamepadStates.get(index);
    const currentState: GamepadState = {
      id: gamepad.id,
      index: gamepad.index,
      connected: true,
      buttons: gamepad.buttons.map((button, i) => ({
        pressed: button.pressed,
        touched: button.touched,
        value: button.value,
        pressedTime: lastState?.buttons[i]?.pressed ? lastState.buttons[i].pressedTime : 0,
        releasedTime: lastState?.buttons[i]?.pressed ? 0 : lastState?.buttons[i]?.releasedTime || 0
      })),
      axes: Array.from(gamepad.axes),
      mapping: gamepad.mapping,
      timestamp: gamepad.timestamp,
      vibration: (gamepad as any).vibrationActuator || null
    };

    // Update button states
    currentState.buttons.forEach((button, i) => {
      const lastButton = lastState?.buttons[i];
      if (button.pressed && !lastButton?.pressed) {
        button.pressedTime = Date.now();
        this.emit({
          type: InputEventType.GAMEPAD_BUTTON_DOWN,
          timestamp: Date.now(),
          data: { gamepad: index, button: i, value: button.value }
        });
      } else if (!button.pressed && lastButton?.pressed) {
        button.releasedTime = Date.now();
        this.emit({
          type: InputEventType.GAMEPAD_BUTTON_UP,
          timestamp: Date.now(),
          data: { gamepad: index, button: i, value: button.value }
        });
      } else if (button.pressed) {
        button.pressedTime = lastButton?.pressedTime || Date.now();
      } else {
        button.releasedTime = lastButton?.releasedTime || Date.now();
      }
    });

    // Check for axis changes
    currentState.axes.forEach((axis, i) => {
      const lastAxis = lastState?.axes[i] || 0;
      if (Math.abs(axis - lastAxis) > 0.1) {
        this.emit({
          type: InputEventType.GAMEPAD_AXIS_CHANGE,
          timestamp: Date.now(),
          data: { gamepad: index, axis: i, value: axis, delta: axis - lastAxis }
        });
      }
    });

    this.gamepads.set(index, currentState);
    this.lastGamepadStates.set(index, currentState);
  }

  private updateActions(): void {
    if (!this.activeMapping) return;

    const mapping = this.mappings.get(this.activeMapping);
    if (!mapping) return;

    mapping.actions.forEach((action, name) => {
      if (!action.enabled) return;

      const isDown = this.isActionDown(name);
      const wasDown = this.getActionState(name);

      if (isDown && !wasDown) {
        action.onPress?.(this.createActionEvent(name, 'press'));
      } else if (!isDown && wasDown) {
        action.onRelease?.(this.createActionEvent(name, 'release'));
      } else if (isDown && wasDown) {
        action.onHold?.(this.createActionEvent(name, 'hold'));
      }

      this.setActionState(name, isDown);
    });
  }

  private updateGestures(): void {
    // Update touch gestures
    this.touches.forEach((touch, id) => {
      const lastPosition = this.lastTouchPositions.get(id);
      if (lastPosition) {
        touch.delta = {
          x: touch.position.x - lastPosition.x,
          y: touch.position.y - lastPosition.y
        };
        touch.velocity = {
          x: touch.delta.x / (Date.now() - touch.startTime),
          y: touch.delta.y / (Date.now() - touch.startTime)
        };
      }
      this.lastTouchPositions.set(id, { ...touch.position });
    });
  }

  private createActionEvent(actionName: string, type: string): InputEvent {
    return {
      type: InputEventType.KEY_DOWN, // Default type
      timestamp: Date.now(),
      data: { action: actionName, type }
    };
  }

  private getActionState(actionName: string): boolean {
    // This would be implemented to track action states
    return false;
  }

  private setActionState(actionName: string, state: boolean): void {
    // This would be implemented to track action states
  }

  // Event Handlers
  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const code = event.code;
    const modifiers: KeyModifiers = {
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey
    };

    const keyState: KeyState = {
      key,
      code,
      pressed: true,
      pressedTime: Date.now(),
      releasedTime: 0,
      repeat: event.repeat,
      modifiers
    };

    this.keys.set(key, keyState);

    this.emit({
      type: InputEventType.KEY_DOWN,
      timestamp: Date.now(),
      target: event.target as HTMLElement,
      data: { key, code, modifiers, repeat: event.repeat }
    });
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const code = event.code;
    const modifiers: KeyModifiers = {
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey
    };

    const keyState = this.keys.get(key);
    if (keyState) {
      keyState.pressed = false;
      keyState.releasedTime = Date.now();
    }

    this.emit({
      type: InputEventType.KEY_UP,
      timestamp: Date.now(),
      target: event.target as HTMLElement,
      data: { key, code, modifiers }
    });
  }

  private handleKeyPress(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const code = event.code;
    const char = event.key;

    this.emit({
      type: InputEventType.KEY_PRESS,
      timestamp: Date.now(),
      target: event.target as HTMLElement,
      data: { key, code, char }
    });
  }

  private handleMouseDown(event: MouseEvent): void {
    const button = event.button;
    const position = { x: event.clientX, y: event.clientY };

    const buttonState: ButtonState = {
      pressed: true,
      pressedTime: Date.now(),
      releasedTime: 0,
      doubleClick: false,
      clickCount: 1
    };

    this.mouse.buttons.set(button, buttonState);
    this.mouse.position = position;

    this.emit({
      type: InputEventType.MOUSE_DOWN,
      timestamp: Date.now(),
      target: event.target as HTMLElement,
      data: { button, position }
    });
  }

  private handleMouseUp(event: MouseEvent): void {
    const button = event.button;
    const position = { x: event.clientX, y: event.clientY };

    const buttonState = this.mouse.buttons.get(button);
    if (buttonState) {
      buttonState.pressed = false;
      buttonState.releasedTime = Date.now();
    }

    this.mouse.position = position;

    this.emit({
      type: InputEventType.MOUSE_UP,
      timestamp: Date.now(),
      target: event.target as HTMLElement,
      data: { button, position }
    });
  }

  private handleMouseMove(event: MouseEvent): void {
    const position = { x: event.clientX, y: event.clientY };
    const delta = {
      x: position.x - this.lastMousePosition.x,
      y: position.y - this.lastMousePosition.y
    };

    this.mouse.position = position;
    this.mouse.delta = delta;
    this.mouse.movement = { x: event.movementX, y: event.movementY };

    this.lastMousePosition = position;

    this.emit({
      type: InputEventType.MOUSE_MOVE,
      timestamp: Date.now(),
      target: event.target as HTMLElement,
      data: { position, delta, movement: this.mouse.movement }
    });
  }

  private handleMouseWheel(event: WheelEvent): void {
    const delta = event.deltaY;
    this.mouse.wheel += delta;
    this.mouse.wheelDelta = delta;

    this.emit({
      type: InputEventType.MOUSE_WHEEL,
      timestamp: Date.now(),
      target: event.target as HTMLElement,
      data: { delta, wheel: this.mouse.wheel }
    });
  }

  private handleMouseEnter(event: MouseEvent): void {
    this.emit({
      type: InputEventType.MOUSE_ENTER,
      timestamp: Date.now(),
      target: event.target as HTMLElement,
      data: {}
    });
  }

  private handleMouseLeave(event: MouseEvent): void {
    this.emit({
      type: InputEventType.MOUSE_LEAVE,
      timestamp: Date.now(),
      target: event.target as HTMLElement,
      data: {}
    });
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();

    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const position = { x: touch.clientX, y: touch.clientY };

      const touchState: TouchState = {
        id: touch.identifier,
        position,
        delta: { x: 0, y: 0 },
        pressure: touch.force || 1,
        radius: { x: touch.radiusX || 0, y: touch.radiusY || 0 },
        rotation: touch.rotationAngle || 0,
        force: touch.force || 1,
        target: touch.target as HTMLElement,
        startTime: Date.now(),
        startPosition: { ...position },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 }
      };

      this.touches.set(touch.identifier, touchState);
      this.lastTouchPositions.set(touch.identifier, { ...position });

      this.emit({
        type: InputEventType.TOUCH_START,
        timestamp: Date.now(),
        target: touch.target as HTMLElement,
        data: { touch: touchState }
      });
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchState = this.touches.get(touch.identifier);

      if (touchState) {
        this.emit({
          type: InputEventType.TOUCH_END,
          timestamp: Date.now(),
          target: touch.target as HTMLElement,
          data: { touch: touchState }
        });

        this.touches.delete(touch.identifier);
        this.lastTouchPositions.delete(touch.identifier);
      }
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();

    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const position = { x: touch.clientX, y: touch.clientY };
      const touchState = this.touches.get(touch.identifier);

      if (touchState) {
        const lastPosition = this.lastTouchPositions.get(touch.identifier);
        if (lastPosition) {
          touchState.delta = {
            x: position.x - lastPosition.x,
            y: position.y - lastPosition.y
          };
        }

        touchState.position = position;
        touchState.pressure = touch.force || 1;
        touchState.radius = { x: touch.radiusX || 0, y: touch.radiusY || 0 };
        touchState.rotation = touch.rotationAngle || 0;
        touchState.force = touch.force || 1;

        this.emit({
          type: InputEventType.TOUCH_MOVE,
          timestamp: Date.now(),
          target: touch.target as HTMLElement,
          data: { touch: touchState }
        });
      }
    }
  }

  private handleTouchCancel(event: TouchEvent): void {
    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchState = this.touches.get(touch.identifier);

      if (touchState) {
        this.emit({
          type: InputEventType.TOUCH_CANCEL,
          timestamp: Date.now(),
          target: touch.target as HTMLElement,
          data: { touch: touchState }
        });

        this.touches.delete(touch.identifier);
        this.lastTouchPositions.delete(touch.identifier);
      }
    }
  }

  private handleGamepadConnected(event: GamepadEvent): void {
    const gamepad = event.gamepad;
    this.gamepads.set(gamepad.index, {
      id: gamepad.id,
      index: gamepad.index,
      connected: true,
      buttons: gamepad.buttons.map(button => ({
        pressed: button.pressed,
        touched: button.touched,
        value: button.value,
        pressedTime: 0,
        releasedTime: 0
      })),
      axes: Array.from(gamepad.axes),
      mapping: gamepad.mapping,
      timestamp: gamepad.timestamp,
      vibration: (gamepad as any).vibrationActuator || null
    });

    this.emit({
      type: InputEventType.GAMEPAD_CONNECTED,
      timestamp: Date.now(),
      data: { gamepad: gamepad.index, id: gamepad.id }
    });
  }

  private handleGamepadDisconnected(event: GamepadEvent): void {
    const gamepad = event.gamepad;
    this.gamepads.delete(gamepad.index);

    this.emit({
      type: InputEventType.GAMEPAD_DISCONNECTED,
      timestamp: Date.now(),
      data: { gamepad: gamepad.index, id: gamepad.id }
    });
  }

  private handlePointerLockChange(): void {
    this.mouse.locked = document.pointerLockElement !== null;
  }

  private handlePointerLockError(): void {
    this.mouse.locked = false;
  }

  // Public API
  isKeyDown(key: string): boolean {
    const keyState = this.keys.get(key.toLowerCase());
    return keyState?.pressed || false;
  }

  isKeyPressed(key: string): boolean {
    const keyState = this.keys.get(key.toLowerCase());
    return keyState?.pressed || false;
  }

  isKeyReleased(key: string): boolean {
    const keyState = this.keys.get(key.toLowerCase());
    return keyState ? !keyState.pressed : false;
  }

  getKeyState(key: string): KeyState | undefined {
    return this.keys.get(key.toLowerCase());
  }

  isMouseDown(button: number): boolean {
    const buttonState = this.mouse.buttons.get(button);
    return buttonState?.pressed || false;
  }

  isMousePressed(button: number): boolean {
    const buttonState = this.mouse.buttons.get(button);
    return buttonState?.pressed || false;
  }

  isMouseReleased(button: number): boolean {
    const buttonState = this.mouse.buttons.get(button);
    return buttonState ? !buttonState.pressed : false;
  }

  getMousePosition(): Vector2D {
    return { ...this.mouse.position };
  }

  getMouseDelta(): Vector2D {
    return { ...this.mouse.delta };
  }

  getMouseWheel(): number {
    return this.mouse.wheel;
  }

  async lockPointer(): Promise<void> {
    try {
      await document.body.requestPointerLock();
    } catch (error) {
      console.error('Failed to lock pointer:', error);
    }
  }

  unlockPointer(): void {
    document.exitPointerLock();
  }

  getTouchCount(): number {
    return this.touches.size;
  }

  getTouch(id: number): TouchState | undefined {
    return this.touches.get(id);
  }

  getAllTouches(): TouchState[] {
    return Array.from(this.touches.values());
  }

  isTouchDown(id: number): boolean {
    return this.touches.has(id);
  }

  isTouchPressed(id: number): boolean {
    return this.touches.has(id);
  }

  isTouchReleased(id: number): boolean {
    return !this.touches.has(id);
  }

  getGamepadCount(): number {
    return this.gamepads.size;
  }

  getGamepad(index: number): GamepadState | undefined {
    return this.gamepads.get(index);
  }

  getAllGamepads(): GamepadState[] {
    return Array.from(this.gamepads.values());
  }

  isGamepadButtonDown(index: number, button: number): boolean {
    const gamepad = this.gamepads.get(index);
    return gamepad?.buttons[button]?.pressed || false;
  }

  isGamepadButtonPressed(index: number, button: number): boolean {
    const gamepad = this.gamepads.get(index);
    return gamepad?.buttons[button]?.pressed || false;
  }

  isGamepadButtonReleased(index: number, button: number): boolean {
    const gamepad = this.gamepads.get(index);
    return gamepad ? !gamepad.buttons[button]?.pressed : false;
  }

  getGamepadAxis(index: number, axis: number): number {
    const gamepad = this.gamepads.get(index);
    return gamepad?.axes[axis] || 0;
  }

  vibrateGamepad(index: number, duration: number, intensity: number): void {
    const gamepad = this.gamepads.get(index);
    if (gamepad?.vibration) {
      gamepad.vibration.playEffect('dual-rumble', {
        duration: duration,
        strongMagnitude: intensity,
        weakMagnitude: intensity * 0.5
      });
    }
  }

  createAction(name: string, config: Partial<InputAction>): InputAction {
    const action: InputAction = {
      name,
      keys: config.keys || [],
      mouseButtons: config.mouseButtons || [],
      gamepadButtons: config.gamepadButtons || [],
      gamepadAxes: config.gamepadAxes || [],
      touchGestures: config.touchGestures || [],
      modifiers: config.modifiers,
      enabled: config.enabled ?? true,
      priority: config.priority || 0,
      onPress: config.onPress,
      onRelease: config.onRelease,
      onHold: config.onHold
    };

    return action;
  }

  removeAction(name: string): void {
    // Remove from all mappings
    this.mappings.forEach(mapping => {
      mapping.actions.delete(name);
    });
  }

  getAction(name: string): InputAction | undefined {
    // Search in active mapping first
    if (this.activeMapping) {
      const mapping = this.mappings.get(this.activeMapping);
      if (mapping?.actions.has(name)) {
        return mapping.actions.get(name);
      }
    }

    // Search in all mappings
    for (const mapping of this.mappings.values()) {
      if (mapping.actions.has(name)) {
        return mapping.actions.get(name);
      }
    }

    return undefined;
  }

  isActionDown(actionName: string): boolean {
    const action = this.getAction(actionName);
    if (!action) return false;

    // Check keys
    for (const key of action.keys) {
      if (this.isKeyDown(key)) return true;
    }

    // Check mouse buttons
    for (const button of action.mouseButtons) {
      if (this.isMouseDown(button)) return true;
    }

    // Check gamepad buttons
    for (const gamepadIndex of this.gamepads.keys()) {
      for (const button of action.gamepadButtons) {
        if (this.isGamepadButtonDown(gamepadIndex, button)) return true;
      }
    }

    return false;
  }

  isActionPressed(actionName: string): boolean {
    return this.isActionDown(actionName);
  }

  isActionReleased(actionName: string): boolean {
    return !this.isActionDown(actionName);
  }

  createMapping(name: string, config: Partial<InputMapping>): InputMapping {
    const mapping: InputMapping = {
      name,
      actions: new Map(),
      enabled: config.enabled ?? true,
      priority: config.priority || 0,
      onAction: config.onAction
    };

    this.mappings.set(name, mapping);
    return mapping;
  }

  removeMapping(name: string): void {
    this.mappings.delete(name);
    if (this.activeMapping === name) {
      this.activeMapping = null;
    }
  }

  getMapping(name: string): InputMapping | undefined {
    return this.mappings.get(name);
  }

  setActiveMapping(name: string): void {
    if (this.mappings.has(name)) {
      this.activeMapping = name;
    }
  }

  addEventListener(type: InputEventType, callback: (event: InputEvent) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(callback);
  }

  removeEventListener(type: InputEventType, callback: (event: InputEvent) => void): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: InputEvent): void {
    if (!this.enabled) return;

    // Add to events array
    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Call listeners
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  getEvents(type?: InputEventType): InputEvent[] {
    if (type) {
      return this.events.filter(event => event.type === type);
    }
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  destroy(): void {
    this.enabled = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('keypress', this.handleKeyPress);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('wheel', this.handleMouseWheel);
    document.removeEventListener('mouseenter', this.handleMouseEnter);
    document.removeEventListener('mouseleave', this.handleMouseLeave);
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchcancel', this.handleTouchCancel);
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    document.removeEventListener('pointerlockerror', this.handlePointerLockError);

    // Clear all data
    this.keys.clear();
    this.mouse.buttons.clear();
    this.touches.clear();
    this.gamepads.clear();
    this.mappings.clear();
    this.events = [];
    this.eventListeners.clear();
  }
}

// Export the main InputManager class
export const InputManager = InputManagerImpl;
export default InputManagerImpl;
