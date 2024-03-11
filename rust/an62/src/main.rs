use an62;

fn main() {
	{
		// [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
		let src = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘1" ;
		println!("src[{}]: {}", src.len(), src) ;
		let tmp = an62::encode(src);
		println!("tmp[{}]: {}", tmp.len(), tmp) ;
		let txt = an62::decode(tmp.as_str()) ;
		match txt {
			Some(txt) => println!("txt[{}]: {}", txt.len(), txt),
			None => println!("None"),
		}
	}
}
