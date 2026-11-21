"use strict";
/**
 * Statistical Classification Methods for Choropleth & Thematic Mapping
 * - Equal Interval
 * - Quantile
 * - Natural Breaks (Jenks Optimization)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyEqualInterval = classifyEqualInterval;
exports.classifyQuantile = classifyQuantile;
exports.classifyNaturalBreaks = classifyNaturalBreaks;
/**
 * Computes Equal Interval classification breaks
 */
function classifyEqualInterval(values, numClasses) {
    if (values.length === 0 || numClasses <= 0)
        return [];
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    if (min === max)
        return [min, max];
    const interval = (max - min) / numClasses;
    const breaks = [min];
    for (let i = 1; i < numClasses; i++) {
        breaks.push(Math.round((min + i * interval) * 100) / 100);
    }
    breaks.push(max);
    return breaks;
}
/**
 * Computes Quantile classification breaks
 */
function classifyQuantile(values, numClasses) {
    if (values.length === 0 || numClasses <= 0)
        return [];
    const sorted = [...values].sort((a, b) => a - b);
    const breaks = [sorted[0]];
    for (let i = 1; i < numClasses; i++) {
        const idx = Math.floor((i * (sorted.length - 1)) / numClasses);
        breaks.push(sorted[idx]);
    }
    breaks.push(sorted[sorted.length - 1]);
    return Array.from(new Set(breaks)).sort((a, b) => a - b);
}
/**
 * Computes Natural Breaks (Jenks) classification
 */
function classifyNaturalBreaks(values, numClasses) {
    if (values.length === 0)
        return [];
    const sorted = [...values].sort((a, b) => a - b);
    const k = Math.min(numClasses, sorted.length);
    if (k <= 1 || sorted[0] === sorted[sorted.length - 1]) {
        return [sorted[0], sorted[sorted.length - 1]];
    }
    // Jenks Fisher-Jenks dynamic programming matrix implementation
    const mat1 = Array(sorted.length + 1)
        .fill(0)
        .map(() => Array(k + 1).fill(0));
    const mat2 = Array(sorted.length + 1)
        .fill(0)
        .map(() => Array(k + 1).fill(0));
    for (let y = 1; y <= k; y++) {
        mat1[1][y] = 1;
        mat2[1][y] = 0;
        for (let t = 2; t <= sorted.length; t++) {
            mat2[t][y] = Infinity;
        }
    }
    let v = 0.0;
    for (let l = 2; l <= sorted.length; l++) {
        let s1 = 0.0;
        let s2 = 0.0;
        let w = 0.0;
        for (let m = 1; m <= l; m++) {
            const i3 = l - m + 1;
            const val = sorted[i3 - 1];
            s2 += val * val;
            s1 += val;
            w += 1;
            v = s2 - (s1 * s1) / w;
            const i4 = i3 - 1;
            if (i4 !== 0) {
                for (let p = 2; p <= k; p++) {
                    if (mat2[l][p] >= v + mat2[i4][p - 1]) {
                        mat1[l][p] = i3;
                        mat2[l][p] = v + mat2[i4][p - 1];
                    }
                }
            }
        }
        mat1[l][1] = 1;
        mat2[l][1] = v;
    }
    let kclass = sorted.length;
    const kclassbreaks = Array(k + 1).fill(0);
    kclassbreaks[k] = sorted[sorted.length - 1];
    kclassbreaks[0] = sorted[0];
    let count = k;
    while (count >= 2) {
        const id = Math.floor(mat1[kclass][count]) - 2;
        kclassbreaks[count - 1] = sorted[id];
        kclass = Math.floor(mat1[kclass][count] - 1);
        count -= 1;
    }
    return kclassbreaks;
}
