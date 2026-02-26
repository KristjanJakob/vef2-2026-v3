import test from 'node:test'
import assert from 'node:assert/strict'
import { slugify } from './slug.js'

test('slugify makes lowercase hyphen slug and trims', () => {
  assert.equal(slugify(' Fake news title 1 '), 'fake-news-title-1')
})

test('slugify removes punctuation and collapses spaces', () => {
  assert.equal(slugify('Hello, World!!!'), 'hello-world')
})