# RFC: Source Packages
A developer-friendly, tool-friendly, and eco-system-friendly mechanism for sharing source.

co-authored with @gaearon

## Overview

"Source packages" are exactly the same as standard npm packages, except that they may contain non-standard language features (e.g. React JSX), and they are built by the consumer.

Being standard npm packages, they can be managed by standard tools and can be truly modular since they can declare their own dependencies.

Being built by the consumer, the consuming build can treat them as if they were part of its own source, providing the same build features and developer experience, e.g. hot-reloading, de-duping, etc.

"Source packages" are included as standard dependencies and declared as source by including them in sourceDependencies:
```
package.json
{
  "dependencies": {"pkg1": ">0.0.0"},
  "sourceDependencies": ["pkg1"]
}
```

Since source packages may contain non-standard language features, they should be marked as "private".  They can be contained in monorepos.  They should only be published to private registries.

## Pseudo-algorithm for finding source packages
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

## Testing
Source packages should be testable by the consumer, just like the consumer's own source is tested.

This facilitates concurrent development of shared components.

## Source code type
This proposal does not include a mechansim to describe source code, e.g. language features used.

The proposal assumes that the consumer knows which source packages it is including and is able to build them, e.g. the included source packages have the same build requirements as the consumer's own source.

## Example
This repo demonstrates many of the use cases supported by this proposal.

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
        "comp1",         // single module in package
        "kewl-comps"     // multiple modules in package
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
        comp5
      ]
      source: "src"  // source entry point
      private: true
    src/
      comp1.js
        import comp2 from './comp2'; // internal transitive source dependency
        import comp5 from 'comp5';
      comp2.js
    node_modules/
      comp5/  // source dependency from private registry
        package.json
          name: "comp5"
          dependencies: {
            "comp6": ">0.0.0"
          }
          sourceDependencies: [
            "comp6" // transitive source dependency
          ]
          source: "src"
          private: true
        src/
          index.js
            import comp6 from 'comp6';
        node_modules/
          comp6/  // transitive source dependency from private registry
            package.json
              name: "comp6"
              private: true
            index.js
```
