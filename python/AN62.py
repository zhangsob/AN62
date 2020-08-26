#-*- coding: utf-8 -*-
import base64

class AN62(object) :
    """AN62(AlphaNumeric62)란.. 
    Text에서 특수문자를 제거한 숫자(10)+영문대문자(26)+영문소문자(26) = 62가지 문자로 변환하기

    원리 : Text를 UTF8처리한다.

           UTF8은 아래와 같은 Byte범위를 갖는다.
           그럼, 0x000000 ~ 0x00007F --> 0xxx xxxx                               --> 0x00 ~ 0x7F,
                 0x000080 ~ 0x0007FF --> 110x xxxx 10xx xxxx                     --> 0xC0 ~ 0xDF, 0x80 ~ 0xBF
                 0x000800 ~ 0x00FFFF --> 1110 xxxx 10xx xxxx 10xx xxxx           --> 0xE0 ~ 0xEF, 0x80 ~ 0xBF, 0x80 ~ 0xBF
                 0x010000 ~ 0x10FFFF --> 1111 0zzz 10zz xxxx 10xx xxxx 10xx xxxx --> 0xF0 ~ 0xF4, 0x80 ~ 0xBF, 0x80 ~ 0xBF, 0x80 ~ 0xBF
           그래서, 0x00 ~ 0x7F, 0x80 ~ 0xBF, 0xC0 ~ 0xDF, 0xE0 ~ 0xEF, 0xF0 ~ 0xF4 = 0x00 ~ 0xF4 (즉, 245가지)
                 245의 1승(245^1 =   245), 245의 2승(245^2 =  60,025), 245의 3승(245^3 = 14,706,125)
                  62의 2승( 62^2 = 3,844),  62의 3승( 62^3 = 238,328),  62의 4승( 62^4 = 14,778,336)
           즉, 245^3 < 62^4이다. [ BASE64(256^3 = 64^4)처럼 구현하면 된다. ]

           Binary To String Encoding은 https://github.com/zhansgsob/Base62 를 참조.

    author     zhangsob@gmail.com

    history    2020-08-25 encode(), decode() 만듦.
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
            if(val >= 0xF5) :
                raise ValueError("invalid UTF8 character")
            
            value = value * 0xF5 + val

            if(i % 3 == 2) :
                for j in range(3, -1, -1) :
                    tmp[j] = AN62._toBase62[value % 62]
                    value = value // 62

                for j in range(0, 4) :
                    ret += tmp[j]

                value = 0
        
        length = len(utf8) % 3
        if(length > 0) :
            for j in range(length, -1, -1) : 
                tmp[j] = AN62._toBase62[value % 62]
                value = value // 62
            
            for j in range(0, length+1) :
                ret += tmp[j]
        
        return ret

    _fromBase62 = [ -1 for i in range(128) ]
    for i in range(len(_toBase62)) :
        _fromBase62[ord(_toBase62[i])] = i

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
            raise ValueError("invalid AN62 length")
        
        dst = bytearray([])
        tmp = [ 0 for i in range(4) ]
        value = 0
        for i in range(length) :
            ch = ord(text[i])
            if(ch >= 0x80) :
                raise ValueError("invalid AN62 character " + text[i])
            
            value = value * 62 + AN62._fromBase62[ch]

            if(i % 4 == 3) :
                for j in range(2, -1, -1) :
                    tmp[j] = value % 0xF5
                    value //= 0xF5

                for j in range(3) :
                    dst.append(tmp[j])
        
        length = length % 4
        if(length > 0) :
            length -= 1
            for j in range(length-1, -1, -1) :
                tmp[j] = value % 0xF5
                value //= 0xF5

            for j in range(length) :
                dst.append(tmp[j])

        return dst.decode('utf8')

if __name__ == '__main__':
    src0 = 'http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可'
    print('src0['+str(len(src0))+']:' + src0)
    an62__tmp0 = AN62.encode(src0)
    print('an62__tmp0:' + an62__tmp0)
    an62__out0 = AN62.decode(an62__tmp0)
    print('an62__out0:' + an62__out0)
    base64_tmp = base64.b64encode(src0.encode('utf8')).decode('utf8')
    print('base64_tmp:' + base64_tmp)
    base64_out = base64.b64decode(base64_tmp.encode('utf8')).decode('utf8')
    print('base64_out:' + base64_out)

    # [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
    src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘"
    print("src1:["+str(len(src1))+"]" + src1)
    tmp1 = AN62.encode(src1)
    print("tmp1:" + tmp1)
    out1 = AN62.decode(tmp1)
    print("out1:" + out1)

    if(src1 == out1) :
        print("src1 == out1")
