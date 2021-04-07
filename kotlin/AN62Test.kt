import java.util.*

fun main(args: Array<String>) {
    try {
        val src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可"
        println("src0[" + src0.length + "]:" + src0)
        val an62__tmp0: String = AN62.encode(src0)
        println("an62__tmp0:$an62__tmp0")
        val an62__out0: String = AN62.decode(an62__tmp0)
        println("an62__out0:$an62__out0")
        val base64_tmp = Base64.getEncoder().encodeToString(src0.toByteArray(charset("utf8")))
        println("base64_tmp:$base64_tmp")
        val base64_out = String(Base64.getDecoder().decode(base64_tmp), charset("utf8"))
        println("base64_out:$base64_out")

        // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
        val src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘"
        println("src1[" + src1.length + "]:" + src1) // String.length()은 문자갯수가 아니라, UTF16의 길이다.
        val tmp1: String = AN62.encode(src1)
        println("tmp1:$tmp1")
        val out1: String = AN62.decode(tmp1)
        println("out1:$out1")
        if (src1 == out1) println("src1.equals(out1)")
    } catch (e: Exception) {
        e.printStackTrace()
    }
}