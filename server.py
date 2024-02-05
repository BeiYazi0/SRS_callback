import logging
import os
import requests
from flask import Flask, request, redirect, render_template, session
from urllib.parse import urlparse

from data_rw import *

class HttpServer:
    def __init__(self, host='0.0.0.0', port=7777, name="SRS http callback"):
        self.app = Flask(name)
        self.app.config['SECRET_KEY'] = os.urandom(24) # 配置session使用的秘钥
        with self.app.test_request_context():
            session.pop('user_info', None)
        self.host = host
        self.port = port
        self.log = []

    def configure_routes(self):
        # backend
        @self.app.route('/api/info/update', methods=['GET'])
        def update_info():
            data = request.args.to_dict()
            if data['app'] == '' or data['stream'] == '' or data['username'] == '' or data['key'] == '':
                return 'Incomplete Account!', 400
            else:
                key_increase(data['app'], data['stream'], data['username'], data['key'])
                return "ok", 200

        @self.app.route('/api/info/delete', methods=['GET'])
        def delete_info():
            data = request.args.to_dict()
            if data['app'] == '' or data['stream'] == '':
                return 'Incomplete Account!', 400
            else:
                return key_decrease(data['app'], data['stream'])

        @self.app.route('/api/login', methods=['GET'])
        def login_account_check():
            account = request.args.get('account')
            password = request.args.get('password')
            if account == 'admin' and password == '123456':
                session['user_info'] = account
                return 'Account exists', 200
            else:
                return 'Account does not exists', 400

        # frontend
        @self.app.route('/', methods=['POST', 'GET'])
        def default():
            content = {
                "code": 0,
                "service": "SRS http callback",
                "version": "1.0.0",
                "urls": {
                    "api": {
                        "pubish": "推流鉴权",
                        "play": "拉流鉴权"
                    },
                    "srsCallbackLogin": "管理登录"
                }
            }
            return content

        @self.app.route('/srsCallbackLogin', methods=['POST', 'GET'])
        def login_html():
            return render_template("index.html")

        @self.app.route('/config.html', methods=['GET'])
        def config():
            user_info = session.get('user_info')
            if not user_info:
                return redirect('/srsCallbackLogin')
            return render_template('config.html', url="info", data=get_key(), log = self.log)

        # callback
        @self.app.route('/api/publish', methods=['POST'])
        def publish():
            client_request = request.get_json()
            responsecode = '-1'
            print(client_request)
            try:
                client_params = urlparse(client_request['param'])
                token = client_params.query.split("?")
                if len(token) < 2:
                    responsecode = '-1'
                else:
                    username = token[0].split('=')[1]
                    key = token[1].split('=')[1]
                    if not key_check(client_request["app"], client_request["stream"], username, key):
                        kick_url = "http://127.0.0.1:1985/api/v1/clients/" + client_request['client_id']
                        kick_response = requests.delete(kick_url)
                        responsecode = '-1'
                    else:
                        responsecode = '0'
            except Exception as e:
                logging.exception(e)
            self.log.append("type:publish\tapp:%s\tstream:%s\tresponse:%s\t" % (client_request["app"],
                                                                                client_request["stream"], responsecode))
            return responsecode

        @self.app.route('/api/play', methods=['POST'])
        def play():
            client_request = request.get_json()
            responsecode = '-1'
            try:
                client_params = urlparse(client_request['param'])
                token = client_params.query.split("?")
                stream = client_request["stream"]
                if '.' in stream:
                    stream = stream.split('.')[0]
                if len(token) < 2:
                    responsecode = '-1'
                else:
                    username = token[0].split('=')[1]
                    key = token[1].split('=')[1]
                    if not key_check(client_request["app"], stream, username, key):
                        kick_url = "http://127.0.0.1:1985/api/v1/clients/" + client_request['client_id']
                        kick_response = requests.delete(kick_url)
                        responsecode = '-1'
                    else:
                        responsecode = '0'
            except Exception as e:
                logging.exception(e)
            self.log.append("type:play\tapp:%s\tstream:%s\tresponse:%s\t" % (client_request["app"],
                                                                                client_request["stream"], responsecode))
            return responsecode

    def run(self):
        self.configure_routes()
        self.app.run(host=self.host, port=self.port)

