import time

import requests

from back_end.app import SQLHelper

YD_URL_PRE = 'http://dict.youdao.com/jsonapi?jsonversion=2&client=mobile&dicts=%7B%22count%22%3A1%2C%22dicts%22%3A%5B%5B%22fanyi%22%5D%5D%7D&q='


def get_phonetic_symbol(word):
    if word is None or len(word.strip()) == 0:
        return
    res = requests.get(YD_URL_PRE + word.split('(')[0])
    # print(res.text)
    phones = res.json()['simple']['word'][0]
    phone_pattern = ' /%s/'
    result = ''
    ukphone = phones.get('ukphone')
    usphone = phones.get('usphone')
    phone = phones.get('phone')
    if ukphone is not None:
        result += phone_pattern % (ukphone,)
    if usphone is not None:
        result += phone_pattern % (usphone,)
    if len(result) > 0:
        return result
    elif phone is not None:
        return phone_pattern % (phone,)
    else:
        return ' /___/'


def add_phonetic_symbol():
    search_sql = 'select er.id,er.example from en_records er where er.phonetic_symbol is null'
    update_sql = "update en_records set phonetic_symbol = ? where id = ?"
    records = SQLHelper.fetch_all(search_sql, ())
    for rid, examples in records[0]:
        phones = []
        for example in examples.strip().split(';'):
            example = example.strip().split(' ')
            if len(example) == 0:
                print(examples)
                return
            phonetic_symbol = get_phonetic_symbol(example[0])
            phones.append(phonetic_symbol)
            time.sleep(1)
        SQLHelper.update(update_sql, (';'.join(phones), rid))
        print('succeeded! id: %s' % (rid,))


if __name__ == '__main__':
    add_phonetic_symbol()
