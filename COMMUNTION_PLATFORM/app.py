# import necessary imports
import json
import socket
import uuid
import atexit
import redis
from flask import Flask, render_template, request, redirect
from flask_cors import cross_origin
from flask_socketio import SocketIO, join_room, leave_room, close_room

PORT = 5000  # default flask app
IP = host = socket.gethostbyname(socket.gethostname())  # gets local newtork IP
VIGINERE_KEY_COUNT = 3
NAMES = 0
IDS = 1
VALID_RESPONCE = 'OK'

REDIS_PORT = 6379  # default redis port
comma = ','
app = Flask(__name__)  # init flask_app

app.config['SECRET_KEY'] = 'ARIEL-YATSKAN-GOAT'  # flask-app-configuration
app.secret_key = 'your-secret-key'

sio = SocketIO(app, cors_allowed_origins="*")  # emit the SocketIO server and bind it the the flask-app-url

# Create a Redis object using the connection pool
r = redis.Redis(port=REDIS_PORT, host='localhost', db=0)  # init a redis-cli


@app.route('/')  # entrypoint for the app
@cross_origin()
def home():
    return render_template('index.html')


@app.route('/back')  # flask endpooint that navigates the users back to homepage
@cross_origin()
def undo():
    return redirect('/')


@app.route('/direct_to')  # flask route the navigates the users to create room page or join room page based on
# his choice in the homescreen
@cross_origin()
def nav():
    if request.args.get('CreateRoom'):
        return render_template('create.html')
    if request.args.get('JoinRoom'):
        return render_template('join.html')


def gen_room_id():  # function that generated the unique room ID
    room_id = uuid.uuid4()
    room_id = str(room_id)
    room_id = room_id[:8]
    if check_valid(room_id):
        return room_id
    else:
        return gen_room_id()


def check_valid(key):  # check if key stands with the conditions (at least 4 digist, for the enryption at the forntend)
    count = 0

    for c in key:
        if c.isdigit():
            count += 1
    if count > VIGINERE_KEY_COUNT:
        return True
    return False


@app.route('/chat')  # main routing endpoint , navigates the user to the chat room with the roomID, username,
# Host and the network's IP as dynamic params in the template, saves his personal data in the redisDB
# handle cases where user's input is not valid (missing data or not valid data
@cross_origin()
def enter_chat():
    f_create = request.args.get('username_From_Create')
    f_join = request.args.get('username_From_Join')
    room_id = request.args.get('ROOM_ID')

    if f_create and comma not in f_create and not f_create == 'NaN':

        room_id = gen_room_id()
        lists = [[], []]
        lists[NAMES].append(f_create)
        json_lst = json.dumps(lists)
        r.set(room_id, json_lst)

        return render_template('chat.html', username=f_create, room=room_id, host_name=f_create, IP_addr=IP)
    elif f_create:
        error_response = "<script>const error ='ERROR: username cant contain , symbol or be NaN'; alert(error)</script>"
        render = render_template('create.html')
        res = error_response + render
        return res

    elif room_id and f_join:
        if comma in f_join or f_join == 'NaN':
            error_response = "<script>const error ='ERROR: username cant contain , symbol or be NaN'; alert(error)</script>"
            render = render_template('join.html')
            res = error_response + render
            return res
        if r.exists(room_id):
            json_lst = r.get(room_id)
            lists = json.loads(json_lst)

            if f_join in lists[NAMES]:

                err_response = "<script>const error ='ERROR: USERNAME TAKEN'; alert(error)</script>"
                render = render_template('join.html')
                res = err_response + render
                return res
            else:
                user_lst = lists[NAMES]
                host_name = user_lst[0]
                lists[NAMES].append(f_join)
                r.set(room_id, json.dumps(lists))
                print('its false2')

                return render_template('chat.html', username=f_join, room=room_id, host_name=host_name, IP_addr=IP)

        else:

            error_response = "<script>const error ='ERROR: invalid ROOM id'; alert(error)</script>"
            render = render_template('join.html')
            res = error_response + render
            return res
    if f_join:
        error_response = "<script>const error ='ERROR: No ROOM id entered'; alert(error)</script>"
        render = render_template('join.html')
        res = error_response + render
        return res
    if room_id:
        error_response = "<script>const error ='ERROR: No username entered'; alert(error)</script>"
        render = render_template('join.html')
        res = error_response + render
        return res
    else:

        req_url = request.url
        create_url = f'https://{IP}:{PORT}/chat?username_From_Create='
        join_url = f'https://{IP}:{PORT}/chat?username_From_Join=&ROOM_ID='
        if req_url == create_url:
            error_response = "<script>const error ='ERROR: No username entered'; alert(error)</script>"
            render = render_template('create.html')
            res = error_response + render
            return res
        if req_url == join_url:
            error_response = "<script>const error ='ERROR: No username or ROOM id entered'; alert(error)</script>"
            render = render_template('join.html')
            res = error_response + render
            return res
    return VALID_RESPONCE


@sio.on('join_room')
@cross_origin()
def handle_join_room_event(data):
    # socket route that handles new connections
    # saves the socket connecction to the room, andn save his socketId in the redis DB

    app.logger.info("{} has joined room {}".format(data['username'], data['room']))
    join_room(data['room'])

    json_lst = r.get(data['room'])
    lists = json.loads(json_lst)

    lists[IDS].append(request.sid)
    lists[NAMES].remove(data['username'])
    data['users'] = lists[NAMES]
    sio.emit('load_members', data, room=request.sid)
    # emits an event that will add the preexisitng members in the room to the current members list
    lists[NAMES].append(data['username'])
    json_lst = json.dumps(lists)
    r.set(data['room'], json_lst)

    sio.emit('join_room_announcement', data, room=data['room'])
    # emits an event that add a welcome greet to all the client's DOM (all the  clients in shared room)
    return VALID_RESPONCE


def IndexInData(username, room_id):
    # function that returns the index of the user in the room (used for getting SID of the client
    # as it's sharing the index
    json_lst = r.get(room_id)
    lists = json.loads(json_lst)
    if username in lists[NAMES]:
        index = lists[NAMES].index(username)
        return index
    else:
        return -1


def update_db(indexOf, room_id):
    # a function that takes the index of a user and its roomID   and does the following:
    json_lst = r.get(room_id)
    lists = json.loads(json_lst)
    lists[NAMES].remove(lists[NAMES][indexOf])  # remove his name from name lists
    lists[IDS].remove(lists[IDS][indexOf])  # remove his sid from sid lists
    r.set(room_id, json.dumps(lists))  # saves the changes


@sio.on('leave_room')
@cross_origin()
def handle_disconnect(data):
    username = data['username']
    # socket route that handle disconnections (not kicks!)
    app.logger.info("{} has left room {}".format(username, data['room']))
    room_id = data['room']
    indexOf = IndexInData(username, room_id)  # gets the user index in the DB
    update_db(indexOf, data['room'])  # removes the user from the DB
    json_lst = r.get(room_id)
    lists = json.loads(json_lst)
    if len(lists[NAMES]) == 0:  # closes the socket room and erases the data from the DB if
        # no users are left in the  room
        r.delete(room_id)
        leave_room(room_id)
        close_room(room_id)
    else:
        r.set(room_id, json.dumps(lists))
    data['kicked'] = False
    # emits a socket event that ill remove the user from current members and add a goodbye msg to the DOM.
    data['disconnect-announcement'] = f"god damm it. why  {username}  had to leave :((("
    sio.emit('leave_room_announcement', data, room=data['room'], include_self=False)

    return VALID_RESPONCE


@sio.on('kick-member')
@cross_origin()
# socket route that handles host kicks
def kick(data):
    room_id = data['room']
    to_b_kicked = data['kick_name']

    index = IndexInData(to_b_kicked, room_id)
    sid = getSID(room_id, index)  # gets the kicked client socket SID
    sio.emit('kick', room=sid)  # emits a kick event to that client
    return VALID_RESPONCE


@sio.on('mute-member')
@cross_origin()
def force_mute(data):
    # socket route that handle host mutes
    room_id = data['room']
    to_b_muted = data['mute_name']
    index = IndexInData(to_b_muted, room_id)
    sid = getSID(room_id, index)  # gets the sid of the client that about to be muted
    sio.emit('force-mute', room=sid)  # emit a mute event to that client
    return VALID_RESPONCE


def getSID(roomId, index):
    # a function that takes the roomID and the index of a member and returns his sid
    json_lst = r.get(roomId)
    lists = json.loads(json_lst)
    sid = lists[IDS][index]
    return sid


@sio.on('post_kick')
@cross_origin()
def remove(data):
    # a function that handles user kicks
    username = data['username']
    app.logger.info("{} was kicked by {} in room".format(username, data['host'], data['room']))
    room_id = data['room']
    index = IndexInData(username, room_id)
    update_db(index, room_id)  # removes the kicked user from the DB
    data['kick-announcement'] = f"{username} was removed from the room"
    data['kicked'] = True
    sio.emit('leave_room_announcement', data, room=data['room'], include_self=False)
    # emits a event that will inform the users that a client  been kicked from the room (in the history log)
    return VALID_RESPONCE


@sio.on('send message')
@cross_origin()
def send_msg(data):
    # socket route that handles new message from a client
    # send the message emits an event for all clients in the room that add the message to the DOM
    app.logger.info("{} has sent: {} to room: {}".format(data['username'], data['msg'], data['room']))
    sio.emit('receive_message', data=data, room=data['room'])

    return VALID_RESPONCE


@sio.on('pass-host')
@cross_origin()
def handle_pass_host_event(data):
    # socket route that handles passing the host
    username = data['username']
    room_id = data['room']
    json.loads(r.get(room_id))

    if not username == 'NaN':

        index = IndexInData(username, room_id)
    else:
        index = 1
    # gets the index of the user in DB. index=1 if a name has not been entered

    if not index == -1:
        newHostID = getSID(room_id, index)
        # getting the SID of the index user
        sio.emit('grant-host', room=newHostID)
        # emit an event that will grant the new host host permission in the client side.
    return VALID_RESPONCE


def clearDB():  # flush db
    r.flushdb()


atexit.register(clearDB)  # atexit calls clearDB when the server is terminated

if __name__ == '__main__':
    sio.run(app, host=IP, port=PORT, debug=True, allow_unsafe_werkzeug=True,
            ssl_context=('SSL/cert.pem', 'SSL/key.pem'))
    # running the SocketIO server and the flask app wit SSL keys on the local network over HTTPS
