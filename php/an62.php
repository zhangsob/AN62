<?php
final class AN62 {
	private static $toBase62 = [
		'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
		'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
		'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
	] ;
	
	static function isUTF8(string $string) : bool {   
		return preg_match('%^(?:  
			[\x09\x0A\x0D\x20-\x7E] # ASCII  
			| [\xC2-\xDF][\x80-\xBF] # non-overlong 2-byte  
			| \xE0[\xA0-\xBF][\x80-\xBF] # excluding overlongs  
			| [\xE1-\xEC\xEE\xEF][\x80-\xBF]{2} # straight 3-byte  
			| \xED[\x80-\x9F][\x80-\xBF] # excluding surrogates  
			| \xF0[\x90-\xBF][\x80-\xBF]{2} # planes 1-3  
			| [\xF1-\xF3][\x80-\xBF]{3} # planes 4-15  
			| \xF4[\x80-\x8F][\x80-\xBF]{2} # plane 16  
			)*$%xs', $string);
	}

	static function encode(string $text) : string {
		$utf8 = unpack('C*', $text) ;
		$ret = "" ;
		$value = 0 ;
		$tmp = range(0, 3) ;

		$i = 0 ;
		foreach($utf8 as $val) {
			if($val >= 0xF5) throw new Exception("invalid UTF8 character") ;

			$value = $value * 0xF5 + $val;
			if(++$i % 3 == 0) {
				for($j = 3; $j >= 0; --$j, $value /= 62)
					$tmp[$j] = self::$toBase62[$value % 62] ;

				$value = 0 ;
				$ret .= join('', $tmp) ;
			}
		}

		$len = count($utf8) % 3 ;
		if($len > 0) {
			$tmp = array() ;
			for($j = $len; $j >= 0; --$j, $value /= 62)
				array_unshift($tmp, self::$toBase62[$value % 62]) ;

			$ret .= join('', $tmp) ;
		}

		return $ret ;
	}

	private static function GetFromBase62() {
		static $fromBase62 = array() ;
		if(count($fromBase62) == 0) {
			$fromBase62 = array_fill(0, 256, -1) ;
			foreach(self::$toBase62 as $k => $v)
				$fromBase62[ord($v)] = $k ;
		}
		return $fromBase62 ;
	}

	static function decode(string $text) : string {
		$utf8 = unpack('C*', $text) ;
		$len = count($utf8) ;
		if($len % 4 == 1)	throw new Exception("invalid AN62 length") ;
		$fromBase62 = self::GetFromBase62() ;
		$dst = "" ;
		$value = 0 ;
		$tmp = range(0, 2) ;
		
		$i = 0 ;
		foreach($utf8 as $b) {
			$val = $fromBase62[$b] ;
			if($val < 0)
				throw new Exception("invalid AN62 character ".chr($val)) ;
			
			$value = $value * 62 + $val;
			if(++$i % 4 == 0) {
				for($j = 2; $j >= 0; --$j, $value /= 0xF5)
					$tmp[$j] = chr($value % 0xF5) ;

				$value = 0 ;
				$dst .= join('', $tmp) ;
			}
		}

		$len = $len % 4 ;
		if($len > 0) {
			$tmp = array() ;
			$len -= 1 ;
			for($j = $len-1; $j >= 0; --$j, $value /= 0xF5)
				array_unshift($tmp, chr($value % 0xF5)) ;

			$dst .= join('', $tmp) ;
		}

		return $dst ;
	}
}
?>