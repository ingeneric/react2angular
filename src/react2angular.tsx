import NgComponent from '@ingeneric/ngcomponent';
import { IAugmentedJQuery, IComponentOptions } from 'angular';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Wraps a React component in Angular. Returns a new Angular component.
 *
 * Usage:
 *
 *   ```ts
 *   type Props = { foo: number }
 *   class ReactComponent extends React.Component<Props, S> {}
 *   const AngularComponent = react2angular(ReactComponent, ['foo'])
 *   ```
 */
export function react2angular<Props extends { [k: string]: any }>(
  ReactComponent: React.ComponentType<Props>,
  bindingNames: (keyof Props)[] | null = null,
  injectNames: string[] = [],
): IComponentOptions {
  const names =
    bindingNames ||
    (ReactComponent.propTypes &&
      (Object.keys(ReactComponent.propTypes) as (keyof Props)[])) ||
    [];

  return {
    // bindings: fromPairs(names.map(_ => [_, '<'])),
    bindings: names.reduce(
      (acc, name) => {
        acc[name] = '<';
        return acc;
      },
      {} as Record<keyof Props, string>,
    ),
    controller: [
      '$element',
      ...injectNames,
      class extends NgComponent<Props> {
        root: any;
        isDestroyed = false;
        injectedProps: { [name: string]: any };

        constructor(
          private $element: IAugmentedJQuery,
          ...injectedProps: any[]
        ) {
          super();
          this.injectedProps = {};
          injectNames.forEach((name, i) => {
            this.injectedProps[name] = injectedProps[i];
          });
          this.root = createRoot($element[0] as any);
        }

        static get $$ngIsClass() {
          return true;
        }

        $onInit() {
          names.forEach((name) => {
            this.props[name] = (this as any)[name];
          });
        }

        override render() {
          if (!this.isDestroyed) {
            this.root.render(
              <ReactComponent
                {...this.props}
                {...(this.injectedProps as any)}
              />,
            );
          }
        }

        override componentWillUnmount() {
          this.isDestroyed = true;
          if (this.$element[0] && this.root) {
            this.root.unmount();
          }
        }
      },
    ],
  };
}