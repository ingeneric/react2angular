<img alt="React to Angular: The easiest way to use React components in Angular 1" src="https://raw.githubusercontent.com/coatue-oss/react2angular/master/logo.png" width="400px" />

# react2angular [![Build Status][build]](https://github.com/ingeneric/react2angular/actions) [![npm]](https://www.npmjs.com/package/react2angular) [![license]](https://opensource.org/license/apache-2-0/)

[build]: https://github.com/ingeneric/react2angular/actions/workflows/npm-publish.yml/badge.svg
[npm]: https://img.shields.io/npm/v/@ingeneric/react2angular.svg
[license]: https://img.shields.io/npm/l/@ingeneric/react2angular.svg

An actualized version of the [coatue-oss/react2angular](https://github.com/coatue-oss/react2angular) package.

> The easiest way to embed React components in Angular 1 apps! (opposite of [angular2react](https://github.com/coatue-oss/angular2react))

## Installation

```sh
npm install @ingeneric/react2angular --save
```

**Warning:** This package is native [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) and no longer provides a CommonJS export. If your project uses CommonJS, you will have to [convert to ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) or use the [dynamic `import()`](https://v8.dev/features/dynamic-import) function. Please don't open issues for questions regarding CommonJS / ESM.

## Usage

### 1. Create a React component

```js
import { Component } from 'react'

class MyComponent extends Component {
  render() {
    return <div>
      <p>FooBar: {this.props.fooBar}</p>
      <p>Baz: {this.props.baz}</p>
    </div>
  }
}
```

### 2. Expose it to Angular

```js
import { react2angular } from 'react2angular'

angular
  .module('myModule', [])
  .component('myComponent', react2angular(MyComponent, ['fooBar', 'baz']))
```

Note: If you defined [`propTypes`](https://facebook.github.io/react/docs/typechecking-with-proptypes.html) on your component, they will be used to compute component's bindings, and you can omit the 2nd argument:

```js
...
  .component('myComponent', react2angular(MyComponent))
```

If `propTypes` are defined and you passed in a 2nd argument, the argument will override `propTypes`.

### 3. Use it in your Angular 1 code

```html
<my-component
  foo-bar="3"
  baz="'baz'"
></my-component>
```

Note: All React props are converted to AngularJS one-way bindings. If you are passing functions into your React component, they need to be passed as a function ref, rather than as an invokable expression. Keeping an existing AngularJS-style expression will result in infinite loops as the function re-evaluates on each digest loop.

## Dependency Injection

It's easy to pass services/constants/etc. to your React component: just pass them in as the 3rd argument, and they will be available in your component's Props. For example:

```js
import { Component } from 'react'
import { react2angular } from 'react2angular'

class MyComponent extends Component {
  state = {
    data: ''
  }
  componentDidMount() {
    this.props.$http.get('/path').then(res =>
      this.setState({ data: res.data })
    )
  }
  render() {
    return <div>
      { this.props.FOO }
      { this.state.data }
    </div>
  }
}

angular
  .module('myModule', [])
  .constant('FOO', 'FOO!')
  .component('myComponent', react2angular(MyComponent, [], ['$http', 'FOO']))
```

Note: If you have an injection that matches the name of a prop, then the value will be resolved with the injection, not the prop.

## Tests

```sh
npm test
```

## License

Apache 2.0
