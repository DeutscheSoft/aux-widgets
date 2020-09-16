/*
 * This file is part of AUX.
 *
 * AUX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * AUX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * @module utils/notes
 */

/**
 * Returns a note name for a MIDI note number.
 *
 * @param {int} note - The MIDI note to translate.
 *
 * @returns {string} note - The name of the note.
 */
export function MIDIToNote(num) {
  return notes[num % 12] + parseInt(num / 12);
}
/**
 * Returns a frequency of a MIDI note number.
 *
 * @param {int} note - The MIDI note to translate.
 *
 * @returns {number} frequency - The frequency of the MIDI number.
 */
export function MIDIToFreq(num, base) {
  base |= 440;
  return Math.pow(2, (num - 69) / 12) * base;
}
/**
 * Returns a MIDI note number for a frequency.
 *
 * @param {number} frequency - The frequency to translate.
 * @param {number} [base] - The frequency of A440.
 *
 * @returns {int} number - The MIDI number of the frequency.
 */
export function FreqToMIDI(freq, base) {
  base |= 440;
  var f2 = Math.log2(freq / base);
  return Math.max(0, Math.round(12 * f2 + 69));
}
/**
 * Returns the percents a frequency misses a real note by.
 *
 * @param {number} frequency - The frequency to translate.
 * @param {number} [base] - The frequency of A440.
 *
 * @returns {number} cents - The percent of the difference to the next full note.
 */
export function FreqToCents(freq, base) {
  base |= 440;
  var f2 = Math.log2(freq / base);
  f2 *= 1200;
  f2 %= 100;
  return f2 < -50 ? 100 + f2 : f2 > 50 ? -(100 - f2) : f2;
}
/**
 * Returns a note name for a frequency.
 *
 * @param {number} frequency - The frequency to translate.
 * @param {number} [base] - The frequency of A440.
 *
 * @returns {string} note - The name of the note.
 */
export function FreqToNote(freq, base) {
  base |= 440;
  return MIDIToNote(FreqToMIDI(freq, base));
}
