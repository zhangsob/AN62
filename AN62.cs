using System;
using System.Text;

/// <summary>
/// AN62(AlphaNumeric62, BASE62)란..Text에서 특수문자를 제거한 숫자(10)+영문대문자(26)+영문소문자(26) = 62가지 문자로 변환하기
///
/// 원리 : Text를 UTF8처리한다.
///        여기서, Unicode값 : 0 ~ 0xFFFF(65,536가지)까지의 거의 모든 주요 나라 언어 사용한다.
///
///        UTF8은 아래와 같은 Byte범위를 갖는다.
///        그럼, 0 ~ 0x7F(127)                 --> 0xxx xxxx                       --> 0x00 ~ 0x7F,
///              0x80(128) ~ 0x7FF(2,047)      --> 110x xxxx 10xxx xxxx            --> 0xC0 ~ 0xDF, 0x80 ~ 0xBF
///              0x800(2,048) ~ 0xFFFF(65,535) --> 1110 xxxx 10xxx xxxx 10xxx xxxx --> 0xE0 ~ 0xEF, 0x80 ~ 0xBF, 0x80 ~ 0xBF
///        그래서, 0x00 ~ 0x7F, 0x80 ~ 0xBF, 0xC0 ~ 0xDF, 0xE0 ~ 0xEF = 0x00 ~ 0xEF (즉, 240가지)
///              240의 1승(240^1 = 240), 240의 2승(240^2 = 60,025), 240의 3승(240^3 = 13,824,000)
///               61의 1승( 61^1 =  61),  61의 2승( 61^2 =  3,721),  61의 3승( 61^3 =    226,981), 61의 4승(61^4 = 13,845,841)
///        즉, 240^3 &lt; 61^4이다. [ BASE64처럼 256 ^ 3 = 64 ^ 4 구현하면 된다. ]
///
///        여기서, 'z'를 Padding으로 사용할 수도 있었으나, 아래와 같이 활용함.
///        0xF0 ~ 0xFF을 escape하는 용도로 하여 Binary를 Text화 일반적인 encoding하는데 사용하였다.
///        bin2txt()함수
///
/// @author     zhangsob
/// @history    2020-07-03 encode(), decode() 만듦.
///             2020-07-14 bin2txt(), txt2bin() 만듦.
/// </summary>
namespace AN62
{
    class AN62
    {
        private static char[] toBase62 = {
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        };

        public static string encode(string text)
        {
            byte[] utf8 = Encoding.UTF8.GetBytes(text);
            StringBuilder ret = new StringBuilder();
            int value = 0;
            int val = 0;
            int len = utf8.Length;
            char[] tmp = new char[4];
            for (int i = 0; i < len; ++i)
            {
                val = (utf8[i] & 0xFF);
                if (val >= 0xF0)
                {
                    for (int j = 0; j < text.Length; ++j)
                        if(Char.ConvertToUtf32(text, j) > 0xFFFF)
                            throw new ArgumentException("Illegal base62 character index " + j + " " + text.Substring(j,2));
                }

                value = value * 0xF0 + val;
                if (i % 3 == 2)
                {
                    for (int j = 3; j >= 0; --j, value /= 61)
                        tmp[j] = toBase62[value % 61];

                    value = 0;
                    ret.Append(tmp, 0, 4);
                }
            }

            len = utf8.Length % 3;
            if (len > 0)
            {
                for (int j = len; j >= 0; --j, value /= 61)
                    tmp[j] = toBase62[value % 61];

                ret.Append(tmp, 0, len + 1);
            }

            return ret.ToString();
        }

        private static int[] fromBase62 = new int[128];
        private static void fill() {
            for (int i = 0, len = fromBase62.Length; i < len; ++i)
                fromBase62[i] = -1;
            for (int i = 0, len = toBase62.Length; i<len; i++)
                fromBase62[toBase62[i]] = i;
            fromBase62['z'] = -2;
        }

        public static string decode(string text)
        {
            int len = text.Length;
		    if(len % 4 == 1)	throw new ArgumentException("Illegal base62 length");

            fill();
            byte[] dst = new byte[len / 4 * 3 + ((len % 4 > 0) ? len % 4 - 1 : 0)];
            byte[] tmp = new byte[3];
            int value = 0;
            int val = 0;
            char ch = (char)0;

            int bi = 0;
		    for(int i = 0; i < len; ++i) {
			    ch = text[i] ;
			    if(ch >= 0x80)
                    throw new ArgumentException("Illegal base62 character " + ch);

                val = fromBase62[ch] ;
			    if(val< 0)
                    throw new ArgumentException("Illegal base62 character " + ch);

                value = value* 61 + val;
			    if(i % 4 == 3) {
                    for(int j = 2; j >= 0; --j, value /= 0xF0)
					    tmp[j] = (byte)(value % 0xF0) ;

				    value = 0 ;
				    Array.Copy(tmp, 0, dst, bi, 3);
				    bi += 3 ;
			    }
            }

            len = len % 4 ;
		    if(len > 0) {
			    len -= 1 ;
			    for(int j = len - 1; j >= 0; --j, value /= 0xF0)
				    tmp[j] = (byte)(value % 0xF0) ;

                Array.Copy(tmp, 0, dst, bi, len);
			    bi += len ;
		    }
		
		    return Encoding.UTF8.GetString(dst, 0, bi);
	    }

        public static string bin2txt(byte[] bin)
        {
            StringBuilder ret = new StringBuilder();
            int value = 0;
            int len = bin.Length / 3 * 3;
            char[] tmp = new char[4];
            int FX_bit = 0;
            int i = 0;

            for (i = 0; i < len; i += 3)
            {
                FX_bit = 0;
                value = 0;

                for (int j = 0; j < 3; ++j)
                {
                    if ((bin[i + j] & 0xF0) == 0xF0)
                    {
                        FX_bit = 1;
                        break;
                    }
                }

                if (FX_bit != 0)
                {
                    ret.Append('z');

                    FX_bit = 0;
                    for (int j = 0; j < 3; ++j)
                    {
                        FX_bit <<= 1;
                        if ((bin[i + j] & 0xF0) == 0xF0)
                        {
                            FX_bit |= 0x01;
                        }
                        else
                        {
                            value <<= 4;
                            value |= (bin[i + j] >> 4) & 0x0F;
                        }
                        value <<= 4;
                        value |= bin[i + j] & 0x0F;
                    }
                    value |= FX_bit << 20;
                }
                else
                {
                    for (int j = 0; j < 3; ++j)
                        value = value * 0xF0 + (bin[i + j] & 0xFF);
                }

                for (int j = 3; j >= 0; --j, value /= 61)
                    tmp[j] = toBase62[value % 61];

                ret.Append(tmp, 0, 4);
            }

            len = bin.Length % 3;
            if (len > 0)
            {
                FX_bit = 0;
                value = 0;
                for (int j = 0; j < len; ++j)
                {
                    if ((bin[i + j] & 0xF0) == 0xF0)
                    {
                        FX_bit = 1;
                        break;
                    }
                }

                if (FX_bit != 0)
                {
                    ret.Append('z');

                    FX_bit = 0;
                    for (int j = 0; j < len; ++j)
                    {
                        FX_bit <<= 1;

                        if ((bin[i + j] & 0xF0) == 0xF0)
                        {
                            FX_bit |= 0x01;
                        }
                        else
                        {
                            value <<= 4;
                            value |= (bin[i + j] >> 4) & 0x0F;
                        }
                        value <<= 4;
                        value |= bin[i + j] & 0x0F;
                    }

                    value |= FX_bit << ((len == 1) ? 4 : 12);
                }
                else
                {
                    for (int j = 0; j < len; ++j)
                        value = value * 0xF0 + (bin[i + j] & 0xFF);
                }

                for (int j = len; j >= 0; --j, value /= 61)
                    tmp[j] = toBase62[value % 61];

                ret.Append(tmp, 0, len + 1);
            }

            return ret.ToString();
        }

        public static byte[] txt2bin(string txt)
        {
            int len = txt.Length;
            fill();
            byte[] dst = new byte[len / 4 * 3 + ((len % 4 > 0) ? len % 4 - 1 : 0)];
            byte[] tmp = new byte[3];

            int value = 0;
            int val = 0;
            char ch = (char)0;
            int count = 0;
            int bi = 0;
            int isFX = 0;
            for (int i = 0; i < len; ++i)
            {
                ch = txt[i];
                if (ch >= 0x80)
                    throw new ArgumentException("Illegal base62 character " + ch);

                val = fromBase62[ch];
                if (val < 0)
                {
                    if (val == -2 && (count % 4) == 0 && isFX == 0)
                    {
                        isFX = 1;
                        continue;
                    }

                    throw new ArgumentException("Illegal base62 character " + ch);
                }
                ++count;

                value = value * 61 + val;
                if (count % 4 == 0)
                {
                    if (isFX != 0)
                    {
                        isFX = value >> 20;
                        for (int j = 2, mask = 1; j >= 0; --j, mask <<= 1)
                        {
                            tmp[j] = (byte)(value & 0x0F); value >>= 4;
                            if ((isFX & mask) == mask)  { tmp[j] |= 0xF0; }
                            else                        { tmp[j] |= (byte)((value & 0x0F) << 4); value >>= 4; }
                        }
                        isFX = 0;
                    }
                    else
                    {
                        for (int j = 2; j >= 0; --j, value /= 0xF0)
                            tmp[j] = (byte)(value % 0xF0);
                    }

                    value = 0;
                    Array.Copy(tmp, 0, dst, bi, 3);
                    bi += 3;
                }
            }

            len = count % 4;
            if (len > 0)
            {
                len -= 1;
                if (isFX != 0)
                {
                    isFX = value >> ((len >= 2) ? 12 : 4);
                    for (int j = len - 1, mask = 1; j >= 0; --j, mask <<= 1)
                    {
                        tmp[j] = (byte)(value & 0x0F); value >>= 4;
                        if ((isFX & mask) == mask)  { tmp[j] |= 0xF0; }
                        else                        { tmp[j] |= (byte)((value & 0x0F) << 4); value >>= 4; }
                    }
                }
                else
                {
                    for (int j = len - 1; j >= 0; --j, value /= 0xF0)
                        tmp[j] = (byte)(value % 0xF0);
                }

                Array.Copy(tmp, 0, dst, bi, len);
                bi += len;
            }

            if (bi < dst.Length)
            {
                byte[] ret = new byte[bi];
                Array.Copy(dst, 0, ret, 0, bi);
                return ret;
            }

            return dst;
        }

        static void Main(string[] args)
        {
            string src0 = "http://test.com:8080/name=가나 다라ㄱ※\n可";
            Console.WriteLine("src0:" + src0);
            string tmp0 = AN62.encode(src0);
            Console.WriteLine("tmp0:" + tmp0);
            string out0 = AN62.decode(tmp0);
            Console.WriteLine("out0:" + out0);

            string src1 = "http://test.com:8080/name=가나 다라ㄱ※\n可🐘"; // UnsupportedEncodingException이 발생하는 경우
            Console.WriteLine("src1:" + src1);
            try
            {
                string tmp1 = AN62.encode(src1);
                Console.WriteLine("tmp1:" + tmp1);
                string out1 = AN62.decode(tmp1);
                Console.WriteLine("out1:" + out1);
            }
            catch (ArgumentException ae)
            {
                Console.Error.WriteLine(ae);

                string tmp2 = AN62.bin2txt(Encoding.UTF8.GetBytes(src1));
                Console.WriteLine("tmp2:" + tmp2);
                string out2 = Encoding.UTF8.GetString(AN62.txt2bin(tmp2));
                Console.WriteLine("out2:" + out2);
            }
        }
    }
}
