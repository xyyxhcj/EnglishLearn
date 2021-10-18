import json

from flask import Flask, request

# from back_end.db_utils import SQLHelper
from . import db_utils
app = Flask(__name__)


def success(data, columns):
    return json.dumps({'code': 200, 'columns': columns, 'data': data, })


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


@app.route('/get_records', methods=['post'])
def get_records():
    params = request.get_json()  # {'type': 2, 'start': '2021/10/13', 'end': '2021/10/15'}
    print(params)
    start = params['start'] if params['start'] else '2000-01-01'
    end = params['end'] if params['end'] else '2100-01-01'
    sql = 'select * from en_records where learn_date >=? and learn_date <=? '
    type = params['type']
    if type and isinstance(type, int):
        sql += ' and type = %s' % type
    result, columns = db_utils.SQLHelper.fetch_all(sql,(start, end))
    return success(result, columns)


@app.route('/get_records_min_max_date', methods=['post'])
def get_records_min_max_date():
    result, columns = db_utils.SQLHelper.fetch_all('select min(er.learn_date),max(er.learn_date) from en_records er limit 1', ())
    return success(result, columns)


if __name__ == '__main__':
    app.run()
