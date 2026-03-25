import { isGlassEffectAPIAvailable } from 'expo-glass-effect';

/**
 * Whether the Liquid Glass API is available on this device/OS.
 * Evaluated once at module load — safe to use in render without performance cost.
 */
export const glassAvailable = isGlassEffectAPIAvailable();
