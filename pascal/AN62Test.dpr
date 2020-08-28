{ charset : EUC-KR }
program AN62Test;

{$APPTYPE CONSOLE}

uses
  SysUtils,
  AN62 in 'AN62.pas',
  ZString in 'ZString.pas';

var
  wsrc, wout : WideString ;
  wtmp, tmp0, tmp8 : string ;
  src0, out0 : AnsiString ;
  utf8, out8 : UTF8String ;
begin
  WriteLn('----------AnsiString------------') ;
  src0 := 'http://test.com:8080/an62.do?name=°¡³ª´Ù ¤¡¤¤¡Ø'#10'Ê¦' ;
  WriteLn('src0[', Length(src0), ']:', src0) ;

  tmp0 := TAN62.Encode(AnsiToUtf8(src0)) ;
  WriteLn('tmp0[', Length(tmp0), ']:', tmp0) ;

  out0 := Utf8ToAnsi(TAN62.Decode(tmp0)) ;
  WriteLn('out0[', Length(out0), ']:', out0) ;

  WriteLn('src0 = out0 : ', (src0 = out0)) ;

  WriteLn('----------UTF8String----------') ;
  utf8 := AnsiToUtf8('http://test.com:8080/an62.do?name=°¡³ª´Ù ¤¡¤¤¡Ø'#10'Ê¦') ;
  WriteLn('utf8[', Length(utf8), ']:', Utf8ToAnsi(utf8)) ;

  tmp8 := TAN62.Encode(utf8) ;
  WriteLn('tmp8[', Length(tmp8), ']:', tmp8) ;

  out8 := TAN62.Decode(tmp8) ;
  WriteLn('out8[', Length(out8), ']:', Utf8ToAnsi(out8)) ;

  WriteLn('utf8 = out8 : ', (utf8 = out8)) ;

  WriteLn('----------WideString------------') ;
  // [ ÄÚ³¢¸® = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
  wsrc := 'http://test.com:8080/an62.do?name=°¡³ª´Ù ¤¡¤¤¡Ø'#10'Ê¦' ;
  wsrc := wsrc + #55357 ; // 0xD83D #55357
  wsrc := wsrc + #56344 ; // 0xDC18 #56344
  WriteLn('wsrc[', Length(wsrc), ']:', wsrc) ;

  wtmp := TAN62.Encode(wsrc) ;
  WriteLn('wtmp[', Length(wtmp), ']:', wtmp) ;

  //wout := UTF8Decode(TAN62.Decode(wtmp)) ;  // ÄÚ³¢¸® ¶§¹®¿¡ ¾ÈµÊ.
  wout := TZString.SafeUTF8Decode(TAN62.Decode(wtmp)) ;
  WriteLn('wout[', Length(wout), ']:', wout) ;

  WriteLn('wsrc = wout : ', (wsrc = wout)) ;

  WriteLn('----------UTF8String----------') ;
  // [ ÄÚ³¢¸® = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
  utf8 := UTF8Encode('http://test.com:8080/an62.do?name=°¡³ª´Ù ¤¡¤¤¡Ø'#10'Ê¦') ;
  utf8 := utf8 + #240 ; // 0xF0 #240
  utf8 := utf8 + #159 ; // 0x9F #159
  utf8 := utf8 + #144 ; // 0x90 #144
  utf8 := utf8 + #152 ; // 0x98 #152
  //WriteLn('utf8[', Length(utf8), ']:', UTF8Decode(utf8)) ; // ÄÚ³¢¸® ¶§¹®¿¡ ¾ÈµÊ.
  WriteLn('utf8[', Length(utf8), ']:', TZString.SafeUTF8Decode(utf8)) ;

  tmp8 := TAN62.Encode(utf8) ;
  WriteLn('tmp8[', Length(tmp8), ']:', tmp8) ;

  out8 := TAN62.Decode(tmp8) ;
  //WriteLn('utf8[', Length(out8)), ']:', UTF8Decode(out8)) ; // ÄÚ³¢¸® ¶§¹®¿¡ ¾ÈµÊ.
  WriteLn('utf8[', Length(out8), ']:', TZString.SafeUTF8Decode(out8)) ;

  WriteLn('utf8 = out8 : ', (utf8 = out8)) ;

  ReadLn;
end.