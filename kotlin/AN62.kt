import java.io.UnsupportedEncodingException
import java.util.*

/**
 * AN62(AlphaNumeric62)이란.. Text에서 특수문자를 제거한 숫자(10)+영문대문자(26)+영문소문자(26) = 62가지 문자로 변환하기<br/>
 * String To String Encoding/Decoding<br/>
 * <br/>
 * 원리 : Text를 UTF8처리한다.<br/>
 *        UTF8은 아래와 같은 Byte범위를 갖는다.
 *        그럼, 0x000000 ~ 0x00007F --> 0xxx xxxx                               --> 0x00 ~ 0x7F<br/>
 *              0x000080 ~ 0x0007FF --> 110x xxxx 10xx xxxx                     --> 0xC0 ~ 0xDF, 0x80 ~ 0xBF<br/>
 *              0x000800 ~ 0x00FFFF --> 1110 xxxx 10xx xxxx 10xx xxxx           --> 0xE0 ~ 0xEF, 0x80 ~ 0xBF, 0x80 ~ 0xBF<br/>
 *              0x010000 ~ 0x10FFFF --> 1111 0zzz 10zz xxxx 10xx xxxx 10xx xxxx --> 0xF0 ~ 0xF4, 0x80 ~ 0xBF, 0x80 ~ 0xBF, 0x80 ~ 0xBF<br/>
 *              그래서, 0x00 ~ 0x7F, 0x80 ~ 0xBF, 0xC0 ~ 0xDF, 0xE0 ~ 0xEF, 0xF0 ~ 0xF4 = 0x00 ~ 0xF4 (즉, 245가지)<br/>
 *              245의 1승(245^1 =   245), 245의 2승(245^2 =  60,025), 245의 3승(245^3 = 14,706,125)<br/>
 *               62의 2승( 62^2 = 3,844),  62의 3승( 62^3 = 238,328),  62의 4승( 62^4 = 14,776,336)<br/>
 *              즉, 245^3 &lt; 62^4이다. [ BASE64(256^3 = 64^4)처럼 구현하면 된다. ]<br/>
 *        <br/>
 *        Binary To String Encoding은 <a href='https://github.com/zhangsob/Base62'>https://github.com/zhangsob/Base62</a> 를 참조.<br/>
 *
 * @author zhangsob@gmail.com
 *
 * @history 2021-04-07 encode(), decode() 만듦.<br/>
 */
class AN62 {
    companion object {
        @JvmStatic
        private val toBase62 = charArrayOf(
                '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
                'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z')

        @JvmStatic
        @Throws(UnsupportedEncodingException::class)
        fun encode(text: String): String {
            val utf8 = text.toByteArray(charset("utf-8"))
            val ret = StringBuilder()
            var value = 0
            val tmp = CharArray(4)
            for (i in utf8.indices) {
                val v : Int = utf8[i].toInt() and 0xFF
                if (v >= 0xF5) throw UnsupportedEncodingException("invalid UTF8 character")

                value = value * 0xF5 + v
                if (i % 3 == 2) {
                    for(j in 3 downTo 0) {
                        tmp[j] = toBase62[value % 62]
                        value /= 62
                    }
                    value = 0
                    ret.append(tmp, 0, 4)
                }
            }

            val len = utf8.size % 3
            if (len > 0) {
                for(j in len downTo 0) {
                    tmp[j] = toBase62[value % 62]
                    value /= 62
                }
                ret.append(tmp, 0, len + 1)
            }
            return ret.toString()
        }

        @JvmStatic
        @Throws(UnsupportedEncodingException::class)
        fun decode(text: String): String {
            var len = text.length
            require(len % 4 != 1) { "invalid AN62 length" }
            val dst = ByteArray(len / 4 * 3 + if (len % 4 > 0) len % 4 - 1 else 0)
            val tmp = ByteArray(3)

            val fromBase62 = IntArray(128)
            Arrays.fill(fromBase62, -1)
            for (i in toBase62.indices)
                fromBase62[toBase62[i].toInt()] = i

            var value = 0
            var bi = 0
            for (i in text.indices) {
                val ch = text[i]
                require(ch.toInt() < 0x80) { "invalid AN62 character $ch" }
                val v = fromBase62[ch.toInt()]
                require(v >= 0) { "invalid AN62 character $ch" }
                value = value * 62 + v
                if (i % 4 == 3) {
                    var j = 2
                    while (j >= 0) {
                        tmp[j] = (value % 0xF5).toByte()
                        --j
                        value /= 0xF5
                    }
                    value = 0
                    System.arraycopy(tmp, 0, dst, bi, 3)
                    bi += 3
                }
            }

            len %= 4
            if (len > 0) {
                len -= 1
                for(j in len-1 downTo 0) {
                    tmp[j] = (value % 0xF5).toByte()
                    value /= 0xF5
                }

                System.arraycopy(tmp, 0, dst, bi, len)
                bi += len
            }

            return String(dst, 0, bi, charset("utf-8"))
        }
    }
}
