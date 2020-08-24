{ charset : UTF-8 }
program AN62Test;

{$APPTYPE CONSOLE}

uses
  SysUtils, AN62, ZString, Base62;

var
  src0, tmp0, out0 : String ;
  src1, tmp1, out1 : String ;
  tmp2, out2 : String ;

begin
  src0 := 'http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可' ;
  Writeln('src0[' + IntToStr(Length(src0)) + ']:' + TZString.SafeUTF8Decode(src0)) ;
  tmp0 := TAN62.Encode(src0) ;
  Writeln('tmp0:' + tmp0) ;
  out0 := TAN62.Decode(tmp0) ;
  Writeln('out0:' + TZString.SafeUTF8Decode(out0)) ;

  // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
  src1 := 'http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可🐘' ;    // Exception이 발생하는 경우
  Writeln('src1[' + IntToStr(Length(src1)) + ']:' + TZString.SafeUTF8Decode(src1)) ;
  try
    tmp1 := TAN62.Encode(src1) ;
    Writeln('tmp1:' + tmp1) ;
    out1 := TAN62.Decode(tmp1) ;
    Writeln('out1:' + TZString.SafeUTF8Decode(out1)) ;
  except
    on e: Exception do
    begin
      WriteLn('Exception : ' + e.Message) ;
      tmp2 := TBase62.Encode(TZString.StringToBytes(TZString.SafeUTF8Encode(src1))) ;
      WriteLn('tmp2:' + tmp2) ;
      out2 := TZString.SafeUTF8Decode(TZString.BytesToString(TBase62.Decode(tmp2))) ;
      Writeln('out2:' + out2) ;
    end;
  end;

  ReadLn ;
end.

