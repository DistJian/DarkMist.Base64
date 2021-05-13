/* ======================================== *
 * Copyright (c) 2016, DarkMist Corporation *
 * All rights reserved.                     *
 * @author: Dist. @modification: 2016/06/30 *
 * ======================================== */
namespace DarkMist {

	/**
	 * Base64
	 */
	export class Base64 {

		// #region Constant

		/**
		 * Base64 List
		 */
		private static _BASE64_STRING: string[] = [

			'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
			'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
			'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
			'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
			'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
			'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
			'w', 'x', 'y', 'z', '0', '1', '2', '3',
			'4', '5', '6', '7', '8', '9', '+', '/'
		];

		// #endregion

		// #region Private static method

		/**
		 * Format decode error string
		 * 
		 * @param	data	Decode string
		 * @param	index	Decoding error position
		 */
		private static _decodeFormat(data: string, index: number): string {

			// Calculation error position
			let start: number = (((index - 2) / 3) | 0) * 4;

			// Return formatted error string
			return "The string to be decoded is not correctly encoded of the UTF-8 encoding: charactors '" +
				data.substr(start, 4) + "' at position range [" + start.toString() + ", " + (start + 4).toString() + "].";
		}

		/**
		 * Format encoding error string
		 * 
		 * @param	data	Encode string
		 * @param	index	Encoding error position
		 */
		private static _encodeFormat(data: string, index: number): string {

			// Return formatted error string
			return "The string to be encoded contains characters outside of the UTF-8 range: character '" +
				data.charAt(index) + "' [0x" + data.charCodeAt(index).toString(16) + "] at position " + index.toString() + ".";
		}

		// #endregion

		// #region Public static method

		/**
		 * Base64 decode [UTF8]
		 * 
		 * @param	data	Base64 string
		 */
		public static Base64Decode(data: string): string {

			// atob for Base64
			let buffer: string = atob(data);

			// Temporary variables
			let c: number = 0, r: string = '';
			let b1: number = 0, b2: number = 0, b3: number = 0;

			// Iterates over the string to be decoded
			for (let i: number = 0, len: number = buffer.length; i < len; i++) {

				// Get ascii code
				c = buffer.charCodeAt(i);

				// [0x0000-0x007f]
				if (c <= 0x7f) {

					r += String.fromCharCode(c);
				}

				// [0x0080-0x07ff]
				else if (c <= 0xbf) {

					// Throw an exception
					throw new Error(Base64._decodeFormat(data, i));
				}

				// [0x0080-0x07ff]
				else if (c <= 0xdf) {

					// Check data length
					if (i + 1 >= len) {

						// Throw an exception
						throw new Error(Base64._decodeFormat(data, i));
					}

					// Get 2nd ascii code
					b1 = buffer.charCodeAt(++i) & 0x3f;

					// Encode character data
					r += String.fromCharCode(((c & 0x1f) << 6) | b1);
				}

				// [0x0800-0xd7ff]
				else if (c <= 0xef) {

					// Check data length
					if (i + 2 >= len) {

						// Throw an exception
						throw new Error(Base64._decodeFormat(data, i));
					}

					// Get 2nd ascii code
					b1 = buffer.charCodeAt(++i) & 0x3f;
					// Get 3rd ascii code
					b2 = buffer.charCodeAt(++i) & 0x3f;

					// Encode character data
					r += String.fromCharCode(((c & 0x0f) << 12) | (b1 << 6) | b2);
				}

				// [0xd800-0xdfff]
				else if (c <= 0xff) {

					// Check data length
					if (i + 3 >= len) {

						// Throw an exception
						throw new Error(Base64._decodeFormat(data, i));
					}

					// Get 2nd ascii code
					b1 = buffer.charCodeAt(++i) & 0x3f;
					// Get 3rd ascii code
					b2 = buffer.charCodeAt(++i) & 0x3f;
					// Get 4th ascii code
					b3 = buffer.charCodeAt(++i) & 0x3f;
					
					// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint#polyfill
					c = (((c & 0x0f) << 18) | (b1 << 12) | (b2 << 6) | b3) - 0x10000;

					// Encode character data
					r += String.fromCharCode.apply(null, [(c >> 10) | 0xd800, (c & 0x3ff) | 0xdc00]);
				}

				// Unsupported character set
				else {

					// Throw an exception
					throw new Error(Base64._decodeFormat(data, i));
				}
			}

			// Return to utf8 character decoding
			c = 0; b1 = 0; b2 = 0; b3 = 0; buffer = null; return r;
		}

		/**
		 * Base64 encode [UTF8]
		 * 
		 * @param	data	Source string
		 */
		public static Base64Encode(data: string): string {

			// Temporary variables
			let c: number = 0, r: string = '';
			let b: number = 0, t: number = 0, u: number = 0;

			// Iterates over the string to be encoded
			for (let i: number = 0, len: number = data.length; i < len; i++) {

				// Get ascii code
				c = data.charCodeAt(i);

				// [0x0000-0x007f]
				if (c <= 0x007f) {

					if (b == 0) {

						// c[Bit08-Bit03]
						r += Base64._BASE64_STRING[c >> 2];

						// u = c[Bit02-Bit01]
						u = c & 0x03; b = 2;
					}
					else if (b == 2) {

						// u[Bit02-Bit01] + c[Bit08-Bit05]
						r += Base64._BASE64_STRING[(u << 4) | (c >> 4)];

						// u = c[Bit04-Bit01]
						u = c & 0x0f; b = 4;
					}
					else if (b == 4) {

						// u[Bit04-Bit01] + c[Bit08-Bit06]
						r += Base64._BASE64_STRING[(u << 2) | (c >> 6)];
						// c[Bit05-Bit01]
						r += Base64._BASE64_STRING[c & 0x3f];

						// u = 0
						u = 0; b = 0;
					}
					else {

						// Throw an exception
						throw new Error(Base64._encodeFormat(data, i));
					}
				}

				// [0x0080-0x07ff]
				else if (c <= 0x07ff) {

					if (b == 0) {

						// Bit_11 + c[Bit12-Bit09]
						r += Base64._BASE64_STRING[0x30 | (c >> 8)];
						// c[Bit08-Bit07] + Bit_10 + c[Bit06-Bit05]
						r += Base64._BASE64_STRING[((c >> 2) & 0x30) | 0x08 | ((c >> 4) & 0x03)];

						// u = c[Bit04-Bit01]
						u = c & 0x0f; b = 4;
					}
					else if (b == 2) {

						// u[Bit02-Bit01] + Bit_11 + c[Bit12-Bit11]
						r += Base64._BASE64_STRING[(u << 4) | 0x0c | (c >> 10)];
						// u[Bit10-Bit07] + Bit_10
						r += Base64._BASE64_STRING[((c >> 4) & 0x3c) | 0x02];
						// u[Bit06-Bit01]
						r += Base64._BASE64_STRING[c & 0x3f];

						// u = 0
						u = 0; b = 0;
					}
					else if (b == 4) {

						// u[Bit04-Bit01] + Bit_11
						r += Base64._BASE64_STRING[(u << 2) | 0x03];
						// c[Bit12-Bit07]
						r += Base64._BASE64_STRING[c >> 6];
						// Bit_10 + c[Bit06-Bit03]
						r += Base64._BASE64_STRING[0x20 | ((c >> 2) & 0x0f)];

						// u = c[Bit02-Bit01]
						u = c & 0x03; b = 2;
					}
					else {

						// Throw an exception
						throw new Error(Base64._encodeFormat(data, i));
					}
				}

				// [0x0800-0xd7ff]
				else if (c <= 0xd7ff) {

					if (b == 0) {

						// Bit_1110 + c[Bit16-Bit15]
						r += Base64._BASE64_STRING[0x38 | (c >> 14)];
						// c[Bit14-Bit13] + Bit_10 + c[Bit12-Bit11]
						r += Base64._BASE64_STRING[((c >> 8) & 0x30) | 0x08 | ((c >> 10) & 0x03)];
						// c[Bit10-Bit07] + Bit_10
						r += Base64._BASE64_STRING[((c >> 4) & 0x3c) | 0x02];
						// c[Bit06-Bit01]
						r += Base64._BASE64_STRING[c & 0x3f];
					}
					else if (b == 2) {

						// u[Bit02-Bit01] + Bit_1110
						r += Base64._BASE64_STRING[(u << 4) | 0x0e];
						// c[Bit16-Bit13] + Bit_10
						r += Base64._BASE64_STRING[((c >> 10) & 0x3c) | 0x02];
						// c[Bit12-Bit07]
						r += Base64._BASE64_STRING[((c >> 6) & 0x3f)];
						// Bit_10 + c[Bit06-Bit03]
						r += Base64._BASE64_STRING[0x20 | ((c >> 2) & 0x0f)];

						// u = c[Bit02-Bit01]
						u = c & 0x03;
					}
					else if (b == 4) {

						// u[Bit04-Bit01] + Bit_11
						r += Base64._BASE64_STRING[(u << 2) | 0x03];
						// Bit_10 + c[Bit16-Bit13]
						r += Base64._BASE64_STRING[0x20 | (c >> 12)];
						// Bit_10 + c[Bit12-Bit09]
						r += Base64._BASE64_STRING[0x20 | ((c >> 8) & 0x0f)];
						// c[Bit08-Bit07] + Bit_10 + c[Bit06-Bit05]
						r += Base64._BASE64_STRING[((c >> 2) & 0x30) | 0x08 | ((c >> 4) & 0x03)];

						// u = c[Bit04-Bit01]
						u = c & 0x0f;
					}
					else {

						// Throw an exception
						throw new Error(Base64._encodeFormat(data, i));
					}
				}

				// [0xd800-0xdfff]
				else if (c <= 0xdbff) {

					// Low surrogate
					t = data.charCodeAt(++i);

					// Check available range
					if (t >= 0xdc00 && t <= 0xdfff) {

						// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt#fixing_charcodeat_to_handle_non-basic-multilingual-plane_characters_if_their_presence_earlier_in_the_string_is_unknown
						c = ((c & 0x3ff) << 10) | (t & 0x3ff) | 0x10000;
					}
					else {

						// Throw an exception
						throw new Error(Base64._encodeFormat(data, i));
					}

					if (b == 0) {

						// Bit_1111 + c[Bit22-Bit21]
						r += Base64._BASE64_STRING[0x3c | (c >> 20)];
						// c[Bit20-Bit19] + Bit_10 + c[Bit18-Bit17]
						r += Base64._BASE64_STRING[((c >> 14) & 0x30) | 0x08 | ((c >> 16) & 0x03)];
						// c[Bit16-Bit13] + Bit_10
						r += Base64._BASE64_STRING[((c >> 10) & 0x3c) | 0x02];
						// c[Bit12-Bit07]
						r += Base64._BASE64_STRING[(c >> 6) & 0x3f];
						// Bit_10 + c[Bit06-Bit03]
						r += Base64._BASE64_STRING[0x20 | ((c >> 2) & 0x0f)];

						// u = c[Bit02-Bit01]
						u = c & 0x03; b = 2;
					}
					else if (b == 2) {

						// u[Bit02-Bit01] + Bit_1111
						r += Base64._BASE64_STRING[(u << 4) | 0x0f];
						// c[Bit22-Bit19] + Bit_10
						r += Base64._BASE64_STRING[((c >> 16) & 0x3c) | 0x02];
						// c[Bit18-Bit13]
						r += Base64._BASE64_STRING[((c >> 12) & 0x3f)];
						// Bit_10 + c[Bit12-Bit09]
						r += Base64._BASE64_STRING[0x20 | ((c >> 8) & 0x0f)];
						// c[Bit08-Bit07] + Bit_10 + c[Bit06-Bit05]
						r += Base64._BASE64_STRING[((c >> 2) & 0x30) | 0x08 | ((c >> 4) & 0x03)];

						// u = c[Bit04-Bit01]
						u = c & 0x0f; b = 4;
					}
					else if (b == 4) {

						// u[Bit04-Bit01] + Bit_11
						r += Base64._BASE64_STRING[(u << 2) | 0x03];
						// Bit_11 + c[Bit22-Bit19]
						r += Base64._BASE64_STRING[0x30 | ((c >> 18) & 0x0f)];
						// Bit_10 + c[Bit18-Bit15]
						r += Base64._BASE64_STRING[0x20 | ((c >> 14) & 0x0f)];
						// c[Bit14-Bit13] + Bit_10 + c[Bit12-Bit11]
						r += Base64._BASE64_STRING[((c >> 8) & 0x30) | 0x08 | ((c >> 10) & 0x03)];
						// c[Bit10-Bit07] + Bit_10
						r += Base64._BASE64_STRING[((c >> 4) & 0x3c) | 0x02];
						// c[Bit06-Bit01]
						r += Base64._BASE64_STRING[c & 0x3f];

						// u = 0
						u = 0; b = 0;
					}
					else {

						// Throw an exception
						throw new Error(Base64._encodeFormat(data, i));
					}
				}

				// [0xd800-0xdfff]
				else if (c <= 0xdfff) {

					// Throw an exception
					throw new Error(Base64._encodeFormat(data, i));
				}

				// [0xe000-0xffff]
				else if (c <= 0xffff) {

					if (b == 0) {

						// Bit_1110 + c[Bit16-Bit15]
						r += Base64._BASE64_STRING[0x38 | (c >> 14)];
						// c[Bit14-Bit13] + Bit_10 + c[Bit12-Bit11]
						r += Base64._BASE64_STRING[((c >> 8) & 0x30) | 0x08 | ((c >> 10) & 0x03)];
						// c[Bit10-Bit07] + Bit_10
						r += Base64._BASE64_STRING[((c >> 4) & 0x3c) | 0x02];
						// c[Bit06-Bit01]
						r += Base64._BASE64_STRING[c & 0x3f];
					}
					else if (b == 2) {

						// u[Bit02-Bit01] + Bit_1110
						r += Base64._BASE64_STRING[(u << 4) | 0x0e];
						// c[Bit16-Bit13] + Bit_10
						r += Base64._BASE64_STRING[((c >> 10) & 0x3c) | 0x02];
						// c[Bit12-Bit07]
						r += Base64._BASE64_STRING[((c >> 6) & 0x3f)];
						// Bit_10 + c[Bit06-Bit03]
						r += Base64._BASE64_STRING[0x20 | ((c >> 2) & 0x0f)];

						// u = c[Bit02-Bit01]
						u = c & 0x03;
					}
					else if (b == 4) {

						// u[Bit04-Bit01] + Bit_11
						r += Base64._BASE64_STRING[(u << 2) | 0x03];
						// Bit_10 + c[Bit16-Bit13]
						r += Base64._BASE64_STRING[0x20 | (c >> 12)];
						// Bit_10 + c[Bit12-Bit09]
						r += Base64._BASE64_STRING[0x20 | ((c >> 8) & 0x0f)];
						// c[Bit08-Bit07] + Bit_10 + c[Bit06-Bit05]
						r += Base64._BASE64_STRING[((c >> 2) & 0x30) | 0x08 | ((c >> 4) & 0x03)];

						// u = c[Bit04-Bit01]
						u = c & 0x0f;
					}
					else {

						// Throw an exception
						throw new Error(Base64._encodeFormat(data, i));
					}
				}

				// Unsupported character set
				else {

					// Throw an exception
					throw new Error(Base64._encodeFormat(data, i));
				}
			}

			// Encode the remaining characters and fill with '='
			if (b > 0) { r += Base64._BASE64_STRING[u << (6 - b)]; } return r + '===='.slice((r.length % 4) || 4);
		}

		// #endregion
	}
}