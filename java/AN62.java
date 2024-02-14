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

	public static String encodeOld(String text) throws UnsupportedEncodingException {
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
	
	public static String encode(String text) throws UnsupportedEncodingException {
		byte[] utf8 = text.getBytes("utf-8");
		char[] ret_buffer = new char[((utf8.length + 2) / 3) * 4] ;
		int value = 0 ;

		int len = utf8.length ;
		int ri = 0;
		for(int i = 0; i < len; ++i) {
			value = value * 0xF5 + (utf8[i] & 0xFF);
			if(i % 3 == 2) {
				ret_buffer[ri + 3] = toBase62[value % 62] ;
				value /= 62 ;
				ret_buffer[ri + 2] = toBase62[value % 62] ;
				value /= 62 ;
				ret_buffer[ri + 1] = toBase62[value % 62] ;
				value /= 62 ;
				ret_buffer[ri] = toBase62[value] ;

				value = 0 ;
				ri += 4 ;
			}
		}
		
		len = utf8.length % 3 ;
		if(len > 0) {
			for(int j = len; j >= 0; --j, value /= 62)
				ret_buffer[ri + j] = toBase62[value % 62] ;

			ri += len + 1 ;
		}

		return new String(ret_buffer, 0, ri) ;
	}

	private static final int[] fromBase62 = new int[128] ;
	static {
		Arrays.fill(fromBase62, -1);
		for (int i = 0, len = toBase62.length; i < len; i++)
			fromBase62[toBase62[i]] = i;
	}

	public static String decodeOld(String text) throws UnsupportedEncodingException {
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
	
	public static String decode(String text) throws UnsupportedEncodingException {
		char[] chs = text.toCharArray() ;
		int len = chs.length ;
		if(len % 4 == 1)	throw new IllegalArgumentException("invalid AN62 length") ;

		byte[] dst = new byte[len / 4 * 3 + ((len % 4 > 0) ? len%4 - 1 : 0)] ;
		byte[] tmp = new byte[3] ;
		int value = 0 ;
		int val = 0 ;

		int bi = 0 ;
		int ii = 0 ;
		for(char ch : chs) {
			if(ch >= 0x80)
				throw new IllegalArgumentException("invalid AN62 character " + ch) ;
			
			val = fromBase62[ch] ;
			if(val < 0)
				throw new IllegalArgumentException("invalid AN62 character " + ch) ;
			
			value = value * 62 + val;
			if(++ii % 4 == 0) {
				dst[bi + 2] = (byte)(value % 0xF5) ;
				value /= 0xF5 ;
				dst[bi + 1] = (byte)(value % 0xF5) ;
				value /= 0xF5 ;
				dst[bi] = (byte)value ;

				value = 0 ;
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
			if(true)
			{
				String src = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
				long encode = 0, decode = 0, encodeOld = 0, decodeOld = 0 ;
				long start_time = 0 ;
				String tmp = "", out = "";
				
				{
					start_time = System.nanoTime() ;
					for(int i = 0; i < 1000; ++i)
						tmp = AN62.encodeOld(src) ;
					encodeOld += System.nanoTime() - start_time ;
				
					start_time = System.nanoTime() ;
					for(int i = 0; i < 1000; ++i)
						tmp = AN62.encode(src) ;
					encode += System.nanoTime() - start_time ;
					
					start_time = System.nanoTime() ;
					for(int i = 0; i < 1000; ++i)
						out = AN62.decodeOld(tmp) ;
					decodeOld += System.nanoTime() - start_time ;
					
					start_time = System.nanoTime() ;
					for(int i = 0; i < 1000; ++i)
						out = AN62.decode(tmp) ;
					decode += System.nanoTime() - start_time ;
					
					assert src.equals(out) : "src.equals(out) == false" ;
				}
				
				System.out.println("encode = " + encode/1000 + " nano sec") ;
				System.out.println("   old = " + encodeOld/1000 + " nano sec") ;
				System.out.println("decode = " + decode/1000 + " nano sec") ;
				System.out.println("   old = " + decodeOld/1000 + " nano sec") ;
				System.out.printf("encode / decode : %5.2f %%%n", encode * (float)100 / (float)decode);
				System.out.printf("encode /    old : %5.2f %%%n", encode * (float)100 / (float)encodeOld);
				System.out.printf("decode /    old : %5.2f %%%n", decode * (float)100 / (float)decodeOld);
				System.out.println("---------------------------------") ;
			}
			
			{
				String src = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
				System.out.println("src["+src.length()+"]:" + src) ;
				String an62___tmp = AN62.encode(src) ;
				System.out.println("an62___tmp:" + an62___tmp) ;
				String an62___out = AN62.decode(an62___tmp) ;
				System.out.println("an62___out:" + an62___out) ;
				String base64_tmp = java.util.Base64.getEncoder().encodeToString(src.getBytes("utf8")) ;
				System.out.println("base64_tmp:" + base64_tmp) ;
				String base64_out = new String(java.util.Base64.getDecoder().decode(base64_tmp), "utf8") ;
				System.out.println("base64_out:" + base64_out) ;
			}
			System.out.println("---------------------------------") ;
			{
				// [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
				String src = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘1" ;
				System.out.println("src:" + src) ;
				String tmp = AN62.encode(src) ;
				System.out.println("tmp:" + tmp) ;
				String out = AN62.decode(tmp) ;
				System.out.println("out:" + out) ;
				if(src.equals(out))	System.out.println("src.equals(out)") ;
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
	}
}
