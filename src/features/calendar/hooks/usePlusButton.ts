import { useCallback, useState } from 'react';
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const BAR_OUT_DURATION = 220;
const MENU_IN_DURATION = 280;
const MENU_OUT_DURATION = 180;
const BAR_IN_DURATION = 260;
const ITEM_STAGGER_DELAY = 70;

export function usePlusButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Separate shared values for bar and menu so each has its own timing/easing
  const barProgress = useSharedValue(0);   // 0 = visible, 1 = hidden (slid away)
  const menuProgress = useSharedValue(0);  // 0 = hidden, 1 = visible
  const item1Progress = useSharedValue(0);
  const item2Progress = useSharedValue(0);

  const openMenu = useCallback(() => {
    setIsOpen(true);
    // Bar drops away with acceleration (ease-in feels like falling)
    barProgress.set(withTiming(1, { duration: BAR_OUT_DURATION, easing: Easing.in(Easing.cubic) }));
    // Menu rises into place with deceleration (ease-out feels like landing)
    menuProgress.set(withTiming(1, { duration: MENU_IN_DURATION, easing: Easing.out(Easing.cubic) }));
    item1Progress.set(withTiming(1, { duration: MENU_IN_DURATION, easing: Easing.out(Easing.cubic) }));
    item2Progress.set(withDelay(ITEM_STAGGER_DELAY, withTiming(1, { duration: MENU_IN_DURATION, easing: Easing.out(Easing.cubic) })));
  }, [barProgress, menuProgress, item1Progress, item2Progress]);

  const closeMenu = useCallback(() => {
    // Menu drops away first
    menuProgress.set(withTiming(0, { duration: MENU_OUT_DURATION, easing: Easing.in(Easing.quad) }));
    item1Progress.set(withTiming(0, { duration: MENU_OUT_DURATION }));
    item2Progress.set(withTiming(0, { duration: MENU_OUT_DURATION }));
    // Bar slides back up (slightly delayed so it doesn't overlap)
    barProgress.set(withDelay(60, withTiming(0, { duration: BAR_IN_DURATION, easing: Easing.out(Easing.back(1.5)) })));
    setTimeout(() => setIsOpen(false), MENU_OUT_DURATION + 60 + BAR_IN_DURATION + 30);
  }, [barProgress, menuProgress, item1Progress, item2Progress]);

  // Bar: slide down off-screen + delayed fade.
  // Opacity is delayed to start at 30% so the glass material animation
  // gets a head start before the parent opacity begins affecting it.
  const bottomBarAnimatedStyle = useAnimatedStyle(() => {
    const p = barProgress.get();
    return {
      transform: [{ translateY: p * 120 }],
      opacity: interpolate(p, [0, 0.3, 1], [1, 1, 0]),
    };
  });

  // Menu: rises up 40px from below and fades in
  const menuContainerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - menuProgress.get()) * 40 }],
    opacity: menuProgress.get(),
  }));

  const item1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - item1Progress.get()) * 12 }],
    opacity: item1Progress.get(),
  }));

  const item2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - item2Progress.get()) * 12 }],
    opacity: item2Progress.get(),
  }));

  return {
    isOpen,
    openMenu,
    closeMenu,
    bottomBarAnimatedStyle,
    menuContainerAnimatedStyle,
    item1AnimatedStyle,
    item2AnimatedStyle,
  };
}
