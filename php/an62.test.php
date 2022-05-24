<?php require_once 'an62.php' ?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>
<body>
<code>
<?php
try {
	$src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
	printf("src0[%d] : %s<br/>", strlen($src0), nl2br($src0)) ;
	$an62__tmp0 = AN62::encode($src0) ;
	printf("an62__tmp0:%s<br/>", nl2br($an62__tmp0)) ;
	$an62__out0 = AN62::decode($an62__tmp0) ;
	printf("an62__out0:%s<br/>", nl2br($an62__out0)) ;
	$base64_tmp = base64_encode($src0) ;
	printf("base64_tmp:%s<br/>", nl2br($base64_tmp)) ;
	$base64_out = base64_decode($base64_tmp) ;
	printf("base64_out:%s<br/>", nl2br($base64_out)) ;
	
	// [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
	$src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘" ;
	printf("src1[%d]:%s<br/>", strlen($src1), nl2br($src1)) ;
	$tmp1 = AN62::encode($src1) ;
	printf("tmp1:%s<br/>", nl2br($tmp1)) ;
	$out1 = AN62::decode($tmp1) ;
	printf("out1:%s<br/>", nl2br($out1)) ;

	if($src1 === $out1)	echo("src1 === out1<br/>") ;
	
} catch(Exception $ex) {
	printf("Exception : %s<br/>", $ex->getMessage()) ;
}
?>
</code>
</body>
</html>
