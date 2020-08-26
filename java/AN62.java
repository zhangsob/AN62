import java.io.UnsupportedEncodingException;
import java.util.Arrays;

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
 * @history 2020-08-25 encode(), decode() 만듦.<br/>             
 */
public class AN62 {
	private static final char[] toBase62= {
		'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
		'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
		'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
	};

	public static String encode(String text) throws UnsupportedEncodingException {
		byte[] utf8 = text.getBytes("utf-8");
		StringBuilder ret = new StringBuilder() ;
		int value = 0 ;
		int val = 0 ;
		int len = utf8.length ;
		char[] tmp = new char[4] ;
		for(int i = 0; i < len; ++i) {
			val = (utf8[i] & 0xFF) ;
			if(val >= 0xF5) throw new UnsupportedEncodingException("invalid UTF8 character") ;

			value = value * 0xF5 + val;
			if(i % 3 == 2) {
				for(int j = 3; j >= 0; --j, value /= 62)
					tmp[j] = toBase62[value % 62];

				value = 0 ;
				ret.append(tmp, 0, 4) ;
			}
		}
		
		len = utf8.length % 3 ;
		if(len > 0) {
			for(int j = len; j >= 0; --j, value /= 62)
				tmp[j] = toBase62[value % 62];

			ret.append(tmp, 0, len+1) ;
		}

		return ret.toString() ;
	}

	private static final int[] fromBase62 = new int[128] ;
	static {
		Arrays.fill(fromBase62, -1);
		for (int i = 0, len = toBase62.length; i < len; i++)
			fromBase62[toBase62[i]] = i;
	}

	public static String decode(String text) throws UnsupportedEncodingException {
		int len = text.length() ;
		if(len % 4 == 1)	throw new IllegalArgumentException("invalid AN62 length") ;

		byte[] dst = new byte[len / 4 * 3 + ((len % 4 > 0) ? len%4 - 1 : 0)] ;
		byte[] tmp = new byte[3] ;
		int value = 0 ;
		int val = 0 ;
		char ch = 0 ;

		int bi = 0 ;
		for(int i = 0; i < len; ++i) {
			ch = text.charAt(i) ;
			if(ch >= 0x80)
				throw new IllegalArgumentException("invalid AN62 character " + ch) ;
			
			val = fromBase62[ch] ;
			if(val < 0)
				throw new IllegalArgumentException("invalid AN62 character " + ch) ;
			
			value = value * 62 + val;
			if(i % 4 == 3) {
				for(int j = 2; j >= 0; --j, value /= 0xF5)
					tmp[j] = (byte)(value % 0xF5) ;

				value = 0 ;
				System.arraycopy(tmp, 0, dst, bi, 3);
				bi += 3 ;
			}
		}

		len = len % 4 ;
		if(len > 0) {
			len -= 1 ;
			for(int j = len-1; j >= 0; --j, value /= 0xF5)
				tmp[j] = (byte)(value % 0xF5) ;

			System.arraycopy(tmp, 0, dst, bi, len);
			bi += len ;
		}

		return new String(dst, 0, bi, "utf-8");
	}

	public static void main(String[] args) {
		try {
			String src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
			System.out.println("src0["+src0.length()+"]:" + src0) ;
			String an62__tmp0 = AN62.encode(src0) ;
			System.out.println("an62__tmp0:" + an62__tmp0) ;
			String an62__out0 = AN62.decode(an62__tmp0) ;
			System.out.println("an62__out0:" + an62__out0) ;
			String base64_tmp = java.util.Base64.getEncoder().encodeToString(src0.getBytes("utf8")) ;
			System.out.println("base64_tmp:" + base64_tmp) ;
			String base64_out = new String(java.util.Base64.getDecoder().decode(base64_tmp), "utf8") ;
			System.out.println("base64_out:" + base64_out) ;

			// [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
			String src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘" ;
			System.out.println("src1["+src1.length()+"]:" + src1) ;		// String.length()은 문자갯수가 아니라, UTF16의 길이다. 
			String tmp1 = AN62.encode(src1) ;
			System.out.println("tmp1:" + tmp1) ;
			String out1 = AN62.decode(tmp1) ;
			System.out.println("out1:" + out1) ;
			
			if(src1.equals(out1))	System.out.println("src1.equals(out1)") ;
			
		} catch(Exception e) {
			e.printStackTrace();
		}
	}
}
