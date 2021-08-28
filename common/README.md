# metaTTT-Common

Code shared between server and app will be stored here. Examples include the game state, utility files, and most important Typescript definitions for the communication protocol.

use RFC.DNS, metattt.interpause.dev to generate namespace UUIDv5
generate client UUID using namespace UUID and capacitor deviceId (persisted on browsers, great)
use uuidV4 and client UUID as namespace to generate client secret (big brain uselessness)

Unfortunately, due to a branch merging accident from my inability to read warnings, both the previous class-based state and object-based state now coexist. For now.
