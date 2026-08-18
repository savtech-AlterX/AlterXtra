import 'expo-router/entry';
// Registers the headless task Android runs to render/update the home screen
// widget — must happen at JS startup, independent of whether the app's UI
// ever mounts, since the widget can be added/tapped while the app is closed.
import './widget-task-handler';
