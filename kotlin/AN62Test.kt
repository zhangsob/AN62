import java.util.*
import kotlin.time.DurationUnit
import kotlin.time.TimeSource

fun main(args: Array<String>) {
    try {
        if (true) {
            val timeSource = TimeSource.Monotonic
            val src = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可"
            var out = ""
            var startTime = timeSource.markNow()

            var tmp = AN62.encode(src)

            startTime = timeSource.markNow()
            for(i in 1 .. 1000)
                tmp = AN62.encodeOld(src)
            val encodeOld = (timeSource.markNow() - startTime).toLong(DurationUnit.NANOSECONDS)

            startTime = timeSource.markNow()
            for(i in 1 .. 1000)
                tmp = AN62.encode(src)
            val encode = (timeSource.markNow() - startTime).toLong(DurationUnit.NANOSECONDS)

            startTime = timeSource.markNow()
            for(i in 1 .. 1000)
                out = AN62.decodeOld(tmp)
            val decodeOld = (timeSource.markNow() - startTime).toLong(DurationUnit.NANOSECONDS)

            startTime = timeSource.markNow()
            for(i in 1 .. 1000)
                out = AN62.decode(tmp)
            val decode = (timeSource.markNow() - startTime).toLong(DurationUnit.NANOSECONDS)

            assert(src == out) { "src != out" }

            println("encode = ${encode/1000} ns")
            println("   old = ${encodeOld/1000} ns")
            println("decode = ${decode/1000} ns")
            println("   old = ${decodeOld/1000} ns")
            println(String.format("encode / decode : %5.2f %%", encode * 100f / decode))
            println(String.format("encode /    old : %5.2f %%", encode * 100f / encodeOld))
            println(String.format("decode /    old : %5.2f %%", decode * 100f / decodeOld))
        }

        val src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可"
        println("src0[" + src0.length + "]:" + src0)
        val an62__tmp0: String = AN62.encode(src0)
        println("an62__tmp0:$an62__tmp0")
        val an62__out0: String = AN62.decode(an62__tmp0)
        println("an62__out0:$an62__out0")
        val base64_tmp = Base64.getEncoder().encodeToString(src0.toByteArray())
        println("base64_tmp:$base64_tmp")
        val base64_out = String(Base64.getDecoder().decode(base64_tmp), Charsets.UTF_8)
        println("base64_out:$base64_out")

        // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
        val src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘1"
        println("src1[" + src1.length + "]:" + src1) // String.length()은 문자갯수가 아니라, UTF16의 길이다.
        val tmp1: String = AN62.encode(src1)
        println("tmp1:$tmp1")
        val out1: String = AN62.decode(tmp1)
        println("out1:$out1")
        if (src1 == out1) println("src1 == out1")

    } catch (e: Exception) {
        e.printStackTrace()
    }
}
