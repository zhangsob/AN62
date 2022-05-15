// for node
const AN62 = require('./AN62.js') ;

function print(msg) {
    if(typeof document !== 'undefined' && typeof msg === 'string')
        document.write(msg.replace(/\n/g,'<br/>') + '<br/>') ;
    console.log(msg) ;
}

try {
    var src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
    print('src0['+src0.length+']:' + src0) ;
    var tmp0 = AN62.encode(src0) ;
    print("tmp0:" + tmp0) ;
    var out0 = AN62.decode(tmp0) ;
    print("out0:" + out0) ;

    // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
    var src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘" ;
    print('src1['+src1.length+']:' + src1) ;
    var tmp1 = AN62.encode(src1) ;
    print("tmp1:" + tmp1) ;
    var out1 = AN62.decode(tmp1) ;
    print("out1:" + out1) ;

    if(src1 === out1)   print("src1 === out1") ;
} catch(e) {
    print(e) ;
}
