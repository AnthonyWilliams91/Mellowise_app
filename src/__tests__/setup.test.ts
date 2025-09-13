/**
 * Basic Jest setup test to verify configuration
 */

describe('Jest Setup', () => {
  test('should run basic test', () => {
    expect(1 + 1).toBe(2)
  })

  test('should have localStorage mock', () => {
    expect(global.localStorage).toBeDefined()
    expect(typeof global.localStorage.setItem).toBe('function')
  })
})