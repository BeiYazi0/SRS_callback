import sqlite3
import os
import random
import re

_dir = os.path.dirname(__file__)
conn = os.path.join(_dir, "data.db")
db_i = sqlite3.connect(conn)
db_i.execute("""CREATE TABLE if not exists cardinfo (
idx INTEGER primary key autoincrement,
app VARCHAR(20),
stream VARCHAR(20),
username VARCHAR(20),
skey VARCHAR(20))""")
db_i.close()


def get_key():
    db = sqlite3.connect(conn)
    xka = db.cursor()
    xka.execute("SELECT * FROM cardinfo")
    result = xka.fetchall()
    xka.close()
    db.close()
    return result


def key_check(app: str, stream: str, username: str, skey: str):
    db = sqlite3.connect(conn)
    xka = db.cursor()
    xka.execute('''SELECT * FROM cardinfo WHERE app='%s' AND stream="%s"''' % (app, stream))
    result = xka.fetchone()
    xka.close()
    db.close()
    if result == None:
        return False
    elif result[3] != username or result[4] != skey:
        return False
    return True


def key_increase(app: str, stream: str, username: str, skey: str):
    db = sqlite3.connect(conn)
    xka = db.cursor()
    xka.execute('''SELECT * FROM cardinfo WHERE app='%s' AND stream="%s"''' % (app, stream))
    result = xka.fetchone()
    xka.close()
    if result == None:
        sql = '''INSERT INTO cardinfo (app,stream,username,skey) VALUES ("%s","%s","%s","%s")''' % (
            app, stream, username, skey)
    else:
        sql = '''UPDATE cardinfo SET username='%s',skey='%s' WHERE app='%s' AND stream="%s"''' % (
            username, skey, app, stream)
    db.execute(sql)
    db.commit()
    db.close()


def key_decrease(app: str, stream: str):
    db = sqlite3.connect(conn)
    xka = db.cursor()
    xka.execute('''SELECT * FROM cardinfo WHERE app='%s' AND stream="%s"''' % (app, stream))
    result = xka.fetchone()
    if result == None:
        return 'app or strean does not exist', 400
    xka.execute('''DELETE FROM cardinfo WHERE app='%s' AND stream="%s"''' % (app, stream))
    db.commit()
    xka.close()
    db.close()
    return 'ok', 200
