/**
 * Focus Trap Composable Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useFocusTrap } from '~/composables/useFocusTrap'

describe('useFocusTrap', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    container.innerHTML = `
      <button id="trigger">Open</button>
      <div id="modal">
        <button id="close">Close</button>
        <input id="input1" type="text" />
        <input id="input2" type="text" />
        <button id="submit">Submit</button>
      </div>
    `
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should trap focus within container', async () => {
    const modalRef = ref(document.getElementById('modal'))
    const isActive = ref(true)

    useFocusTrap(modalRef, isActive)

    await nextTick()

    // First element should be focused
    const closeButton = document.getElementById('close')
    expect(document.activeElement).toBe(closeButton)
  })

  it('should cycle focus from last to first element on Tab', async () => {
    const modalRef = ref(document.getElementById('modal'))
    const isActive = ref(true)

    useFocusTrap(modalRef, isActive)

    await nextTick()

    // Focus last element
    const submitButton = document.getElementById('submit')
    submitButton?.focus()

    // Press Tab
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    document.dispatchEvent(event)

    await nextTick()

    // Should cycle to first element
    const closeButton = document.getElementById('close')
    expect(document.activeElement).toBe(closeButton)
  })

  it('should return focus to trigger element when deactivated', async () => {
    const triggerButton = document.getElementById('trigger')
    triggerButton?.focus()

    const modalRef = ref(document.getElementById('modal'))
    const isActive = ref(true)

    useFocusTrap(modalRef, isActive, { returnFocus: true })

    await nextTick()

    // Focus should move to modal
    expect(document.activeElement).not.toBe(triggerButton)

    // Deactivate
    isActive.value = false
    await nextTick()

    // Focus should return to trigger
    expect(document.activeElement).toBe(triggerButton)
  })

  it('should respect custom initial focus', async () => {
    const initialFocusRef = ref(document.getElementById('input1'))
    const modalRef = ref(document.getElementById('modal'))
    const isActive = ref(true)

    useFocusTrap(modalRef, isActive, { initialFocus: initialFocusRef })

    await nextTick()

    // Custom element should be focused
    expect(document.activeElement).toBe(initialFocusRef.value)
  })
})
