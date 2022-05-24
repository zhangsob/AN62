using System;
using System.Text;

/// <summary>
/// AN62(AlphaNumeric62)란..Text에서 특수문자를 제거한 숫자(10)+영문대문자(26)+영문소문자(26) = 62가지 문자로 변환하기
///
/// 원리 : Text를 UTF8처리한다.
///
///        UTF8은 아래와 같은 Byte범위를 갖는다.
///        그럼, 0x000000 ~ 0x00007F --> 0xxx xxxx                               --> 0x00 ~ 0x7F,
///              0x000080 ~ 0x0007FF --> 110x xxxx 10xx xxxx                     --> 0xC0 ~ 0xDF, 0x80 ~ 0xBF
///              0x000800 ~ 0x00FFFF --> 1110 xxxx 10xx xxxx 10xx xxxx           --> 0xE0 ~ 0xEF, 0x80 ~ 0xBF, 0x80 ~ 0xBF
///              0x010000 ~ 0x10FFFF --> 1111 0zzz 10zz xxxx 10xx xxxx 10xx xxxx --> 0xF0 ~ 0xF4, 0x80 ~ 0xBF, 0x80 ~ 0xBF, 0x80 ~ 0xBF
///        그래서, 0x00 ~ 0x7F, 0x80 ~ 0xBF, 0xC0 ~ 0xDF, 0xE0 ~ 0xEF, 0xF0 ~ 0xF4 = 0x00 ~ 0xF4 (즉, 245가지)
///              245의 1승(245^1 =   245), 245의 2승(245^2 =  60,025), 245의 3승(245^3 = 14,706,125)
///               62의 2승( 62^2 = 3,844),  62의 3승( 62^3 = 238,328),  62의 4승( 62^4 = 14,778,336)
///        즉, 245^3 &lt; 62^4이다. [ BASE64(256^3 = 64^4)처럼 구현하면 된다. ]
///
///        Binary To String Encoding은 <a href='https://github.com/zhansgsob/Base62'>https://github.com/zhansgsob/Base62</a> 를 참조.<br/>
/// 
/// @author     zhangsob@gmail.com
/// 
/// @history    2020-08-25 encode(), decode() 만듦.
/// </summary>
namespace AN62
{
	class AN62
	{
		private static char[] _TO_BASE62 = {
			'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
			'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
			'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
			'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
			'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
			'\0'
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
				if (val >= 0xF5) throw new ArgumentException("invalid UTF8 character");

				value = value * 0xF5 + val;
				if (i % 3 == 2)
				{
					for (int j = 3; j >= 0; --j, value /= 62)
						tmp[j] = _TO_BASE62[value % 62];

					value = 0;
					ret.Append(tmp, 0, 4);
				}
			}

			len = utf8.Length % 3;
			if (len > 0)
			{
				for (int j = len; j >= 0; --j, value /= 62)
					tmp[j] = _TO_BASE62[value % 62];

				ret.Append(tmp, 0, len + 1);
			}

			return ret.ToString();
		}

		private static int[] _FROM_BASE62 = new int[128];

		private static void fill()
		{
			for (int i = 0, len = _FROM_BASE62.Length; i < len; ++i)
				_FROM_BASE62[i] = -1;
			for (int i = 0, len = _TO_BASE62.Length; i < len; i++)
				_FROM_BASE62[_TO_BASE62[i]] = i;
		}

		public static string decode(string text)
		{
			int len = text.Length;
			if (len % 4 == 1) throw new ArgumentException("invalid AN62 length");

			fill();
			byte[] dst = new byte[len / 4 * 3 + ((len % 4 > 0) ? len % 4 - 1 : 0)];
			byte[] tmp = new byte[3];
			int value = 0;
			int val = 0;
			char ch = (char)0;

			int bi = 0;
			for (int i = 0; i < len; ++i)
			{
				ch = text[i];
				if (ch >= 0x80)
					throw new ArgumentException("invalid AN62 character " + ch);

				val = _FROM_BASE62[ch];
				if (val < 0)
					throw new ArgumentException("invalid AN62 character " + ch);

				value = value * 62 + val;
				if (i % 4 == 3)
				{
					for (int j = 2; j >= 0; --j, value /= 0xF5)
						tmp[j] = (byte)(value % 0xF5);

					value = 0;
					Array.Copy(tmp, 0, dst, bi, 3);
					bi += 3;
				}
			}

			len = len % 4;
			if (len > 0)
			{
				len -= 1;
				for (int j = len - 1; j >= 0; --j, value /= 0xF5)
					tmp[j] = (byte)(value % 0xF5);

				Array.Copy(tmp, 0, dst, bi, len);
				bi += len;
			}

			return Encoding.UTF8.GetString(dst, 0, bi);
		}

		static void Main(string[] args)
		{
			string src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可";
			Console.WriteLine("src0[" + src0.Length + "]:" + src0);
			string an62__tmp0 = AN62.encode(src0);
			Console.WriteLine("an62__tmp0:" + an62__tmp0);
			string an62__out0 = AN62.decode(an62__tmp0);
			Console.WriteLine("an62__out0:" + an62__out0);
			string base64_tmp = Convert.ToBase64String(Encoding.UTF8.GetBytes(src0));
			Console.WriteLine("base64_tmp:" + base64_tmp);
			string base64_out = Encoding.UTF8.GetString(Convert.FromBase64String(base64_tmp));
			Console.WriteLine("base64_out:" + base64_out);

			// [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
			string src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘";
			Console.WriteLine("src1[" + src1.Length + "]:" + src1);
			string tmp1 = AN62.encode(src1);
			Console.WriteLine("tmp1:" + tmp1);
			string out1 = AN62.decode(tmp1);
			Console.WriteLine("out1:" + out1);

			if (src1.Equals(out1)) Console.WriteLine("src1.Equals(out1)");
		}
	}
}
