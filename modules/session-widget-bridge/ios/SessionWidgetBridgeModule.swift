import ExpoModulesCore
import WidgetKit

// Keep these in sync with targets/widget/IdentitySessionWidget.swift — both
// sides must agree on the App Group and key for UserDefaults(suiteName:) to
// actually share data instead of silently reading/writing two separate stores.
private let appGroupId = "group.com.alterxtra.app"
private let startedAtKey = "identitySession.startedAt"
private let streakDaysKey = "identitySession.activeStreakDays"

public class SessionWidgetBridgeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SessionWidgetBridge")

    AsyncFunction("getActiveStartedAt") { () -> String? in
      UserDefaults(suiteName: appGroupId)?.string(forKey: startedAtKey)
    }

    AsyncFunction("setActiveStartedAt") { (startedAt: String?) in
      let defaults = UserDefaults(suiteName: appGroupId)
      if let startedAt {
        defaults?.set(startedAt, forKey: startedAtKey)
      } else {
        defaults?.removeObject(forKey: startedAtKey)
      }
    }

    AsyncFunction("getActiveStreakDays") { () -> Int in
      UserDefaults(suiteName: appGroupId)?.integer(forKey: streakDaysKey) ?? 0
    }

    AsyncFunction("setActiveStreakDays") { (days: Int) in
      UserDefaults(suiteName: appGroupId)?.set(days, forKey: streakDaysKey)
    }

    AsyncFunction("reloadWidgets") {
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}
