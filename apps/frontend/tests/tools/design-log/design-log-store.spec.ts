import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDesignLogStore } from '~/stores/designLog'

describe('Design Log Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('should initialize with empty state', () => {
      const store = useDesignLogStore()

      expect(store.state.projectName).toBe('')
      expect(store.state.projectDescription).toBe('')
      expect(store.state.designProblem).toBe('')
      expect(store.state.decisions).toEqual([])
      expect(store.state.iterations).toEqual([])
      expect(store.state.reflection).toBe('')
      expect(store.state.attachments).toEqual([])
      expect(store.state.saveStatus).toBe('idle')
      expect(store.state.errors).toEqual({})
      expect(store.state.isDirty).toBe(false)
    })
  })

  describe('word count', () => {
    it('should calculate word count correctly', () => {
      const store = useDesignLogStore()

      store.setDesignProblem('This is a test problem statement')
      expect(store.wordCount).toBe(6)
    })

    it('should handle empty string', () => {
      const store = useDesignLogStore()

      store.setDesignProblem('')
      expect(store.wordCount).toBe(0)
    })

    it('should handle multiple spaces', () => {
      const store = useDesignLogStore()

      store.setDesignProblem('This  has   multiple    spaces')
      expect(store.wordCount).toBe(4)
    })
  })

  describe('form validation', () => {
    it('should validate required fields', () => {
      const store = useDesignLogStore()

      const isValid = store.validateForm()

      expect(isValid).toBe(false)
      expect(store.state.errors.projectName).toBeDefined()
      expect(store.state.errors.designProblem).toBeDefined()
      expect(store.state.errors.decisions).toBeDefined()
    })

    it('should pass validation with all required fields', () => {
      const store = useDesignLogStore()

      store.setProjectInfo('Test Project', 'Description')
      store.setDesignProblem('Test problem')
      store.addDecision({
        title: 'Decision 1',
        description: 'Description',
        rationale: 'Rationale',
        impact: 'Impact',
      })

      const isValid = store.validateForm()

      expect(isValid).toBe(true)
      expect(Object.keys(store.state.errors).length).toBe(0)
    })

    it('should clear errors after validation passes', () => {
      const store = useDesignLogStore()

      store.validateForm()
      expect(store.state.errors.projectName).toBeDefined()

      store.setProjectInfo('Test Project', '')
      store.setDesignProblem('Test problem')
      store.addDecision({
        title: 'Decision',
        description: 'Desc',
        rationale: 'Rationale',
        impact: 'Impact',
      })

      store.validateForm()
      expect(store.state.errors.projectName).toBeUndefined()
    })
  })

  describe('project info', () => {
    it('should set project information', () => {
      const store = useDesignLogStore()

      store.setProjectInfo('My Project', 'Project description')

      expect(store.state.projectName).toBe('My Project')
      expect(store.state.projectDescription).toBe('Project description')
      expect(store.state.isDirty).toBe(true)
    })
  })

  describe('design decisions', () => {
    it('should add a decision', () => {
      const store = useDesignLogStore()

      store.addDecision({
        title: 'Decision 1',
        description: 'Description',
        rationale: 'Rationale',
        impact: 'Impact',
      })

      expect(store.state.decisions.length).toBe(1)
      expect(store.state.decisions[0].title).toBe('Decision 1')
      expect(store.state.decisions[0].id).toBeDefined()
      expect(store.state.decisions[0].timestamp).toBeInstanceOf(Date)
      expect(store.state.isDirty).toBe(true)
    })

    it('should update a decision', () => {
      const store = useDesignLogStore()

      store.addDecision({
        title: 'Original Title',
        description: 'Description',
        rationale: 'Rationale',
        impact: 'Impact',
      })

      const decisionId = store.state.decisions[0].id

      store.updateDecision(decisionId, { title: 'Updated Title' })

      expect(store.state.decisions[0].title).toBe('Updated Title')
    })

    it('should remove a decision', () => {
      const store = useDesignLogStore()

      store.addDecision({
        title: 'Decision 1',
        description: 'Description',
        rationale: 'Rationale',
        impact: 'Impact',
      })

      const decisionId = store.state.decisions[0].id

      store.removeDecision(decisionId)

      expect(store.state.decisions.length).toBe(0)
    })

    it('should generate unique IDs for decisions', () => {
      const store = useDesignLogStore()

      store.addDecision({
        title: 'Decision 1',
        description: 'Description',
        rationale: 'Rationale',
        impact: 'Impact',
      })

      store.addDecision({
        title: 'Decision 2',
        description: 'Description',
        rationale: 'Rationale',
        impact: 'Impact',
      })

      const ids = store.state.decisions.map((d) => d.id)
      expect(ids[0]).not.toBe(ids[1])
    })
  })

  describe('iterations', () => {
    it('should add an iteration', () => {
      const store = useDesignLogStore()

      store.addIteration({
        version: 'v1.0',
        date: new Date(),
        changes: 'Initial version',
        order: 0,
      })

      expect(store.state.iterations.length).toBe(1)
      expect(store.state.iterations[0].version).toBe('v1.0')
      expect(store.state.iterations[0].id).toBeDefined()
    })

    it('should update an iteration', () => {
      const store = useDesignLogStore()

      store.addIteration({
        version: 'v1.0',
        date: new Date(),
        changes: 'Original changes',
        order: 0,
      })

      const iterationId = store.state.iterations[0].id

      store.updateIteration(iterationId, { changes: 'Updated changes' })

      expect(store.state.iterations[0].changes).toBe('Updated changes')
    })

    it('should remove an iteration', () => {
      const store = useDesignLogStore()

      store.addIteration({
        version: 'v1.0',
        date: new Date(),
        changes: 'Changes',
        order: 0,
      })

      const iterationId = store.state.iterations[0].id

      store.removeIteration(iterationId)

      expect(store.state.iterations.length).toBe(0)
    })

    it('should reorder iterations', () => {
      const store = useDesignLogStore()

      store.addIteration({
        version: 'v1.0',
        date: new Date(),
        changes: 'First',
        order: 0,
      })

      store.addIteration({
        version: 'v2.0',
        date: new Date(),
        changes: 'Second',
        order: 1,
      })

      const iterations = [...store.state.iterations].reverse()

      store.reorderIterations(iterations)

      expect(store.state.iterations[0].version).toBe('v2.0')
      expect(store.state.iterations[1].version).toBe('v1.0')
      expect(store.state.iterations[0].order).toBe(0)
      expect(store.state.iterations[1].order).toBe(1)
    })
  })

  describe('attachments', () => {
    it('should add an attachment', () => {
      const store = useDesignLogStore()

      store.addAttachment({
        id: 'file-1',
        name: 'test.jpg',
        size: 1024,
        type: 'image/jpeg',
      })

      expect(store.state.attachments.length).toBe(1)
      expect(store.state.attachments[0].name).toBe('test.jpg')
    })

    it('should remove an attachment', () => {
      const store = useDesignLogStore()

      store.addAttachment({
        id: 'file-1',
        name: 'test.jpg',
        size: 1024,
        type: 'image/jpeg',
      })

      store.removeAttachment('file-1')

      expect(store.state.attachments.length).toBe(0)
    })
  })

  describe('save functionality', () => {
    it('should not save if validation fails', async () => {
      const store = useDesignLogStore()

      const result = await store.saveDesignLog()

      expect(result).toBe(false)
      expect(store.state.saveStatus).toBe('error')
    })

    it('should save when validation passes', async () => {
      const store = useDesignLogStore()

      store.setProjectInfo('Test Project', 'Description')
      store.setDesignProblem('Test problem')
      store.addDecision({
        title: 'Decision',
        description: 'Description',
        rationale: 'Rationale',
        impact: 'Impact',
      })

      const result = await store.saveDesignLog()

      expect(result).toBe(true)
      expect(store.state.saveStatus).toBe('saved')
      expect(store.state.isDirty).toBe(false)
    })

    it('should update save status during save process', async () => {
      const store = useDesignLogStore()

      store.setProjectInfo('Test Project', 'Description')
      store.setDesignProblem('Test problem')
      store.addDecision({
        title: 'Decision',
        description: 'Description',
        rationale: 'Rationale',
        impact: 'Impact',
      })

      const savePromise = store.saveDesignLog()

      expect(store.state.saveStatus).toBe('saving')

      await savePromise

      expect(store.state.saveStatus).toBe('saved')
    })
  })

  describe('reset functionality', () => {
    it('should reset form to initial state', () => {
      const store = useDesignLogStore()

      store.setProjectInfo('Test Project', 'Description')
      store.setDesignProblem('Test problem')
      store.addDecision({
        title: 'Decision',
        description: 'Description',
        rationale: 'Rationale',
        impact: 'Impact',
      })

      store.resetForm()

      expect(store.state.projectName).toBe('')
      expect(store.state.designProblem).toBe('')
      expect(store.state.decisions).toEqual([])
      expect(store.state.isDirty).toBe(false)
    })
  })

  describe('template loading', () => {
    it('should load data from template', () => {
      const store = useDesignLogStore()

      const template = {
        projectName: 'Template Project',
        projectDescription: 'Template Description',
        designProblem: 'Template Problem',
        reflection: 'Template Reflection',
      }

      store.loadFromTemplate(template)

      expect(store.state.projectName).toBe('Template Project')
      expect(store.state.projectDescription).toBe('Template Description')
      expect(store.state.designProblem).toBe('Template Problem')
      expect(store.state.reflection).toBe('Template Reflection')
      expect(store.state.isDirty).toBe(false)
    })
  })
})
