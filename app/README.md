# MetaTTT-App

## Setup

I decided to customize my toolchain this time so I initialized using <https://createapp.dev/>. The idea is that as I need more tools, I add them in, instead of having them preinstalled with side effects (looking at you eslint). Hence, I started with only React, Typescript and Webpack (not even Babel).

I then followed <https://github.com/pmmmwh/react-refresh-webpack-plugin> and <https://github.com/shellscape/webpack-plugin-serve> to setup hot reloads and the dev server.

HTMLWebpackPlugin was added so that I could use `output.clean` that comes with Webpack 5. Nice that Webpack 5 also uses Terser for production builds by default.

I followed <https://capacitorjs.com/docs> to setup Capacitor.

Later, I discovered it was probably not a good idea to exclude Babel, and have added the transpiler into my toolchain. By relying on `ts-loader` piping into `babel-loader` (and the `transpileOnly` option when building for production), I have completely skipped using `@babel/preset-typescript` and `@babel/preset-react` as `tsc` handles both of that for me, yay. Now I only need to configure `@babel/preset-env` to target ES7 (which my research shows is widely supported enough).

Time to add in `twin.macro`, my favourite css-in-js solution: <https://github.com/ben-rogerson/twin.examples/tree/master/react-emotion>.

Turns out `ts-loader` was somehow escaping the `tw` prop. changing tsconfig to preserve jsx fixed it and allowed the `twin.macro` to finally work properly. Debugging this was a pain.
