#### TLDR;
This repo is to help develop monorepo / shared components support in create-react-app.

For official status, see [2.0.0 roadmap](https://github.com/facebook/create-react-app/issues/3815).

#### Definitions
"cra-compatible": contains source with JSX + ES features supported by CRA/RS.

#### Standard Use Cases (UC)
1. Monorepo with shared cra-compatible source components
2. Monorepo with transitive shared cra-compatible source dependencies
3. Monorepo with multiple components in single package

#### Extended Use Cases (XC)
1. Non-cra-compatible shared components (not source, have their own build)
2. Cra-compatible shared components w/ source not at root  (e.g. nwb components)
3. Include a cra-compatible component, but don't build it.
4. Include cra-compatible shared source components from private registry
5. Include cra-compatible transitive source components from private registry

#### Unsupported Use Cases
1. Shared comps without monorepo tool
   * Monorepo tool necessary for dependency management, versioning, links.
2. Shared comps not at package level
   * Package level necessary for dependencies

#### Other Considerations
 1. Discourage non-standard components from being published (non-standard in ecosystem)
 2. Encourage best practices

#### Standard Use Cases Example Repo
```
monorepo/
  app1/
    package.json
    src/
      App.js
        import comp1 from 'comp1'; // UC#1: cra-compatible comp in monorepo
        import kewl1 from 'kewl-comps/comp1'; // UC#3
        import kewl3 from 'kewl-comps/comp3'; // UC#3
  comp1/
    package.json
    index.js
      import comp2 from 'comp2'; // UC#2: transitive source comp
  comp2/
    package.json
    index.js
  kewl-comps/
    package.json
    src/
      comp1.js
      comp2.js
      comp3.js
        import comp2 from './comp2';
```

#### Extended Use Cases Example Repo
```
monorepo/
  app1/
    package.json
    src/
      App.js
        import comp1 from 'comp1'; // UC#1: cra-compatible comp in monorepo
        import comp3 from 'comp3'; // XC#1: non-cra-compatible comp in monorepo
        import comp4 from 'comp4'; // XC#2: cra-compatible comp, source in /src
  app2/
    package.json
    src/
      App.js
        import comp4 from 'comp4'; // XC#3: cra-compatible, but don't build
  comp1/
    package.json
    index.js
      import comp2 from 'comp2'; // UC#2: transitive cra-compatible src
  comp2/
    package.json
    index.js
  comp3/
    package.json
    index.xjs  // XC#1: not cra-compatible
  comp4/
    package.json
    src/
      index.js // XC#2: cra-compatible comp, source in /src
```

#### sourceDependencies Proposal
* source dependencies are added to dependencies AND sourceDependencies
* Transitive source dependencies not specified at top-level, specified by direct includer
   * Assumed that the included source deps have same build rqmts
* Private flag required to discourage naughty publishing

##### sourceDependencies Example Repo
```
monorepo/
  app1/
    package.json
      dependencies: {
        "comp1": ">0.0.0",
        "comp3": ">0.0.0",
        "comp4": ">0.0.0",
        "comp5": ">0.0.0",
        "kewl-comps": ">0.0.0"
      }
      sourceDependencies: ["comp1", "comp4", "comp5", "kewl-comps"]
    src/
      App.js
        import comp1 from 'comp1'; // UC#1: import shared source comp
        import comp3 from 'comp3'; // XC#1: non-cra-compatible
        import comp4 from 'comp4'; // XC#2: cra-compatible, source in /src
        import comp5 from 'comp5'; // XC#4: cra-compatible source from private registry
        import kewl1 from 'kewl-comps/comp1'; // UC#3
        import kewl3 from 'kewl-comps/comp3'; // UC#3
    node_modules/
      comp5/  // XC#4: cra-compatible source from private registry
        package.json
          dependencies: ["comp6"]
          private: true
          source: "src"
          sourceDependencies: ["comp6"]
        src/
          index.js
            import comp6 from 'comp6'; // XC#5: transitive src from private registry
        node_modules/
          comp6/
            package.json
              source: "src"
              private: true
            src/
              index.js
  app2/
    package.json
      dependencies: {
        "comp1": ">0.0.0",
        "comp4": ">0.0.0"
      }
      sourceDependencies: ["comp1"]
    src/
      App.js
        import comp1 from 'comp1'; // UC#1: import shared source comp
        import comp4 from 'comp4'; // XC#3: import, but don't build
  comp1/
    package.json
      dependencies: ["comp2"]
      name: "comp1"
      private: true
      sourceDependencies: ["comp2"]
    index.js
      import comp2 from 'comp2'; // UC#2: transitive cra-compatible src
  comp2/
    package.json
      name: "comp2"
      private: true
    index.js
  comp3/
    package.json
      module: "lib"
      name: "comp3"
    index.xjs  // XC#1: not cra-compatible source, has own build
    lib/
      index.js // build output
  comp4/
    package.json
      name: "comp4"
      private: true
      source: "src/"
    src/
      index.js  // XC#2: source not in root
    kewl-comps/
      package.json
        source: "src"
        private: true
      src/
        comp1.js
        comp2.js
        comp3.js
          import comp2 from './comp2'; // import from within pkg
```

#### Some questions about how monorepo functionality should work:
1. Should tests from cra-comps run when running app tests?
1. Should files from cra-comps be linted when building app?  YES
1. Should a directory structure be enforced for cra-comps?  NO
1. How to flag components that should not be treated as cra-comps?  (or should cra-comps be by convention?)
