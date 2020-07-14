# AN62(BASE62)
BASE64 Encode에는 +/= 기본형 또는 -_= URL형이 있다.
여기서, 항상 특수문자가 문제가 되어. 0&#126;9, A&#126;Z, a&#126;z만으로 이루어진 Base62 아니, AlphaNumeric62을 만들어 보았다.

아래 언어로 소스코드를 올립니다. 
- java
- javascript
- cpp
- C#


예> java
<pre>
<code>
public static void main(String[] args) {
    try {
        String src0 = "http://test.com:8080/name=가나 다라ㄱ※\n可" ;
        System.out.println("src0:" + src0) ;
        String tmp0 = AN62.encode(src0) ;
        System.out.println("tmp0:" + tmp0) ;
        String out0 = AN62.decode(tmp0) ;
        System.out.println("out0:" + out0) ;
        
        String src1 = "http://test.com:8080/name=가나 다라ㄱ※\n可🐘" ;	// UnsupportedEncodingException이 발생하는 경우
        System.out.println("src1:" + src1) ;
        try {
            String tmp1 = AN62.encode(src1) ;
            System.out.println("tmp1:" + tmp1) ;
            String out1 = AN62.decode(tmp1) ;
            System.out.println("out1:" + out1) ;
        } catch(UnsupportedEncodingException uee) {
            System.err.println(uee) ;
            
            String tmp2 = AN62.bin2txt(src1.getBytes("utf8")) ;
            System.out.println("tmp2:" + tmp2) ;
            String out2 = new String(AN62.txt2bin(tmp2), "utf8") ;
            System.out.println("out2:" + out2) ;				
        }
    } catch(Exception e) {
        e.printStackTrace();
    }
}
</code>
</pre>