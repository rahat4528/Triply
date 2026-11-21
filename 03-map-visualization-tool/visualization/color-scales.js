"use strict";
/**
 * Colorblind-Safe Geospatial Color Scales
 * Maps values [0, 1] to [R, G, B, A] arrays.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PALETTES = void 0;
exports.interpolateColor = interpolateColor;
exports.PALETTES = {
    viridis: [
        [68, 1, 84],
        [72, 40, 120],
        [62, 74, 137],
        [49, 104, 142],
        [38, 130, 142],
        [31, 158, 137],
        [53, 183, 121],
        [109, 205, 89],
        [180, 222, 44],
        [253, 231, 37],
    ],
    magma: [
        [0, 0, 4],
        [28, 16, 68],
        [79, 18, 123],
        [129, 37, 129],
        [181, 54, 122],
        [229, 80, 100],
        [251, 135, 97],
        [254, 194, 135],
        [252, 253, 191],
    ],
    plasma: [
        [13, 8, 135],
        [75, 3, 161],
        [126, 3, 168],
        [168, 34, 150],
        [203, 70, 121],
        [229, 107, 93],
        [248, 148, 65],
        [253, 195, 40],
        [240, 249, 33],
    ],
    blues: [
        [247, 251, 255],
        [222, 235, 247],
        [198, 219, 239],
        [158, 202, 225],
        [107, 174, 214],
        [66, 146, 198],
        [33, 113, 181],
        [8, 81, 156],
        [8, 48, 107],
    ],
    sunset: [
        [254, 237, 222],
        [253, 190, 133],
        [253, 141, 60],
        [230, 85, 13],
        [166, 54, 3],
    ],
};
function interpolateColor(normalizedValue, paletteName = 'viridis', opacity = 1.0) {
    const clamped = Math.max(0, Math.min(1, normalizedValue));
    const palette = exports.PALETTES[paletteName] || exports.PALETTES.viridis;
    const scaled = clamped * (palette.length - 1);
    const index = Math.floor(scaled);
    const fraction = scaled - index;
    if (index >= palette.length - 1) {
        const last = palette[palette.length - 1];
        return [last[0], last[1], last[2], Math.round(opacity * 255)];
    }
    const c1 = palette[index];
    const c2 = palette[index + 1];
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * fraction);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * fraction);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * fraction);
    return [r, g, b, Math.round(opacity * 255)];
}
