/**
 * System Plugins
 *
 * OS-level system plugins for file operations, hardware access, automation, etc.
 */

// Core system plugins
export { SystemFilePlugin } from './file';
export { SystemClipboardPlugin } from './clipboard';
export { SystemSchedulerPlugin } from './scheduler';
export { SystemShellPlugin } from './shell';

// Input/Output plugins
export { SystemMousePlugin } from './mouse';
export { SystemKeyboardPlugin } from './keyboard';
export { SystemWindowPlugin } from './window';
export { SystemAppPlugin } from './app';

// Media plugins
export { SystemAudioPlugin } from './audio';
export { SystemVoicePlugin } from './voice';
export { SystemScreenPlugin } from './screen';

// System control plugins
export { SystemNetworkPlugin } from './network';
export { SystemPowerPlugin } from './power';
export { SystemNotificationsPlugin } from './notifications';
export { SystemHardwarePlugin } from './hardware';
export { SystemSecurityPlugin } from './security';
export { SystemProcessPlugin } from './process';
export { SystemUpdatePlugin } from './update';

// Re-export base class
export { BaseSystemPlugin } from './base-system-plugin';

// Export all system plugins
export * from './file';
export * from './clipboard';
export * from './scheduler';
export * from './shell';
export * from './mouse';
export * from './keyboard';
export * from './window';
export * from './app';
export * from './audio';
export * from './network';
export * from './voice';
export * from './screen';
export * from './power';
export * from './notifications';
export * from './hardware';
export * from './security';
export * from './process';
export * from './update';
