declare namespace DarkMist {
    /**
     * Base64
     */
    class Base64 {
        /**
         * Base64 List
         */
        private static _BASE64_STRING;
        /**
         * Format decode error string
         *
         * @param	data	Decode string
         * @param	index	Decoding error position
         */
        private static _decodeFormat;
        /**
         * Format encoding error string
         *
         * @param	data	Encode string
         * @param	index	Encoding error position
         */
        private static _encodeFormat;
        /**
         * Base64 decode [UTF8]
         *
         * @param	data	Base64 string
         */
        static Base64Decode(data: string): string;
        /**
         * Base64 encode [UTF8]
         *
         * @param	data	Source string
         */
        static Base64Encode(data: string): string;
    }
}
