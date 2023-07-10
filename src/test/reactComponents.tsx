import { IScope } from 'angular';
import { IController } from 'angular';
import { IComponentOptions } from 'angular';
import { IHttpBackendService } from 'angular';
import { IHttpService } from 'angular';
import { IAugmentedJQuery } from 'angular';
import { ITimeoutService } from 'angular';
import { IQService } from 'angular';
import PropTypes from 'prop-types';
import React from 'react';
import { nextTick } from './utils.js';

interface Props {
  bar: boolean[];
  foo: number;
  children: React.ReactNode;
  baz(value: number): any;
}

export class TestOne extends React.Component<Props> {
  override render() {
    return (
      <div>
        <p>Foo: {this.props.foo}</p>
        <p>Bar: {this.props.bar.join(',')}</p>
        <p onClick={() => this.props.baz(42)}>Baz</p>
        {this.props.children}
      </div>
    );
  }

  override componentWillUnmount() {}
}

export const TestTwo: React.FunctionComponent<Props> = (props: Props) => (
  <div>
    <p>Foo: {props.foo}</p>
    <p>Bar: {props.bar.join(',')}</p>
    <p onClick={() => props.baz(42)}>Baz</p>
    {props.children}
  </div>
);

export const TestThree: React.FunctionComponent = () => <div>Foo</div>;

export class TestFour extends React.Component<Props> {
  override render() {
    return <div>Foo</div>;
  }
}

export class TestFive extends React.Component<Props> {
  static propTypes = {
    bar: PropTypes.array.isRequired,
    baz: PropTypes.func.isRequired,
    foo: PropTypes.number.isRequired,
  };

  override render() {
    return (
      <div>
        <p>Foo: {this.props.foo}</p>
        <p>Bar: {this.props.bar.join(',')}</p>
        <p onClick={() => this.props.baz(42)}>Baz</p>
        {this.props.children}
      </div>
    );
  }

  override componentWillUnmount() {}
}

export class TestSixService {
  constructor(
    private $q: IQService,
    private $timeout: ITimeoutService,
  ) {}

  foo() {
    nextTick(() => {
      this.$timeout.flush();
    });
    return this.$q.resolve('testSixService result');
  }
}

type DIProps = {
  $element: IAugmentedJQuery;
  $http: IHttpService;
  $httpBackend: IHttpBackendService;
  $timeout: ITimeoutService;
  testSixService: TestSixService;
};

export class TestSix extends React.Component<Props & DIProps> {
  override state = {
    elementText: '',
    result: '',
    testSixService: '',
  };

  override render() {
    return (
      <div>
        <p>{this.state.result}</p>
        <p>{this.state.elementText}</p>
        <p>{this.state.testSixService}</p>
        <p>{this.props.foo}</p>
        <span>$element result</span>
      </div>
    );
  }

  override componentDidMount() {
    this.setState({
      elementText: this.props.$element.find('span').text(),
    });
    this.props.$http.get('https://example.com/').then((_) => {
      this.setState({ result: _.data });
    });
    nextTick(() => {
      this.props.$httpBackend.flush();
    });
    this.props.testSixService.foo().then((_) => {
      this.setState({ testSixService: _ });
    });
  }
}

export function TestSeven(props: Props) {
  return <p>{props.foo}</p>;
}

interface TestEightProps {
  // onChange: jest.SpyInstance,
  onChange: (...args: any[]) => any;
  // onComponentWillUnmount: jest.SpyInstance,
  onComponentWillUnmount: (...args: any[]) => any;
  // onRender: jest.SpyInstance,
  onRender: (...args: any[]) => any;
  values: string[];
}

export class TestEight extends React.Component<TestEightProps> {
  override render() {
    this.props.onRender();
    return this.props.values.map((value, index) => (
      <div key={index}>{value}</div>
    ));
  }

  override componentWillUnmount() {
    this.props.onComponentWillUnmount();
    this.props.onChange(this.props.values.map((val) => `${val}ss`));
  }
}

export class TestEightWrapper implements IComponentOptions {
  bindings = {
    onComponentWillUnmount: '<',
    onRender: '<',
    values: '<',
  };
  template = `<test-angular-eight
                on-change="$ctrl.onChange"
                on-component-will-unmount="$ctrl.onComponentWillUnmount"
                on-render="$ctrl.onRender"
                values="$ctrl.values">
              </test-angular-eight>`;
  controller = class implements IController {
    values!: string[];
    $scope: IScope;

    constructor($scope: IScope) {
      this.$scope = $scope;
    }

    onChange = (values: string[]) => {
      this.values = values;
      this.$scope.$apply();
    };
  };
}
