import ActivityKit
import Foundation

// Shared by the app (OrbitLiveActivity module) and the widget extension.
// Both copies MUST stay identical: ActivityKit matches them by name and shape.
struct OrbitPayAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var status: String // "paying" | "paid"
    var amount: String // digits only, e.g. "240"
  }

  var merchant: String
}
