#-*- coding: utf-8 -*-
import base64

class AN62(object) :
    """AN62(AlphaNumeric62, BASE62)란.. 
    Text에서 특수문자를 제거한 숫자(10)+영문대문자(26)+영문소문자(26) = 62가지 문자로 변환하기

    원리 : Text를 UTF8처리한다.
        여기서, Unicode값 : 0 ~ 0xFFFF(65,536가지)까지의 거의 모든 주요 나라 언어 사용한다.
        UTF8은 아래와 같은 Byte범위를 갖는다.
        그럼, 0 ~ 0x7F(127)                 --> 0xxx xxxx                       --> 0x00 ~ 0x7F,
              0x80(128) ~ 0x7FF(2,047)      --> 110x xxxx 10xxx xxxx            --> 0xC0 ~ 0xDF, 0x80 ~ 0xBF
              0x800(2,048) ~ 0xFFFF(65,535) --> 1110 xxxx 10xxx xxxx 10xxx xxxx --> 0xE0 ~ 0xEF, 0x80 ~ 0xBF, 0x80 ~ 0xBF
               그래서, 0x00 ~ 0x7F, 0x80 ~ 0xBF, 0xC0 ~ 0xDF, 0xE0 ~ 0xEF = 0x00 ~ 0xEF (즉, 240가지)
               240의 1승(240^1 = 240), 240의 2승(240^2 = 60,025), 240의 3승(240^3 = 13,824,000)
                61의 1승( 61^1 =  61),  61의 2승( 61^2 =  3,721),  61의 3승( 61^3 =    226,981), 61의 4승(61^4 = 13,845,841)
               즉, 240^3 < 61^4이다. [ BASE64처럼 256^3 = 64^4 구현하면 된다. ]
               
        여기서, 'z'를 Padding으로 사용할 수도 있었으나, 아래와 같이 활용함.
        0xF0 ~ 0xFF을 escape하는 용도로 하여 Binary를 Text화 일반적인 encoding하는데 사용하였다.
        bin2txt()함수
    author : zhangsob@gmail.com
    history : 2020-07-30 만듦.
    """
    _toBase62 = [
                '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
                'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                ]

    @staticmethod
    def encode(text) :
        if not isinstance(text, str) :
            raise TypeError('encode(text is str)')
        utf8 = text.encode('utf8')
        ret = ""
        value = 0
        tmp = ['0', '0', '0', '0']
        #AN62.PrintBinary("utf8", utf8)

        for i in range(0, len(utf8)) :
            val = utf8[i]
            if(val >= 0xF0) :
                for j in range(0, len(text)) :
                    if(ord(text[j]) > 0xFFFF) :
                        raise ValueError("Illegal base62 character index " + str(j) + " " + text[j:j+2])
            
            value = value * 0xF0 + val

            if(i % 3 == 2) :
                for j in range(3, -1, -1) :
                    tmp[j] = AN62._toBase62[value % 61]
                    value = value // 61

                for j in range(0, 4) :
                    ret += tmp[j]

                value = 0
        
        length = len(utf8) % 3
        if(length > 0) :
            for j in range(length, -1, -1) : 
                tmp[j] = AN62._toBase62[value % 61]
                value = value // 61
            
            for j in range(0, length+1) :
                ret += tmp[j]
        
        return ret

    _fromBase62 = [ -1 for i in range(128) ]
    for i in range(len(_toBase62)) :
        _fromBase62[ord(_toBase62[i])] = i
    _fromBase62[ ord('z') ] = -2


    @staticmethod
    def PrintBinary(title, bytes_data) :
        """Standard Out으로 Binary를 Hexa값으로 확인해 보기
        :title: 제목
        :bytes_data: 확인할 Binary Data
        """
        if (type(bytes_data) is str) :
            data = bytes_data.encode()
        elif bytes_data is None :
            data = bytearray([])
        else :
            data = bytearray(bytes_data)

        len_data = len(data)
        print ('------------%s[%d]--------------' % (title, len_data))

        line = ''
        for i in range(len_data) :    
            line += ('%02X ' % data[i])

            if(i % 16 == 15 or len_data-1 == i) :
                print (line)
                line = ''

    @staticmethod
    def decode(text) :
        if not isinstance(text, str) :
            raise TypeError('decode(text is str)')

        length = len(text)
        if(length % 4 == 1) :
            raise ValueError("Illegal base62 length")
        
        dst = bytearray([])
        tmp = [ 0 for i in range(4) ]
        value = 0
        for i in range(length) :
            ch = ord(text[i])
            if(ch >= 0x80) :
                raise ValueError("Illegal base62 character " + text[i])
            
            value = value * 61 + AN62._fromBase62[ch]

            if(i % 4 == 3) :
                for j in range(2, -1, -1) :
                    tmp[j] = value % 0xF0
                    value //= 0xF0

                for j in range(3) :
                    dst.append(tmp[j])
        
        length = length % 4
        if(length > 0) :
            length -= 1
            for j in range(length-1, -1, -1) :
                tmp[j] = value % 0xF0
                value //= 0xF0

            for j in range(length) :
                dst.append(tmp[j])

        return dst.decode('utf8')
    
    @staticmethod
    def bin2txt(bin) :
        if not (isinstance(bin, bytes) or isinstance(bin, bytearray)) :
            raise TypeError('bin2txt(bin is bytes or bytearray)')

        ret = ''
        value = 0
        length = (len(bin) // 3) * 3
        tmp = ['','','','']
        FX_bit = 0

        for i in range(0, length, 3) :
            FX_bit = 0
            value = 0
            
            for j in range(3) :
                if((bin[i+j] & 0xF0) == 0xF0) :
                    FX_bit = 1
                    break

            if (FX_bit != 0) :
                ret += 'z'

                FX_bit = 0
                for j in range(3) :
                    FX_bit <<= 1
                    if((bin[i+j] & 0xF0) == 0xF0) :
                        FX_bit |= 0x01 
                    else :
                        value <<= 4
                        value |= (bin[i+j] >> 4) & 0x0F

                    value <<= 4
                    value |= bin[i+j] & 0x0F

                value |= FX_bit << 20
            else :
                for j in range(3) : 
                    value = value * 0xF0 + (bin[i+j] & 0xFF)

            for j in range(3, -1, -1) :
                tmp[j] = AN62._toBase62[value % 61]
                value //= 61
                
            for j in range(4) :
                ret += tmp[j]

        i = length
        length = len(bin) % 3
        if(length > 0) :
            FX_bit = 0
            value = 0
            for j in range(length) :
                if((bin[i+j] & 0xF0) == 0xF0) :
                    FX_bit <<= 1
                    break

            if (FX_bit != 0) :
                ret += 'z'

                FX_bit = 0
                for j in range(length) :
                    FX_bit <<= 1
                    if((bin[i+j] & 0xF0) == 0xF0) :
                        FX_bit |= 0x01
                    else :
                        value <<= 4
                        value |= (bin[i+j] >> 4) & 0x0F

                    value <<= 4
                    value |= bin[i+j] & 0x0F

                value |= FX_bit << (4 if(length == 1) else 12)
            else :
                for j in range(length) :
                    value = value * 0xF0 + (bin[i+j] & 0xFF)

            for j in range(length, -1, -1) : 
                tmp[j] = AN62._toBase62[value % 61]
                value //= 61

            for j in range(length+1) :
                ret += tmp[j]
            
        return ret

    @staticmethod
    def txt2bin(txt) :
        if not isinstance(txt, str) :
            raise TypeError('txt2bin(txt is str)')

        length = len(txt)
        dst = bytearray([])
        tmp = [ 0 for i in range(4) ]
        value = 0
        count = 0
        isFX = 0

        for i in range(length) : 
            ch = ord(txt[i])
            if(ch >= 0x80) :
                raise ValueError("Illegal base62 character " + chr(ch))
                
            val = AN62._fromBase62[ch]
            if(val < 0) :
                if(val == -2 and (count % 4) == 0 and isFX == 0) :
                    isFX = 1
                    continue

                raise ValueError("Illegal base62 character " + chr(ch))

            count += 1

            value = value * 61 + val
            if(count % 4 == 0) :
                if (isFX != 0) :
                    isFX = value >> 20
                    mask = 1
                    for j in range(2, -1, -1) :
                        tmp[j] = value & 0x0F
                        value >>= 4
                        if ((isFX & mask) == mask) :
                            tmp[j] |= 0xF0
                        else :
                            tmp[j] |= (value & 0x0F) << 4
                            value >>= 4
                        mask <<= 1
                    isFX = 0
                else :
                    for j in range(2, -1, -1) :
                        tmp[j] = value % 0xF0
                        value //= 0xF0

                value = 0
                for j in range(0, 3) :
                    dst.append(tmp[j])

        length = count % 4
        if(length > 0) :
            length -= 1
            if (isFX != 0) :
                isFX = value >> ( 12 if (length >= 2) else 4)
                mask = 1
                for j in range(length-1, -1, -1) :
                    tmp[j] = value & 0x0F
                    value >>= 4
                    if ((isFX & mask) == mask) :
                        tmp[j] |= 0xF0
                    else :
                        tmp[j] |= (value & 0x0F) << 4
                        value >>= 4
                    mask <<= 1
            else :
                for j in range(length-1, -1, -1) :
                    tmp[j] = value % 0xF0
                    value //= 0xF0

            for j in range(length) :
                dst.append(tmp[j])

        return dst

if __name__ == '__main__':
    src0 = 'http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可'
    print('src0:' + src0)
    an62__tmp0 = AN62.encode(src0)
    print('an62__tmp0:' + an62__tmp0)
    an62__out0 = AN62.decode(an62__tmp0)
    print('an62__out0:' + an62__out0)
    base64_tmp = base64.b64encode(src0.encode('utf8')).decode('utf8')
    print('base64_tmp:' + base64_tmp)
    base64_out = base64.b64decode(base64_tmp.encode('utf8')).decode('utf8')
    print('base64_out:' + base64_out)

    src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘" # UnsupportedEncodingException이 발생하는 경우
    print("src1:" + src1)
    try :
        tmp1 = AN62.encode(src1)
        print("tmp1:" + tmp1)
        out1 = AN62.decode(tmp1)
        print("out1:" + out1)
    except ValueError :
        tmp2 = AN62.bin2txt(src1.encode("utf8"))
        print("tmp2:" + tmp2)
        out2 = AN62.txt2bin(tmp2).decode("utf8")
        print("out2:" + out2)