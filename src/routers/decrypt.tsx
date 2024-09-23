import {AES, enc, lib, mode, pad} from 'crypto-ts';


export const DecryptResponse = (encryptedData: string, key: string, iv: string): string => {
    const data = enc.Hex.parse(encryptedData);
    const cipherParams = new lib.CipherParams({
        ciphertext: data,
    })
    const hexKey = enc.Hex.stringify(enc.Utf8.parse(key));
    const keyHex = enc.Hex.parse(hexKey);
    const hexIv = enc.Hex.stringify(enc.Utf8.parse(iv));
    const ivHex = enc.Hex.parse(hexIv);
    const decrypted = AES.decrypt(
            cipherParams,
            keyHex,
            {
                iv: ivHex,
                mode: mode.CBC,
                padding: pad.PKCS7,
            }
        )
    ;

    return decrypted.toString(enc.Utf8);
};