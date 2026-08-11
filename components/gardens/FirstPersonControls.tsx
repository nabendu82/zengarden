"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";

const SPEED = 4.2;
const LOOK_SENSITIVITY = 0.0022;

/** Briefly block pointer-lock so rake/drag clicks don't immediately re-lock. */
let suppressPointerLockUntil = 0;

export function suppressPointerLock(ms = 400) {
  suppressPointerLockUntil = performance.now() + ms;
  if (typeof document !== "undefined" && document.pointerLockElement) {
    document.exitPointerLock();
  }
}

type FirstPersonControlsProps = {
  eyeHeight?: number;
  bounds?: number;
  enabled?: boolean;
  /** Initial yaw in radians (0 looks toward -Z). */
  initialYaw?: number;
  onLockChange?: (locked: boolean) => void;
};

/**
 * WASD walk + pointer-lock mouse look (original Model Zen Garden style).
 * Click the canvas to capture the pointer · Esc frees the cursor.
 */
export function FirstPersonControls({
  eyeHeight = 1.6,
  bounds = 10,
  enabled = true,
  initialYaw = 0,
  onLockChange,
}: FirstPersonControlsProps) {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const euler = useRef({ yaw: initialYaw, pitch: -0.12 });
  const velocity = useRef(new Vector3());
  const locked = useRef(false);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    camera.position.y = eyeHeight;
    camera.rotation.order = "YXZ";
    camera.rotation.y = euler.current.yaw;
    camera.rotation.x = euler.current.pitch;
  }, [camera, eyeHeight]);

  useEffect(() => {
    if (!enabled) {
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
      }
      return;
    }

    const el = gl.domElement;

    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      // Esc frees look without being swallowed elsewhere when locked
      if (e.code === "Escape" && locked.current) {
        e.stopPropagation();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    const onClick = () => {
      if (!enabledRef.current) return;
      if (locked.current) return;
      if (performance.now() < suppressPointerLockUntil) return;
      el.requestPointerLock();
    };
    const onPointerLockChange = () => {
      const isLocked = document.pointerLockElement === el;
      locked.current = isLocked;
      onLockChange?.(isLocked);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!locked.current) return;
      euler.current.yaw -= e.movementX * LOOK_SENSITIVITY;
      euler.current.pitch -= e.movementY * LOOK_SENSITIVITY;
      euler.current.pitch = Math.max(-1.2, Math.min(1.2, euler.current.pitch));
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    el.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      el.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("mousemove", onMouseMove);
      if (document.pointerLockElement === el) document.exitPointerLock();
    };
  }, [gl, enabled, onLockChange]);

  useFrame((_, delta) => {
    if (!enabled) return;

    camera.rotation.order = "YXZ";
    camera.rotation.y = euler.current.yaw;
    camera.rotation.x = euler.current.pitch;

    const forward = new Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() > 0) forward.normalize();
    const right = new Vector3()
      .crossVectors(forward, new Vector3(0, 1, 0))
      .normalize();

    velocity.current.set(0, 0, 0);
    const k = keys.current;
    const slow = k.ShiftLeft || k.ShiftRight ? 0.35 : 1;
    if (k.KeyW || k.ArrowUp) velocity.current.add(forward);
    if (k.KeyS || k.ArrowDown) velocity.current.sub(forward);
    if (k.KeyA || k.ArrowLeft) velocity.current.sub(right);
    if (k.KeyD || k.ArrowRight) velocity.current.add(right);

    if (velocity.current.lengthSq() > 0) {
      velocity.current.normalize().multiplyScalar(SPEED * slow * delta);
      camera.position.add(velocity.current);
    }

    camera.position.y = eyeHeight;
    camera.position.x = Math.max(-bounds, Math.min(bounds, camera.position.x));
    camera.position.z = Math.max(-bounds, Math.min(bounds, camera.position.z));
  });

  return null;
}
