// for node
const { performance } = require("perf_hooks");
const AN62 = require('./AN62.js') ;

function print(msg) {
	if(typeof document !== 'undefined' && typeof msg === 'string')
		document.write(msg.replace(/\n/g,'<br/>') + '<br/>') ;
	console.log(msg) ;
}

try {
if (true) {
	var src = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
	var encode = 0.0, decode = 0.0, encodeOld = 0.0, decodeOld = 0.0 ;
	var tmp, out, start ;
	{
		start = performance.now();
		for(var i = 0; i < 1000; ++i)
			tmp = AN62.encodeOld(src) ;
		encodeOld += performance.now() - start ;

		start = performance.now();
		for(var i = 0; i < 1000; ++i)
			tmp = AN62.encode(src) ;
		encode += performance.now() - start ;

		start = performance.now();
		for(var i = 0; i < 1000; ++i)
			out = AN62.decodeOld(tmp) ;
		decodeOld += performance.now() - start ;

		start = performance.now();
		for(var i = 0; i < 1000; ++i)
			out = AN62.decode(tmp) ;
		decode += performance.now() - start ;

		if(src !== out)   print("src !== out") ;
	}
	print("encode:" + (encode / 1000) + " millisec") ;
	print("   old:" + (encodeOld / 1000) + " millisec") ;
	print("decode:" + (decode / 1000) + " millisec") ;
	print("   old:" + (decodeOld / 1000) + " millisec") ;
	print("encode / decode : " + Math.floor(encode * 100.0 / decode) + " %");
	print("encode / old : " + Math.floor(encode * 100.0 / encodeOld) + " %");
	print("decode / old : " + Math.floor(decode * 100.0 / decodeOld) + " %");
}
	var src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
	print('src0['+src0.length+']:' + src0) ;
	var tmp0 = AN62.encode(src0) ;
	print("tmp0:" + tmp0) ;
	var out0 = AN62.decode(tmp0) ;
	print("out0:" + out0) ;

	// [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
	var src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘1" ;
	print('src1['+src1.length+']:' + src1) ;
	var tmp1 = AN62.encode(src1) ;
	print("tmp1:" + tmp1) ;
	var out1 = AN62.decode(tmp1) ;
	print("out1:" + out1) ;

	if(src1 === out1)   print("src1 === out1") ;
} catch(e) {
	print(e) ;
}
