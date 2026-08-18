import WidgetKit
import SwiftUI
import AppIntents

// Keep these in sync with modules/session-widget-bridge/ios/SessionWidgetBridgeModule.swift —
// both sides must agree on the App Group and key for UserDefaults(suiteName:)
// to actually share data instead of silently reading/writing two separate stores.
private let appGroupId = "group.com.alterxtra.app"
private let startedAtKey = "identitySession.startedAt"

private func isoFormatter() -> ISO8601DateFormatter {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return formatter
}

private func readStartedAt() -> Date? {
    guard let raw = UserDefaults(suiteName: appGroupId)?.string(forKey: startedAtKey) else { return nil }
    return isoFormatter().date(from: raw)
}

struct IdentitySessionEntry: TimelineEntry {
    let date: Date
    let startedAt: Date?
}

struct IdentitySessionProvider: TimelineProvider {
    func placeholder(in context: Context) -> IdentitySessionEntry {
        IdentitySessionEntry(date: .now, startedAt: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (IdentitySessionEntry) -> Void) {
        completion(IdentitySessionEntry(date: .now, startedAt: readStartedAt()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<IdentitySessionEntry>) -> Void) {
        let entry = IdentitySessionEntry(date: .now, startedAt: readStartedAt())
        // No scheduled reloads needed: the app and ToggleIdentitySessionIntent
        // both call WidgetCenter.shared.reloadAllTimelines() the moment a
        // session actually starts or stops, and the elapsed-time text below
        // updates live on its own via Text(_, style: .timer).
        completion(Timeline(entries: [entry], policy: .never))
    }
}

struct ToggleIdentitySessionIntent: AppIntent {
    static var title: LocalizedStringResource = "Toggle Identity Session"

    func perform() async throws -> some IntentResult {
        let defaults = UserDefaults(suiteName: appGroupId)
        if readStartedAt() != nil {
            defaults?.removeObject(forKey: startedAtKey)
        } else {
            defaults?.set(isoFormatter().string(from: .now), forKey: startedAtKey)
        }
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}

struct IdentitySessionWidgetEntryView: View {
    var entry: IdentitySessionEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .accessoryCircular:
            Button(intent: ToggleIdentitySessionIntent()) {
                ZStack {
                    AccessoryWidgetBackground()
                    if let startedAt = entry.startedAt {
                        VStack(spacing: 0) {
                            Image(systemName: "stop.fill")
                            Text(startedAt, style: .timer)
                                .font(.system(size: 10))
                                .minimumScaleFactor(0.6)
                        }
                    } else {
                        Image(systemName: "play.fill")
                            .font(.title2)
                    }
                }
            }
            .buttonStyle(.plain)

        case .accessoryRectangular:
            Button(intent: ToggleIdentitySessionIntent()) {
                HStack {
                    Image(systemName: entry.startedAt != nil ? "stop.circle.fill" : "play.circle.fill")
                    VStack(alignment: .leading) {
                        Text(entry.startedAt != nil ? "In identity" : "Start session")
                            .font(.headline)
                        if let startedAt = entry.startedAt {
                            Text(startedAt, style: .timer)
                                .font(.caption)
                        } else {
                            Text("Tap to begin")
                                .font(.caption)
                        }
                    }
                }
            }
            .buttonStyle(.plain)

        case .accessoryInline:
            Button(intent: ToggleIdentitySessionIntent()) {
                if let startedAt = entry.startedAt {
                    Text("In identity ") + Text(startedAt, style: .timer)
                } else {
                    Label("Start session", systemImage: "play.fill")
                }
            }

        default:
            Text("Unsupported")
        }
    }
}

struct IdentitySessionWidget: Widget {
    let kind = "IdentitySessionWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: IdentitySessionProvider()) { entry in
            IdentitySessionWidgetEntryView(entry: entry)
                .containerBackground(.black, for: .widget)
        }
        .configurationDisplayName("Identity Session")
        .description("Start or stop practicing your identity right from your Lock Screen.")
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline])
    }
}
