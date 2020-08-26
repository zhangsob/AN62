{ charset : EUC-KR }
program AN62Test;

{$APPTYPE CONSOLE}

uses
  SysUtils,
  AN62 in 'AN62.pas',
  ZString in 'ZString.pas';

var
  wsrc, wout : WideString ;
  wtmp : string ;
  src0, tmp0, out0 : String ;
  utf8, tmp8, out8 : String ;
begin
  Writeln('----------EUC-KR------------') ;
  src0 := 'http://test.com:8080/an62.do?name=°¡³ª´Ù ¤¡¤¤¡Ø'#10'Ê¦' ;
  Writeln('src0[' + IntToStr(Length(src0)) + ']:' + src0) ;
  tmp0 := TAN62.Encode(src0) ;
  Writeln('tmp0:' + tmp0) ;
  out0 := TAN62.Decode(tmp0) ;
  Writeln('out0[' + IntToStr(Length(out0)) + ']:' + out0) ;
  if (src0 = out0) then WriteLn('src0 = out0') ;

  Writeln('----------UTF-8----------') ;
  utf8 := UTF8Encode('http://test.com:8080/an62.do?name=°¡³ª´Ù ¤¡¤¤¡Ø'#10'Ê¦') ;
  Writeln('utf8[' + IntToStr(Length(utf8)) + ']:' + UTF8Decode(utf8)) ;
  tmp8 := TAN62.Encode(utf8) ;
  Writeln('tmp8:' + tmp8) ;
  out8 := UTF8Encode(TAN62.Decode(tmp8)) ;
  Writeln('out8[' + IntToStr(Length(out8)) + ']:' + UTF8Decode(out8)) ;
  if (utf8 = out8) then WriteLn('utf8 = out8') ;

  Writeln('----------WideString------------') ;
  // [ ÄÚ³¢¸® = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
  wsrc := 'http://test.com:8080/an62.do?name=°¡³ª´Ù ¤¡¤¤¡Ø'#10'Ê¦' ;
  wsrc := wsrc + #55357 ; // 0xD83D #55357
  wsrc := wsrc + #56344 ; // 0xDC18 #56344
  Writeln('wsrc[' + IntToStr(Length(wsrc)) + ']:' + wsrc) ;
  wtmp := TAN62.Encode(wsrc) ;
  Writeln('wtmp:' + wtmp) ;
  wout := TAN62.Decode(wtmp) ;
  Writeln('wout[' + IntToStr(Length(wout)) + ']:' + wout) ;
  if (wsrc = wout) then WriteLn('wsrc = wout') ;

  Writeln('----------UTF-8----------') ;
  // [ ÄÚ³¢¸® = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
  utf8 := UTF8Encode('http://test.com:8080/an62.do?name=°¡³ª´Ù ¤¡¤¤¡Ø'#10'Ê¦') ;
  utf8 := utf8 + #240 ; // 0xF0 #240
  utf8 := utf8 + #159 ; // 0x9F #159
  utf8 := utf8 + #144 ; // 0x90 #144
  utf8 := utf8 + #152 ; // 0x98 #152
  //Writeln('utf8[' + IntToStr(Length(utf8)) + ']:' + UTF8Decode(utf8)) ; // ÄÚ³¢¸® ¶§¹®¿¡ ¾ÈµÊ.
  Writeln('utf8[' + IntToStr(Length(utf8)) + ']:' + TZString.WideStringToString(TZString.StringToWideString(utf8, 65001))) ;
  tmp8 := TAN62.Encode(utf8) ;
  Writeln('tmp8:' + tmp8) ;
  out8 := TZString.WideStringToString(TAN62.Decode(tmp8), 65001) ;
  //Writeln('utf8[' + IntToStr(Length(out8)) + ']:' + UTF8Decode(out8)) ; // ÄÚ³¢¸® ¶§¹®¿¡ ¾ÈµÊ.
  Writeln('utf8[' + IntToStr(Length(out8)) + ']:' + TZString.WideStringToString(TZString.StringToWideString(out8, 65001))) ;
  if (utf8 = out8) then WriteLn('utf8 = out8') ;

  ReadLn;
end.