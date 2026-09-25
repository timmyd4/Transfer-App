// Remembers which physical device this browser is running on ("Phone" or "PC")
// so every message can be labelled with where it came from.

const STORAGE_KEY = 'transfer-app-device-name'

export const DEVICE_OPTIONS = ['Phone', 'PC']

export function getDeviceName() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    // localStorage can throw in private browsing modes - fail gracefully.
    return null
  }
}

export function setDeviceName(name) {
  try {
    localStorage.setItem(STORAGE_KEY, name)
  } catch {
    // Ignore - worst case the user is asked again next visit.
  }
}
