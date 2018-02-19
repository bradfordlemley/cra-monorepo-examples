# RFC: sourceDependencies
Provides a mechanism for sharing source via "source packages".

co-authored by @gaearon

## Overview
"Source packages" are packages which may contain non-standard language features (e.g., React JSX) and are built by the consumer.

They are included as standard "dependencies" and declared as source by adding them to "sourceDependencies", such as:
```
package.json
{
  "dependencies": {"pkg1": ">0.0.0"},
  "sourceDependencies": ["pkg1"]
}
```

Source packages make it easy for developers to utilize shared source, allowing dependencies to be managed by standard tools, and allowing the consumer build system to easily support features like hot-reloading, de-duping, etc, across all source.

## Pseudo-algorithm for finding sourcePackages
```
sourcePackages = Map()

FindSourcePkgs(package.json):
  for each dep in package.json dependencies
    if dep is also in package.json sourceDependencies
      resolve dep package path
      if dep package.json has private flag
        sourcePackages[dep] = dep package path + dep package.json source
        FindSourcePkgs(dep package.json)

FindSourcePkgs(initial package.json)
```

Supports:
* Transitive source dependencies.
* Monorepos and private registries.
* Source entry points.

## Tests in Source Dependencies
In order to facilitate concurrent development of shared components, source dependencies should be testable by the consumer.

React-scripts will automatically include tests defined in source dependency packages along with the app tests.

## sourceDependencies Examples
```
repo/
  app1/
    package.json
      name: "app1"
      dependencies: {
        "comp1": ">0.0.0",
        "kewl-comps": ">0.0.0"
      }
      sourceDependencies: [
        "comp1",         // from within monorepo
        "kewl-comps"     // example with multiple modules
      ]
    src/
      App.js
        import comp1 from 'comp1';
        import kewl1 from 'kewl-comps/comp1';
  comp1/
    package.json
      dependencies: {
        "comp2": ">0.0.0"
      }
      sourceDependencies: [
        "comp2"         // transitive source dependency
      ]
      name: "comp1"
      private: true
    index.js
      import comp2 from 'comp2';         
      import intLib from './int-lib'; // internal transitive source dependency
    int-lib.js
  comp2/
    package.json
      name: "comp2"
      private: true
    index.js
  kewl-comps/
    package.json
      name: "kewl-comps"
      dependencies: {
        comp5: ">0.0.0"
      }
      sourceDependencies: [
        comp5  // from private registry
      ]
      source: "src"
      private: true
    src/
      comp1.js
        import comp2 from './comp2';
        import comp5 from 'comp5';
      comp2.js
    node_modules/
      comp5/  // installed from private registry
        package.json
          name: "comp5"
          dependencies: {
            "comp6": ">0.0.0"
          }
          sourceDependencies: [
            "comp6" // transitive source dependency from private registry
          ]
          source: "src"
          private: true
        src/
          index.js
            import comp6 from 'comp6';
        node_modules/
          comp6/  // nested, installed from private registry
            package.json
              name: "comp6"
              private: true
            index.js
```

## Limitations
* There is not a way to describe source, e.g. language features included in the source.
* In other words, the proposal assumes that all source dependencies have the same build requirements as the consumer.
