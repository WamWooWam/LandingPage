import * as bezier from "bezier-easing";

export const EASE_LINEAR = bezier(0, 0, 1, 1);
export const EASE_CUBIC = bezier(0.25, 0.1, 0.25, 1);
export const EASE_CIRCULAR = bezier(0.1, 0.57, 0.1, 1);
export const EASE_APPLAUNCHROTATE = bezier(0.18, 0.7, 0.6, 1.0);
export const EASE_APPLAUNCHROTATEBOUNCE = bezier(0.41, 0.52, 0.6, 1.4);
export const EASE_APPLAUNCHDRIFT = bezier(0.41, 0.52, 0.0, 0.94);
export const EASE_APPLAUNCHSCALE = bezier(0.42, 0.47, 0.3, 0.95);
export const EASE_APPLAUNCHFASTIN = bezier(0.17, 0.55, 0.3, 0.95);

export let AnimationSlowed = false;

// document.addEventListener('keydown', (e) => {
//     if (e.key === 'Shift') {
//         AnimationSlowed = true;
//     }
// });

// document.addEventListener('keyup', (e) => {
//     if (e.key === 'Shift') {
//         AnimationSlowed = false;
//     }
// });