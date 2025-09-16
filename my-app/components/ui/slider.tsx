"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  className?: string;
}

const SliderBase = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, value, defaultValue, min, max, step, onValueChange }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    value={value}
    defaultValue={defaultValue}
    min={min}
    max={max}
    step={step}
    onValueChange={onValueChange}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-800 border border-green-500/20">
      <SliderPrimitive.Range className="absolute h-full bg-green-500" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "block h-4 w-4 rounded-full border border-green-400 bg-black",
        "shadow-[0_0_8px_2px_rgba(16,185,129,0.5)]",
        "hover:border-green-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      )}
    />
  </SliderPrimitive.Root>
));
SliderBase.displayName = SliderPrimitive.Root.displayName;

export const Slider = SliderBase as React.ForwardRefExoticComponent<
  SliderProps & React.RefAttributes<any>
>;
