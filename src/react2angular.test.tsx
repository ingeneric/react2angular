import { jest } from '@jest/globals';
import angular from 'angular';
import type {
  ICompileService,
  IHttpBackendService,
  IHttpService,
  IQService,
  IRootScopeService,
  ITimeoutService,
} from 'angular';
import { toHaveBeenCalledBefore } from 'jest-extended';
import React from 'react';
import { Simulate } from 'react-dom/test-utils';
import { react2angular } from './react2angular.js';
import {
  TestAngularEight,
  TestAngularFour,
  TestAngularOne,
  TestAngularSeven,
  TestAngularSix,
  TestAngularThree,
  TestAngularTwo,
} from './test/angularComponents.js';
import {
  TestEightWrapper,
  TestFive,
  TestOne,
  TestSixService,
  TestThree,
} from './test/reactComponents.js';
import { delay } from './test/utils.js';

expect.extend({ toHaveBeenCalledBefore });

const angularMocks: { beforeEach?: () => void; afterEach?: () => void } = {};

angular
  .module('test', [])
  .component('testAngularOne', TestAngularOne)
  .component('testAngularTwo', TestAngularTwo)
  .component('testAngularThree', TestAngularThree)
  .component('testAngularFour', TestAngularFour)
  .service('testSixService', ['$q', '$timeout', TestSixService])
  .constant('foo', 'CONSTANT FOO')
  .component('testAngularSix', TestAngularSix)
  .component('testAngularSeven', TestAngularSeven)
  .component('testAngularEight', TestAngularEight)
  .component('testAngularEightWrapper', new TestEightWrapper());

angular.bootstrap(angular.element(), ['test'], { strictDi: true });

beforeAll(async () => {
  (window as any).jasmine = true;
  window.beforeEach = (fn) => {
    angularMocks.beforeEach = fn as any;
  };
  window.afterEach = (fn) => {
    angularMocks.afterEach = fn as any;
  };
  await import('angular-mocks');
});

describe('setup', () => {
  test('angular reference', () => {
    expect(window.angular).toBe(angular);
  });
  test('angular-mocks', async () => {
    expect(angular.mock).toBeDefined();
    expect(typeof angular.mock.module).toBe('function');
  });
});

describe('react2angular', () => {
  let $compile: ICompileService;
  let $http: IHttpService;
  let $httpBackend: IHttpBackendService;
  let $q: IQService;
  let $rootScope: IRootScopeService;
  let $timeout: ITimeoutService;

  beforeEach(() => {
    angularMocks.beforeEach?.();
    angular.mock.module('test');
    angular.mock.inject(function (
      _$compile_: ICompileService,
      _$http_: IHttpService,
      _$httpBackend_: IHttpBackendService,
      _$q_: IQService,
      _$rootScope_: IRootScopeService,
      _$timeout_: ITimeoutService,
    ) {
      $compile = _$compile_;
      $http = _$http_;
      $httpBackend = _$httpBackend_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
    });
  });

  afterEach(() => {
    angularMocks.afterEach?.();
  });

  describe('initialization', () => {
    test('should give an angular component', () => {
      expect(TestAngularOne.bindings).not.toBe(undefined);
      expect(TestAngularOne.controller).not.toBe(undefined);
    });

    test('should use the propTypes when present and no bindingNames were specified', () => {
      const reactAngularComponent = react2angular(TestFive);

      expect(reactAngularComponent.bindings).toEqual({
        bar: '<',
        baz: '<',
        foo: '<',
      });
    });

    test('should use the bindingNames when present over the propTypes', () => {
      const reactAngularComponent = react2angular(TestFive, ['foo']);

      expect(reactAngularComponent.bindings).toEqual({
        foo: '<',
      });
    });

    test('should have empty bindings when parameter is an empty array', () => {
      const reactAngularComponent = react2angular(TestFive, []);
      expect(reactAngularComponent.bindings).toEqual({});
    });

    test('should have empty bindings when parameter is not passed', () => {
      expect(react2angular(TestThree).bindings).toEqual({});
    });

    test('should use the injectNames for DI', () => {
      const defaultDi = (react2angular(TestThree).controller as any).slice(
        0,
        -1,
      );
      const injectedDi = (
        react2angular(TestThree, null, ['foo', 'bar']).controller as any
      ).slice(0, -1);
      expect(injectedDi).toEqual(defaultDi.concat(['foo', 'bar']));
    });

    test('should have default DI specifications if injectNames is empty', () => {
      const defaultDi = (react2angular(TestThree).controller as any).slice(
        0,
        -1,
      );
      const injectedDi = (
        react2angular(TestThree, null, []).controller as any
      ).slice(0, -1);
      expect(injectedDi).toEqual(defaultDi);
    });
  });

  describe('react classes', () => {
    test('should render', async () => {
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz: (value: number) => value + 1,
        foo: 1,
      });
      const element = angular.element(
        `<test-angular-one foo="foo" bar="bar" baz="baz"></test-angular-one>`,
      );
      $compile(element)(scope);
      $rootScope.$apply();
      await delay();
      expect(element.find('p').length).toBe(3);
    });

    test('should render (even if the component takes no props)', async () => {
      const scope = $rootScope.$new(true);
      const element = angular.element(
        `<test-angular-four></test-angular-four>`,
      );
      $compile(element)(scope);
      $rootScope.$apply();
      await delay();
      expect(element.text()).toBe('Foo');
    });

    test('should update', async () => {
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz: (value: number) => value + 1,
        foo: 1,
      });
      const element = angular.element(
        `<test-angular-one foo="foo" bar="bar" baz="baz"></test-angular-one>`,
      );
      $compile(element)(scope);
      $rootScope.$apply();
      await delay();
      expect(element.find('p').eq(1).text()).toBe('Bar: true,false');
      scope.$apply(() => (scope.bar = [false, true, true]));
      await delay();
      expect(element.find('p').eq(1).text()).toBe('Bar: false,true,true');
    });

    test('should destroy', async () => {
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz: (value: number) => value + 1,
        foo: 1,
      });
      const element = angular.element(
        `<test-angular-one foo="foo" bar="bar" baz="baz"></test-angular-one>`,
      );
      $compile(element)(scope);
      $rootScope.$apply();
      await delay();
      jest.spyOn(TestOne.prototype, 'componentWillUnmount');
      scope.$destroy();
      await delay();
      expect(TestOne.prototype.componentWillUnmount).toHaveBeenCalled();
    });

    test('should take callbacks', async () => {
      // const baz = jest.fn('baz')
      const baz = jest.fn();
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz,
        foo: 1,
      });
      const element = angular.element(
        `<test-angular-one foo="foo" bar="bar" baz="baz"></test-angular-one>`,
      );
      $compile(element)(scope);
      $rootScope.$apply();
      await delay();
      Simulate.click(element.find('p').eq(2)[0] as any);
      expect(baz).toHaveBeenCalledWith(42);
    });

    // TODO: support children
    test('should not support children', async () => {
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz: (value: number) => value + 1,
        foo: 1,
      });
      const element = angular.element(
        `<test-angular-one foo="foo" bar="bar" baz="baz"><span>Transcluded</span></test-angular-one>`,
      );
      $compile(element)(scope);
      $rootScope.$apply();
      await delay();
      expect(element.find('span').length).toBe(0);
    });

    test('should take injections, which override props', async () => {
      $httpBackend.expectGET('https://example.com/').respond('$http response');

      const scope = Object.assign($rootScope.$new(true), {
        foo: 'FOO',
      });

      const element1 = angular.element(
        `<test-angular-six foo="foo"></test-angular-six>`,
      );
      $compile(element1)(scope);

      const element2 = angular.element(
        `<test-angular-seven foo="foo"></test-angular-seven>`,
      );
      $compile(element2)(scope);

      $rootScope.$apply();
      await delay(100);

      // $http is injected
      expect(element1.find('p').eq(0).text()).toBe('$http response');
      // $element is injected
      expect(element1.find('p').eq(1).text()).toBe('$element result');
      // testSixService is injected
      expect(element1.find('p').eq(2).text()).toBe('testSixService result');
      // injections should override props
      expect(element1.find('p').eq(3).text()).toBe('CONSTANT FOO');
      // injections should override props
      expect(element2.find('p').text()).toBe('CONSTANT FOO');
    });
  });

  describe('react stateless components', () => {
    test('should render', async () => {
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz: (value: number) => value + 1,
        foo: 1,
      });
      const element = angular.element(
        `<test-angular-two foo="foo" bar="bar" baz="baz"></test-angular-two>`,
      );
      $compile(element)(scope);
      $rootScope.$apply();
      await delay();
      expect(element.find('p').length).toBe(3);
    });

    test('should render (even if the component takes no props)', async () => {
      const scope = $rootScope.$new(true);
      const element = angular.element(
        `<test-angular-three></test-angular-three>`,
      );
      $compile(element)(scope);
      $rootScope.$apply();
      await delay();
      expect(element.text()).toBe('Foo');
    });

    test('should update', async () => {
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz: (value: number) => value + 1,
        foo: 1,
      });
      const element = angular.element(
        `<test-angular-two foo="foo" bar="bar" baz="baz"></test-angular-two>`,
      );
      $compile(element)(scope);
      $rootScope.$apply();
      await delay();
      expect(element.find('p').eq(1).text()).toBe('Bar: true,false');
      scope.$apply(() => (scope.bar = [false, true, true]));
      await delay();
      expect(element.find('p').eq(1).text()).toBe('Bar: false,true,true');
    });

    // TODO: figure out how to test this
    test.skip('should destroy', async () => {});

    test('should take callbacks', async () => {
      // const baz = jest.fn('baz')
      const baz = jest.fn();
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz,
        foo: 1,
      });
      const element = angular.element(
        `<test-angular-two foo="foo" bar="bar" baz="baz"></test-angular-two>`,
      );
      $compile(element)(scope);
      $rootScope.$apply();
      await delay();
      Simulate.click(element.find('p').eq(2)[0] as any);
      expect(baz).toHaveBeenCalledWith(42);
    });

    // TODO: support children
    test('should not support children', async () => {
      const scope = Object.assign($rootScope.$new(true), {
        bar: [true, false],
        baz: (value: number) => value + 1,
        foo: 1,
      });
      const element = angular.element(
        `<test-angular-two foo="foo" bar="bar" baz="baz"><span>Transcluded</span></test-angular-two>`,
      );
      $compile(element)(scope);
      $rootScope.$apply();
      await delay();
      expect(element.find('span').length).toBe(0);
    });

    test('should not call render after component unmount', async () => {
      // const componentWillUnmountSpy = jest.fn('componentWillUnmount')
      const componentWillUnmountSpy = jest.fn();
      // const renderSpy = jest.fn('render')
      const renderSpy = jest.fn();

      const scope = Object.assign($rootScope.$new(true), {
        onComponentWillUnmount: componentWillUnmountSpy,
        onRender: renderSpy,
        values: ['val1'],
      });
      const element = angular.element(`
                <test-angular-eight-wrapper
                  on-render="onRender"
                  on-component-will-unmount="onComponentWillUnmount"
                  values="values">
                </test-angular-eight-wrapper>
            `);

      $compile(element)(scope);

      const childScope = angular
        .element(element.find('test-angular-eight'))
        .scope();
      $rootScope.$apply();
      await delay();

      // Erase first render caused on apply
      renderSpy.mockClear();

      // Destroy child component to cause unmount
      childScope.$destroy();

      // Make sure render on child was not called after unmount
      expect(componentWillUnmountSpy.mock.calls.length).toEqual(1);
      expect(renderSpy.mock.calls.length).toEqual(0);
      expect(componentWillUnmountSpy).not.toHaveBeenCalledBefore(renderSpy);
    });
  });
});
