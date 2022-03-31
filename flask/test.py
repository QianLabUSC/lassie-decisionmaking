import requests

user_info = {'name': 'letian', 'password': '123'}
r = requests.post("http://127.0.0.1:5000/process", data=user_info)
