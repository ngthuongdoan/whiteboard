"use client"

import * as React from "react"

export interface Position {
  x: number
  y: number
  elementX?: number
  elementY?: number
  elementPositionX?: number
  elementPositionY?: number
}

export function useMousePosition<T extends HTMLElement>(): [Position, React.RefObject<T>] {
  const [state, setState] = React.useState<Position>({
    x: 0,
    y: 0,
  })

  const ref = React.useRef<T>(null)

  React.useEffect(() => {
    const updatePosition = (clientX: number, clientY: number) => {
      const newState: Position = {
        x: clientX,
        y: clientY,
      }

      if (ref.current?.nodeType === Node.ELEMENT_NODE) {
        const { left, top } = ref.current.getBoundingClientRect()
        const elementPositionX = left
        const elementPositionY = top
        const elementX = clientX - elementPositionX
        const elementY = clientY - elementPositionY

        newState.elementPositionX = elementPositionX
        newState.elementPositionY = elementPositionY
        newState.elementX = elementX
        newState.elementY = elementY
      }

      setState(newState)
    }

    const handleMouseMove = (event: MouseEvent) => {
      updatePosition(event.clientX, event.clientY)
    }

    const handlePointerMove = (event: PointerEvent) => {
      updatePosition(event.clientX, event.clientY)
    }

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) {
        return
      }
      updatePosition(touch.clientX, touch.clientY)
    }

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) {
        return
      }
      updatePosition(touch.clientX, touch.clientY)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("pointermove", handlePointerMove)
    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: true })

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("pointermove", handlePointerMove)
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
    }
  }, [])

  return [state, ref as React.RefObject<T>]
}
