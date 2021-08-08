# metaTTT

MetaTTT with online multiplayer & more!

## Description

Aiming to rewrite metaTTT using React & Typescript. Switching out Cordova for Capacitor. Should be a monorepo where both the server and app can be built. I hope.

Today, I learned workspaces are something npm/yarn has. Would have made quite a lot of things much easier, such as testing my component library, or the old metaTTT project arrangement.

I wanted to enforce Prettier rules but given there isn't a way to setup commit hooks during `yarn install`, I am instead hoping the editor will pick up on the `.prettierrc` located in the root folder.
