import json
import logging
from flask import Flask, request
from dbutils.pooled_db import PooledDB
import sqlite3

import os.path

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def success(data, columns):
    return json.dumps({'code': 200, 'columns': columns, 'data': data, })


base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = base_dir + os.sep + '.englishLearn'
print(db_path)

POOL = PooledDB(
    creator=sqlite3,  # 使用链接数据库的模块
    maxconnections=100,  # 连接池允许的最大连接数，0和None表示不限制连接数
    mincached=6,  # 初始化时，链接池中至少创建的空闲的链接，0表示不创建
    maxcached=6,  # 链接池中最多闲置的链接，0和None不限制
    check_same_thread=False,
    # maxshared=3,  # 链接池中最多共享的链接数量，0和None表示全部共享。PS: 无用，因为pymysql和MySQLdb等模块的 threadsafety都为1
    # 所有值无论设置为多少，_maxcached永远为0，所以永远是所有链接都共享。
    blocking=True,  # 连接池中如果没有可用连接后，是否阻塞等待。True，等待；False，不等待然后报错
    maxusage=None,  # 一个链接最多被重复使用的次数，None表示无限制
    setsession=[],  # 开始会话前执行的命令列表。如：["set datestyle to ...", "set time zone ..."]
    ping=0,  # 检查是否服务可用。# 如：0 = None = never, 1 = default = whenever it is requested, 2 = when a cursor is created,
    # 4 = when a query is executed, 7 = always
    # closeable=False,  # 如果为False时， conn.close() 实际上被忽略，供下次使用，再线程关闭时，才会自动关闭链接。
    # 如果为True时， conn.close()则关闭链接，那么再次调用pool.connection时就会报错，因为已经真的关闭了连接（pool.steady_connection()可以获取一个新的链接）
    # threadlocal=None,  # 本线程独享值得对象，用于保存链接对象，如果链接对象被重置
    database=db_path
)


class SQLHelper(object):
    @staticmethod
    # 处理关闭连接的功能
    def close(conn, cursor):
        conn.commit()
        cursor.close()
        conn.close()

    @classmethod
    # 处理查找多个的功能
    def fetch_all(cls, sql, args):
        conn = POOL.connection(shareable=False)
        cursor = conn.cursor()
        cursor.execute(sql, args)
        result = cursor.fetchall()
        columns_list = [item[0] for item in cursor.description]
        cls.close(conn, cursor)
        return result, columns_list

    @classmethod
    def update(cls, sql, args):
        conn = POOL.connection(shareable=False)
        cursor = conn.cursor()
        cursor.execute(sql, args)
        conn.commit()
        cls.close(conn, cursor)


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


@app.route('/get_records', methods=['post'])
def get_records():
    params = request.get_json()  # {'type': 2, 'start': '2021/10/13', 'end': '2021/10/15'}
    # print(params)
    logger.info(params)
    start = params['start'] if params['start'] else '2000-01-01'
    end = params['end'] if params['end'] else '2100-01-01'
    sql = 'select * from en_records where learn_date >=? and learn_date <=? '
    type = params['type']
    if type and isinstance(type, int):
        sql += ' and type = %s' % type
    result, columns = SQLHelper.fetch_all(sql, (start, end))
    return success(result, columns)


@app.route('/get_records_min_max_date', methods=['post'])
def get_records_min_max_date():
    result, columns = SQLHelper.fetch_all('select min(er.learn_date),max(er.learn_date) from en_records er limit 1', ())
    return success(result, columns)


if __name__ == '__main__':
    app.run()
