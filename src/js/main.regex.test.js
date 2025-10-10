// main.regex.test.js

describe('Username regex validation', () => {
  // The regex from main.js
  const usernameRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

  it('matches valid username', () => {
    expect(usernameRegex.test('Valid1@Name')).toBe(true)
  })

  it('fails for missing uppercase', () => {
    expect(usernameRegex.test('valid1@name')).toBe(false)
  })

  it('fails for missing digit', () => {
    expect(usernameRegex.test('Valid@Name')).toBe(false)
  })

  it('fails for missing special character', () => {
    expect(usernameRegex.test('Valid1234')).toBe(false)
  })

  it('fails for less than 8 chars', () => {
    expect(usernameRegex.test('V1@a')).toBe(false)
  })

  it('fails for empty string', () => {
    expect(usernameRegex.test('')).toBe(false)
  })
})
