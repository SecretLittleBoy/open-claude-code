let nativeRecordingActive = false

export function isNativeAudioAvailable() {
  return false
}

export function startNativeRecording(onData, onEnd) {
  void onData
  void onEnd
  nativeRecordingActive = false
  return false
}

export function stopNativeRecording() {
  nativeRecordingActive = false
}

export function isNativeRecordingActive() {
  return nativeRecordingActive
}

export default {
  isNativeAudioAvailable,
  startNativeRecording,
  stopNativeRecording,
  isNativeRecordingActive,
}
