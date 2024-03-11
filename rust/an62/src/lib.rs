const TO_BASE62: [char; 62] = [
	'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
	'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
	'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
	'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
];

pub fn encode(txt: &str) -> String {
	let utf8 = txt.as_bytes() ;
	let utf8_len = utf8.len() ;
	let ret_len = (utf8_len / 3) * 4 + if utf8_len % 3 > 0 { utf8_len % 3 + 1 } else { 0 } ;
	let mut ret: Vec<char> = vec![0 as char; ret_len] ;
	let mut value: usize = 0 ;
	let mut ri = 0 ;

	for i in 0..utf8_len {
		value = value * 0xF5 + utf8[i] as usize ;
		if i % 3 == 2 {
			ret[ri + 3] = TO_BASE62[value % 62] ;
			value /= 62 ;
			ret[ri + 2] = TO_BASE62[value % 62] ;
			value /= 62 ;
			ret[ri + 1] = TO_BASE62[value % 62] ;
			value /= 62 ;
			ret[ri] = TO_BASE62[value] ;

			value = 0 ;
			ri += 4 ;
		}
	}

	let len = utf8_len % 3 ;
	if len > 0 {
		for i in 0..=len {
			ret[ri + len - i] = TO_BASE62[value % 62] ;
			value /= 62 ;
		}
	}

	ret.into_iter().collect()
}

const fn create_from_base62() -> [i8; 256] {
	let mut ret: [i8; 256] = [-1; 256] ;
	let mut i = 0 ;
	while i < 62 {
		ret[TO_BASE62[i] as usize] = i as i8 ;
		i += 1 ;
	}
	ret
}

const FROM_BASE62: [i8; 256] = create_from_base62() ;

pub fn decode(txt: &str) -> Option<String> {
	let utf8: &[u8] = txt.as_bytes() ;
	let utf8_len = utf8.len() ;
	let ret_len = utf8_len / 4 * 3 + if utf8_len % 4 > 0 { utf8_len % 4 - 1 } else { 0 };
	let mut ret: Vec<u8> = vec![0 as u8; ret_len] ;
	
	let mut ri = 0 ;
	let mut value: u32 = 0 ;
	for i in 0..utf8_len {
		let val = FROM_BASE62[utf8[i] as usize] ;
		if val < 0		{	return None ;	}

		value = value * 62 + val as u32;
		if i % 4 == 3 {
			ret[ri + 2] = (value % 0xF5) as u8 ;
			value /= 0xF5 ;
			ret[ri + 1] = (value % 0xF5) as u8 ;
			value /= 0xF5 ;
			ret[ri] = (value % 0xF5) as u8 ;
			
			value = 0 ;
			ri += 3 ;
		}
	}

	let len = utf8_len % 4 ;
	if len > 0 {
		for i in (0..len-1).rev() {
			ret[ri + i] = (value % 0xF5) as u8 ;
			value /= 0xF5 ;
		}
	}

	return Some(String::from_utf8(ret).unwrap()) ;
}
