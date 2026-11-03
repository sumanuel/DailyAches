import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useUser } from "../context/UserContext";
import { useBurst } from "./BurstProvider";
import {
  FIRST_AMBIENT_DELAY_MS,
  getAmbientBurst,
  nextAmbientDelay,
} from "../utils/dayMood";

// Now and then, while the app is open and in view, the screen reacts to how the
// day has gone (utils/dayMood.js): confetti with no pains, leaves and calm faces
// with a few, sad faces with more, rain clouds with many. It waits until the
// people and records have loaded, so an empty list is never mistaken for a
// painless day. It draws nothing itself.
const MoodAmbience = () => {
  const { isAuthenticated, user, getTodayRecords, remoteStatus } = useUser();
  const fire = useBurst();
  const latest = useRef({});
  const fireRef = useRef(fire);

  useEffect(() => {
    latest.current = {
      ready:
        isAuthenticated &&
        remoteStatus.records.loaded &&
        remoteStatus.people.loaded,
      todayCount: getTodayRecords().length,
      peopleCount: (user.people || []).length,
    };
    fireRef.current = fire;
  });

  useEffect(() => {
    let timer;
    let first = true;

    const tick = () => {
      const { ready, todayCount, peopleCount } = latest.current;
      if (ready && AppState.currentState === "active") {
        const burst = getAmbientBurst(todayCount, peopleCount);
        fireRef.current(burst.preset, undefined, burst.options);
      }
      schedule();
    };
    const schedule = () => {
      timer = setTimeout(tick, first ? FIRST_AMBIENT_DELAY_MS : nextAmbientDelay());
      first = false;
    };

    schedule();
    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default MoodAmbience;
