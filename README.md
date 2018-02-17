#### TLDR;
This repo is to help develop monorepo / shared components support in create-react-app.

* Follow [2.0.0 roadmap](https://github.com/facebook/create-react-app/issues/3815) for more alpha release info.

#### Definitions
"cra-compatible": contains source with JSX + ES features supported by Cra/Rs

#### Standard Use Cases (UC)
1. Monorepo with shared cra-compatible source components
2. Monorepo with transitive shared cra-compatible source dependencies
```
monorepo/
  app1/
    src/
      App.js: import comp1 from 'comp1'
  app2/
    src/
      App.js: import comp1 from 'comp1'
  comp1/
    index.js: import comp2 from 'comp2'  <-- transitive
  comp2/
    index.js
```

#### Extended Use Cases (XC)
1. Non-cra-compatible shared components (not source, have their own build)
2. Cra-compatible shared components w/ source not at root  (e.g. nwb components)
3. Include a cra-compatible component, but don't build it.
4. Include cra-compatible shared source components from private registry
5. Include cra-compatible transitive source components from private registry
6. Shared comps without monorepo tool, ie. symlink-ish
7. Shared comps without monorepo tool, ie. symlink-ish
```
monorepo/
  package.json
    workspaces: ["app*", "comp*"]
  app1/
    src/
      App.js:
        import comp1 from 'comp1'  <-- UC#1: import shared source comp
        import comp4 from 'comp4'  <-- XC#3: import, but don't build
  app2/
    src/
      App.js:
        import comp1 from 'comp1'
        import comp3 from 'comp3'  <-- XC#1: non-cra-compatible
        import comp4 from 'comp4'  <-- XC#2: cra-compatible, source in /src
  comp1/
    index.js: import comp2 from 'comp2'  <-- UC#2: transitive cra-compatible src
  comp2/
    index.js
  comp3/  <-- not cra-compatible
    index.xjs
  comp4/
    src/
      index.js
  nonws-comp1/
    package.json
      source: "src"
    src/
      index.js
  nonws-comp2/
    index.js
```

#### Other Requirements
Discourage/prevent components from being published with only source (non-standard in ecosystem)

#### Proposals
1. sourceDependencies in package.json.
```
monorepo/
  app1/
    package.json
      dependencies: ["comp4"]
      sourceDependencies: ["comp1"]
    src/
      App.js
        import comp1 from 'comp1' // UC#1: import shared source comp
        import comp4 from 'comp4' // XC#3: import, but don't build
  app2/
    package.json
      dependencies:  ["comp1", "comp3", "comp4", "comp5"]
      sourceDependencies: ["comp1", "comp4", "comp5"],
    src/
      App.js
        import comp1 from 'comp1'
        import comp3 from 'comp3' // XC#1: non-cra-compatible
        import comp4 from 'comp4' // XC#2: cra-compatible, source in /src
        import comp5 from 'comp5' // XC#4: cra-compatible source from private registry
    node_modules/
      comp5/
        package.json
          dependencies: ["comp6"],
          private: true,
          source: "src",
          sourceDependencies: ["comp6"]
        src/
          index.js
            import comp6 from 'comp6' // XC#5: transitive src from private registry
        node_modules/
          comp6/
            package.json
              source: "src",
              private: true
            src/
              index.js
  comp1/
    package.json
      dependencies: ["comp2"],
      name: "comp1",
      private: true,
      sourceDependencies: ["comp2"]
    index.js
      import comp2 from 'comp2' // UC#2: transitive cra-compatible src
  comp2/
    package.json
      name: "comp2"
      private: true
    index.js
  comp3/
    package.json
      module: "lib",
      name: "comp3"
    index.xjs  // XC#1: not cra-compatible source, has own build
    lib/
      index.js // build output
  comp4/
    package.json
      name: "comp4",
      private: true,
      source: "src/"
    src/
      index.js  // XC#2: source not in root
```
2. Current implementation Assume any
  * See [Monorepo Section in User Guide](https://github.com/facebook/create-react-app/blob/next/packages/react-scripts/template/README.md#sharing-components-in-a-monorepo) for more info.


### Issues
There are two main issues regarding monorepo support in CRA:
1. [Issue 3031](https://github.com/facebookincubator/create-react-app/issues/3031): Can't run create-react-app in workspace
   * This issue is mainly just that monorepo tools (yarn/lerna) can hoist react-scripts to a top-level node_modules which breaks some create-react-app code that expects react-scripts to be in app's node_modules.
   * This is fixed by [PR 3435](https://github.com/facebookincubator/create-react-app/pull/3435) ([rmhartog's fork](https://github.com/rmhartog/create-react-app/tree/support-yarn-workspaces)).
1. [Issue 1333](https://github.com/facebookincubator/create-react-app/issues/1333): Support Lerna and/or Yarn Workspaces
   * This is the issue for actually supporting shared source in monorepos.
   * See [PR 3741](https://github.com/facebookincubator/create-react-app/pull/3741) (merged)



```
monorepo
  |--packages.json: workspaces: ["apps/*", "comps/*", "cra-comps/*"] <-- (yarn workspace)
  |--apps
    |--cra-app1 <-- basic cra-app, doesn't use any monorepo comps
    |--cra-app2 <-- basic cra-app, doesn't use any monorepo comps
    |--cra-app3 <-- uses some monorepo comps
      |--package.json: sourceDependencies: ["../../comps/comp1"]
  |--comps
    |--comp1  <-- standard shared comp, ok!
      |--package.json: main: comp1.js
      |--comp1.js
      |--comp1.test.js
    |--comp2  <-- comp with dependency on another cra-comp, ok!
      |--package.json: sourceDependencies: ["../comp1"]
      |--index.js: import comp1 from 'comp1'
      |--index.test.js
    |--comp3  <-- comp w/ built output, ok, but will (unnecessarily) transpile
      |--package.json: main: build/index.js
      |--build/index.js  <-- don't transpile?
      |--index.js
      |--index.test.js <-- don't test?
    |--comp4  <-- cra-comp w/ source under /src, not handled (tbd)
      |--package.json: dependencies: ["comp1"]
      |--src
        |--index.js: import comp1 from 'comp1'
        |--index.test.js
    |--comp5  <-- comp with its own build and test, not handled (tbd)
      |--package.json: dependencies: ["comp1"]
      |--index.js: import comp1 from 'comp1'
      |--index.test.js
    |--comp6  <-- comp with dependency on another cra-comp, not source
      |--package.json: dependencies: {"comp1": "^0.1.0"}
      |--index.js: import comp1 from 'comp1'
      |--index.test.js
    |--comp7  <-- comp with src dir
      |--package.json: source: "src"
      |--src
        |--index.js
        |--index.test.js

```

#### Example monorepo
```
monorepo
  |--packages.json: workspaces: ["apps/*", "comps/*", "cra-comps/*"] <-- (yarn workspace)
  |--lerna.json: packages: ["apps/*", "comps/*", "cra-comps/*"] <-- (lerna w/o yarn workspace)
  |--apps
    |--cra-app1 <-- basic cra-app, doesn't use any monorepo comps
    |--cra-app2 <-- basic cra-app, doesn't use any monorepo comps
    |--cra-app3 <-- uses some monorepo comps
      |--package.json: dependencies: ["comp1": <vsn>, "comp2": <vsn>]
  |--comps
    |--comp1  <-- standard shared comp, ok!
      |--package.json: main: comp1.js
      |--comp1.js
      |--comp1.test.js
    |--comp2  <-- comp with dependency on another cra-comp, ok!
      |--package.json: dependencies: ["comp1"]
      |--index.js: import comp1 from 'comp1'
      |--index.test.js
    |--comp3  <-- comp w/ built output, ok, but will (unnecessarily) transpile
      |--package.json: main: build/index.js
      |--build/index.js  <-- don't transpile?
      |--index.js
      |--index.test.js <-- don't test?
    |--comp4  <-- cra-comp w/ source under /src, not handled (tbd)
      |--package.json: dependencies: ["comp1"]
      |--src
        |--index.js: import comp1 from 'comp1'
        |--index.test.js
    |--comp5  <-- comp with its own build and test, not handled (tbd)
      |--package.json: dependencies: ["comp1"]
      |--index.js: import comp1 from 'comp1'
      |--index.test.js
```

#### Some questions about how monorepo functionality should work:
1. Should tests from cra-comps run when running app tests?
1. Should files from cra-comps be linted when building app?
1. Should a directory structure be enforced for cra-comps?
1. How to flag components that should not be treated as cra-comps?  (or should cra-comps be by convention?)

### Setup Info
* this monorepo uses lerna w/ yarn workspaces
* this repo currently uses an alpha release of react-scripts

#### Install this example monorepo
1. git clone https://github.com/bradfordlemley/cra-monorepo-examples
1. cd cra-monorepo-examples
1. yarn
1. cd apps/cra-app3 (or any of the apps) and do anything you'd normally do, e.g. yarn start/build/test.

#### How to fork create-react-app/react-scripts

Forking react-scripts in a maintainable way is a challenging endeavor because it is part of a monorepo
and it has dependencies on other packages in the monorepo.  See [monorepo structure](https://github.com/facebook/create-react-app/blob/master/CONTRIBUTING.md#folder-structure-of-create-react-app) in [CRA contributing guide](https://github.com/facebook/create-react-app/blob/master/CONTRIBUTING.md).

The first steps are easy:
1. Fork create-react-app
2. Make changes, usually in packages/react-scripts

Now, how do you use it or test it?....
* Option 1: Point to your forked react-scripts repo
   * Unfortunately, you can't just point your app's react-scripts dependency to your forked repo because it is not the react-scripts repo, it is the create-react-app repo.
   * React-scripts is inside somewhere, but there's no way to tell npm/yarn where it is.
* Option 2: Link to local clone
   * You can npm/yarn link to a local clone of your create-react-app/react-scripts:
      1. git clone fork ${cra_fork}  <-- local clone of create-react-app fork
      1. cd ${cra_repo}/packages/react-scripts && yarn link  <-- register forked react-scripts
      1. cd ${app} &&  yarn link react-scripts  <-- use forked react-scripts
   * But there is a subtle limitation:
      * Your fork must be based on the same version of react-scripts that the app lists in its dependencies.
      * This is because you need to have all of the same react-scripts dependencies' versions installed.
      * Mainly, you run into an issue when your linked react-scripts uses a different jest version than the app's original react-scripts.
* Option 3: Publish your own version of react-scripts
   * You can publish your own version of react-scripts, preferably scoping it like @myorg/react-scripts.
   * This works well as long as you don't need to change any of the other packages in the create-react-app monorepo -- you just use the packages that are released by the upstream.
* Option 4: Publish your own version of all create-react-app packages
   * If you want to have a truly independent fork without the caveats of above solutions
   * Publish your own versions of all the packages in create-react-app, preferably scoping all of them like @myorg/pkg.
   * For reference, see this [commit with scoping change]( https://github.com/bradfordlemley/create-react-app/commit/be84d03e8184d9e2265c677a6ea1ea495ae417cc).
   * For better or for worse, now you're your own maintainer with full control: :smile: or :anguished: ?
   * See [setting up local copy in CRA contributing](https://github.com/facebookincubator/create-react-app/blob/master/CONTRIBUTING.md#setting-up-a-local-copy) for more info on using local cra.
   * Unfortunately, there doesn't seem to be an easy way to point your existing app to use the local fork.  For may cases, you can link react-scripts (see option 2 above), but with the same caveats.  Or, publish it first.

### Tests
#### Tests to verify monorepo support ([Issue 1333](https://github.com/facebookincubator/create-react-app/issues/1333))
1. Test cra-app3 in this monorepo
   1. Install this monorepo as described above
   1. Open terminal at apps/cra-app3
   1. Verify npm start/build/test run correctly

#### Tests to verify "create-react-app" works ([Issue 3031](https://github.com/facebookincubator/create-react-app/issues/3031))
1. "create-react-app" works in workspace
   1. Open terminal at workspace root.
   1. /path/to/forked/packages/create-react-app cra-newapp <-- create app
   1. Update src/App.js and public/index.html to have "New App" in titles
   1. cd cra-newapp
   1. yarn start <-- verify app runs in browser with "New App" titles
   1. yarn build <-- verify build succeeds
   1. yarn test <-- verify test succeeds
1. "create-react-app" works outside of workspace
   1. Open terminal somewhere outside workspace root.
   1. /path/to/forked/packages/create-react-app newapp <-- create app
   1. Verification similar to above
1. "npm run create-react-app" works when running from create-react-app dev repo
   1. Open terminal at root of forked create-react-app repo
   1. npm run create-react-app newapp  <-- create app
   1. Verification similar to above
1. "npm run start/build/test" work when running from create-react-app dev repo
   1. Open terminal at root of forked create-react-app repo
   1. npm run start/build/test
   1. Verification similar to above, ensure template files are used
