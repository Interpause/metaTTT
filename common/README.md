# metaTTT-Common

Code shared between server and app will be stored here. Examples include the game state, utility files, and most important Typescript definitions for the communication protocol.

Can and should this be an actual package? PeerDependencies can be used if needed... And in the yarn workspace method, I can directly install/symlink this package to the server/app.

How would tsconfig look like if that was the case though?

use RFC.DNS, metattt.interpause.dev to generate namespace UUIDv5
generate client UUID using namespace UUID and capacitor deviceId (persisted on browsers, great)
use uuidV4 and client UUID as namespace to generate client secret (big brain uselessness)
