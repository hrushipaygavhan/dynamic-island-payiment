import ActivityKit
import ExpoModulesCore

/// Starts, updates and ends the Orbit Pay Live Activity from JavaScript.
/// Local-only updates: no push notifications, so it works with a free Apple ID.
public class OrbitLiveActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("OrbitLiveActivity")

    Function("areActivitiesEnabled") { () -> Bool in
      ActivityAuthorizationInfo().areActivitiesEnabled
    }

    AsyncFunction("start") { (merchant: String, amount: String) async throws -> Bool in
      await OrbitLiveActivityModule.endAll()
      guard ActivityAuthorizationInfo().areActivitiesEnabled else { return false }
      let state = OrbitPayAttributes.ContentState(status: "paying", amount: amount)
      _ = try Activity.request(
        attributes: OrbitPayAttributes(merchant: merchant),
        content: ActivityContent(state: state, staleDate: nil),
        pushType: nil
      )
      return true
    }

    AsyncFunction("markPaid") { () async -> Void in
      for activity in Activity<OrbitPayAttributes>.activities {
        let state = OrbitPayAttributes.ContentState(status: "paid", amount: activity.content.state.amount)
        await activity.update(ActivityContent(state: state, staleDate: nil))
      }
    }

    AsyncFunction("end") { () async -> Void in
      await OrbitLiveActivityModule.endAll()
    }
  }

  static func endAll() async {
    for activity in Activity<OrbitPayAttributes>.activities {
      await activity.end(nil, dismissalPolicy: .immediate)
    }
  }
}
