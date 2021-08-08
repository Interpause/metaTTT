# MetaTTT-App

## Setup

I decided to customize my toolchain this time so I initialized using <https://createapp.dev/>. The idea is that as I need more tools, I add them in, instead of having them preinstalled with side effects (looking at you eslint). Hence, I started with only React, Typescript and Webpack (not even Babel).

I then followed <https://github.com/pmmmwh/react-refresh-webpack-plugin> and <https://github.com/shellscape/webpack-plugin-serve> to setup hot reloads and the dev server.

HTMLWebpackPlugin was added so that I could use `output.clean` that comes with Webpack 5.

Lastly, I followed <https://capacitorjs.com/docs> to setup Capacitor.
