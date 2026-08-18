package expo.modules.sessionwidgetbridge

import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Keep these in sync with the widget task handler in widget-task-handler.ts —
// both sides must agree on the SharedPreferences file/key to actually share
// state instead of silently reading/writing two separate stores.
private const val PREFS_NAME = "session_widget_bridge"
private const val STARTED_AT_KEY = "startedAt"

class SessionWidgetBridgeModule : Module() {
  private val prefs
    get() = appContext.reactContext!!.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  override fun definition() = ModuleDefinition {
    Name("SessionWidgetBridge")

    AsyncFunction("getActiveStartedAt") {
      prefs.getString(STARTED_AT_KEY, null)
    }

    AsyncFunction("setActiveStartedAt") { startedAt: String? ->
      prefs.edit().apply {
        if (startedAt != null) putString(STARTED_AT_KEY, startedAt) else remove(STARTED_AT_KEY)
      }.apply()
    }

    AsyncFunction("reloadWidgets") {
      // No-op: the Android home screen widget is re-rendered directly via
      // react-native-android-widget's requestWidgetUpdate() from JS (see
      // src/lib/sessionWidgetBridge.ts) — this module only owns the shared
      // SharedPreferences state the widget's task handler reads.
    }
  }
}
