import { isEqual } from '../utils';

it('compares objects correctly', () => {
  expect(isEqual({}, {})).toBeTruthy();

  expect(isEqual({ prop1: true, prop2: false }, { prop1: true, prop2: false })).toBeTruthy();
  expect(isEqual({ prop2: false, prop1: true }, { prop1: true, prop2: false })).toBeTruthy();

  expect(isEqual({ prop2: false, prop1: { prop3: null } }, { prop1: { prop3: null }, prop2: false })).toBeTruthy();
  expect(
    isEqual({ prop2: 2, prop1: { prop3: 3, prop4: 4 } }, { prop1: { prop4: 4, prop3: 3 }, prop2: 2 }),
  ).toBeTruthy();

  expect(isEqual({ prop1: 1, prop2: 2 }, { prop1: 1, prop2: 2, prop3: 3 })).toBeFalsy();
  expect(isEqual({ prop1: 1, prop2: 2, prop3: 3 }, { prop1: 1, prop2: 2 })).toBeFalsy();
});

it('compares arrays correctly', () => {
  expect(isEqual([1, 2, 3], [1, 2, 3])).toBeTruthy();
  expect(isEqual([1, 2, [1, 2]], [1, 2, [1, 2]])).toBeTruthy();

  expect(isEqual([1, 2, 3], [1, 2, 3, 4])).toBeFalsy();
  expect(isEqual([2, 3, 1], [1, 2, 3])).toBeFalsy();
  expect(isEqual([1, [1, 2], 2], [1, 2, [1, 2]])).toBeFalsy();
});

it('compares primitives correctly', () => {
  expect(isEqual(1, 1)).toBeTruthy();
  expect(isEqual('hello', 'hello')).toBeTruthy();
  expect(isEqual(true, true)).toBeTruthy();

  expect(isEqual('hello', 'world')).toBeFalsy();
  expect(isEqual(1, 2)).toBeFalsy();
  expect(isEqual(true, false)).toBeFalsy();
});

it('compares null/undefined correctly', () => {
  expect(isEqual(null, null)).toBeTruthy();
  expect(isEqual(undefined, undefined)).toBeTruthy();

  expect(isEqual(null, undefined)).toBeFalsy();
  expect(isEqual(null, true)).toBeFalsy();
  expect(isEqual(null, false)).toBeFalsy();
  expect(isEqual(null, 1)).toBeFalsy();
  expect(isEqual(null, 'hello')).toBeFalsy();
  expect(isEqual(undefined, true)).toBeFalsy();
  expect(isEqual(undefined, false)).toBeFalsy();
  expect(isEqual(undefined, 1)).toBeFalsy();
  expect(isEqual(undefined, 'hello')).toBeFalsy();
});
