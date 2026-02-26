import test from 'node:test'
import assert from 'node:assert/strict'
import { getPaging } from './paging.js'

test('getPaging defaults to limit=10 offset=0 when no query', () => {
  const p = getPaging({})
  assert.equal(p.ok, true)
  assert.equal(p.limit, 10)
  assert.equal(p.offset, 0)
})

test('getPaging parses limit and offset from query', () => {
  const p = getPaging({ limit: '5', offset: '10' })
  assert.equal(p.ok, true)
  assert.equal(p.limit, 5)
  assert.equal(p.offset, 10)
})