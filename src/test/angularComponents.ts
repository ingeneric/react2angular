import { react2angular } from '../react2angular.js';
import {
  TestEight,
  TestFour,
  TestOne,
  TestSeven,
  TestSix,
  TestThree,
  TestTwo,
} from './reactComponents.js';

export const TestAngularOne = react2angular(TestOne, ['foo', 'bar', 'baz']);
export const TestAngularTwo = react2angular(TestTwo, ['foo', 'bar', 'baz']);
export const TestAngularThree = react2angular(TestThree);
export const TestAngularFour = react2angular(TestFour);
export const TestAngularSix = react2angular(
  TestSix,
  ['foo'],
  ['$http', '$element', '$httpBackend', '$timeout', 'testSixService', 'foo'],
);
export const TestAngularSeven = react2angular(TestSeven, null, ['foo']);
export const TestAngularEight = react2angular(TestEight, [
  'values',
  'onComponentWillUnmount',
  'onRender',
  'onChange',
]);
